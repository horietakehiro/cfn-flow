import json
import os
from time import sleep
import boto3
from boto3.dynamodb.conditions import Key
from pytest_mock import mocker

from put_template import (
    ResponseBody, get_template_body, parse_outputs, parse_parameters, parse_resources, upsert_template, upsert_template_summaries,
    lambda_handler,
    RequestBody
)
import utils
import pytest

TEMPLATE_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_TABLE_NAME"]
TEMPLATE_SUMMARY_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_SUMMARY_TABLE_NAME"]
BUCKET_NAME=os.environ["S3_TEMPLATE_BUCKET_NAME"]

TEST_YAML_TEMPLATE_HTTP_URL=f"https://{BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/test/template.yaml"
TEST_JSON_TEMPLATE_HTTP_URL=f"https://{BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/test/template.json"

NEW_ITEM_NAME="new-test-template"
EXISTING_ITEM_NAME="existing-test-template"

def setup_module(module):
    # upload test template file
    for url in [TEST_YAML_TEMPLATE_HTTP_URL, TEST_JSON_TEMPLATE_HTTP_URL]:
        basename = url.split("/")[-1]
        filepath = os.path.join(os.path.dirname(__file__), basename)
        s3 = boto3.client("s3")
        s3.upload_file(filepath, BUCKET_NAME, f"test/{basename}")

    dynamo = boto3.resource("dynamodb")
    template_table = dynamo.Table(TEMPLATE_TABLE_NAME)
    # delete new item
    template_table.delete_item(
        Key={"name": NEW_ITEM_NAME}
    )
    # create existing item
    template_table.put_item(
        Item={
            "name": EXISTING_ITEM_NAME,
            "description": "this is existing template",
            "httpUrl": TEST_YAML_TEMPLATE_HTTP_URL,
            "s3Url": utils.convert_http_to_s3(TEST_YAML_TEMPLATE_HTTP_URL),
            "createAt": utils.strftime(utils.get_current_dt()),
            "updateAt": "-",
        }
    )


def teardown_module(module):
    pass


def test_get_template_body_yaml():
    body = get_template_body(TEST_YAML_TEMPLATE_HTTP_URL)

    assert isinstance(body, dict)
    assert body["Description"] != ""

def test_get_template_body_json():
    body = get_template_body(TEST_JSON_TEMPLATE_HTTP_URL)

    assert isinstance(body, dict)
    assert body["Description"] != ""


def test_upsert_template_create():
    req_body:RequestBody = {
        "name": NEW_ITEM_NAME,
        "description": "this is new test template",
        "httpUrl": TEST_YAML_TEMPLATE_HTTP_URL,
    }

    ret_item = upsert_template(req_body)

    assert ret_item["updateAt"] == "-"

def test_upsert_template_update():
    sleep(1.)
    req_body:RequestBody = {
        "name": EXISTING_ITEM_NAME,
        "description": "this is new test template",
        "httpUrl": TEST_YAML_TEMPLATE_HTTP_URL,
    }

    ret_item = upsert_template(req_body)

    assert ret_item["updateAt"] != ret_item["createAt"] and ret_item["updateAt"] != "-"
    

def test_upsert_template_summaries():
    req_body:RequestBody = {
        "name": NEW_ITEM_NAME,
        "description": "this is new test template",
        "httpUrl": TEST_YAML_TEMPLATE_HTTP_URL,
    }
    body = get_template_body(TEST_YAML_TEMPLATE_HTTP_URL)

    summaries = upsert_template_summaries(req_body, body)

    assert "SYSTEM" in utils.jdumps(dict(summaries["Parameters"]))
    assert "AWS::EC2::VPC" in utils.jdumps(dict(summaries["Resources"]))
    assert "exportName" in utils.jdumps(dict(summaries["Outputs"]))


def test_lambda_handler_success():
    req_body:RequestBody = {
        "name": NEW_ITEM_NAME,
        "description": "this is new test template",
        "httpUrl": TEST_YAML_TEMPLATE_HTTP_URL,
    }
    event = {"body": utils.jdumps(dict(req_body))}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["template"] is not None and ret_body["template"]["name"] == NEW_ITEM_NAME

def test_lambda_handler_fail_invalid_request_body():
    req_body:RequestBody = {
        "name": NEW_ITEM_NAME,
        "description": "this is new test template",
        "httpUrl": TEST_YAML_TEMPLATE_HTTP_URL,
    }
    event = {"body": req_body}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 400
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is not None and ret_body["error"] == "invalid request body received"
    assert ret_body["template"] is None



def test_lambda_handler_fail_template_validation_failed():
    req_body:RequestBody = {
        "name": NEW_ITEM_NAME,
        "description": "this is new test template",
        "httpUrl": TEST_YAML_TEMPLATE_HTTP_URL.replace("template.yaml", "not-exist.yaml"),
    }
    event = {"body": utils.jdumps(dict(req_body))}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 500
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is not None and ret_body["error"] == "template validation failed"
    assert ret_body["template"] is None

def test_lambda_handler_fail_template_creation_failed():
    req_body = {
        # "name": NEW_ITEM_NAME,
        "description": "this is new test template",
        "httpUrl": TEST_YAML_TEMPLATE_HTTP_URL,
    }
    event = {"body": utils.jdumps(dict(req_body))}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 500
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is not None and ret_body["error"] == "template creation failed"
    assert ret_body["template"] is None

def test_lambda_handler_fail_template_summaries_creation_failed(mocker):
    req_body = {
        "name": NEW_ITEM_NAME,
        "description": "this is new test template",
        "httpUrl": TEST_YAML_TEMPLATE_HTTP_URL,
    }
    event = {"body": utils.jdumps(dict(req_body))}

    mocker.patch("put_template.upsert_template_summaries", side_effect=Exception)
    response = lambda_handler(event, None)

    assert response["statusCode"] == 500
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is not None and ret_body["error"] == "template summaries creation failed"
    assert ret_body["template"] is None


def test_parse_parameters():
    cfn_parameters = {
        "param1": {
            "Type": "String",
        },
        "param2": {
            "Type": "String",
            "Default": "val2",
            "Description": "this is descirption",
            "AllowedPattern": "val.*",
            "AllowedValues": [
                "val1", "val2",
            ],
            "ConstraintDescription": "this is constraint descirption",
            "MaxLength": 10,
            "MinLength": 0,
            "NoEcho": True,
        },
        "param3": {
            "Type": "Number",
            "Default": 3,
            "MaxValue": 10,
            "MinValue": 0
        }
    }
    parameters = parse_parameters(cfn_parameters)

    assert len(parameters) == 3

def test_parse_resources():
    cfn_resources = {
        "r1": {
            "Type": "AWS::EC2::VPC",
            "Properties": {}
        },
        "r2": {
            "Type": "Custom::SomeResource",
            "Properties": {}
        }
    }

    resources = parse_resources(cfn_resources)

    assert len(cfn_resources) == 2

def test_parse_outputs():
    cfn_outputs = {
        "o1": {
            "Value": "val1"
        },
        "o2": {
            "Description": "this is description",
            "Value": {
                "Ref": "VPC"
            },
            "Export": {
                "Name": {
                    "Ref": "VPC"
                }
            }
        }
    }

    outputs = parse_outputs(cfn_outputs)

    assert len(outputs) == 2
    for o in outputs:
        if o["exportName"] is not None:
            assert isinstance(o["exportName"], str)
        assert isinstance(o["value"], str)
