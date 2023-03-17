import json
import os
from time import sleep
import boto3
from boto3.dynamodb.conditions import Key
from pytest_mock import mocker

from list_templates import (
    ResponseBody,
    list_templates,
    lambda_handler,
)
import utils
import pytest

TEMPLATE_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_TABLE_NAME"]
TEMPLATE_SUMMARY_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_SUMMARY_TABLE_NAME"]
BUCKET_NAME=os.environ["S3_TEMPLATE_BUCKET_NAME"]

TEST_YAML_TEMPLATE_HTTP_URL=f"https://{BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/test/template.yaml"

NEW_ITEM_NAME="new-test-template"
EXISTING_ITEM_NAME="existing-test-template"

def setup_module(module):
    # upload test template file
    for url in [TEST_YAML_TEMPLATE_HTTP_URL]:
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

def test_list_templates_no_next():
    templates, next_token = list_templates()

    assert next_token is None
    assert len(templates) > 1

def test_list_templates_has_next():
    templates, next_token = list_templates(limit=1)
    assert next_token is not None
    assert len(templates) == 1

    next_templates, _ = list_templates(limit=1, next_token=next_token)
    assert next_templates[0]["name"] != templates[0]["name"]


def test_lambda_handler_success_no_next():
    event = {}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["templates"] is not None and len(ret_body["templates"]) > 1
    assert ret_body["nextToken"] is None

def test_lambda_handler_success_has_next():
    event = {
        "queryStringParameters": {
            "limit": 1,
        }
    }

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["templates"] is not None and len(ret_body["templates"]) == 1
    assert ret_body["nextToken"] is not None

    next_token = ret_body["nextToken"]
    event = {
        "queryStringParameters": {
            "limit": 1,
            "next-token": next_token,
        }
    }
    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["templates"] is not None and len(ret_body["templates"]) == 1
    assert ret_body["templates"][0]["name"] != next_token

def test_lambda_handler_fail(mocker):
    event = {}

    mocker.patch("list_templates.list_templates", side_effect=Exception)
    response = lambda_handler(event, None)

    assert response["statusCode"] == 500
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is not None and ret_body["error"] == "list templates failed"
    assert ret_body["templates"] is None
    assert ret_body["nextToken"] is None