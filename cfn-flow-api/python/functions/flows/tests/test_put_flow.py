import json
import os
from time import sleep
import boto3
from boto3.dynamodb.conditions import Key
from pytest_mock import mocker

from put_flow import (
    ResponseBody, upsert_flow, validate_flow_body, create_new_flow_file,
    lambda_handler,
    RequestBody
)
import utils
import pytest

FLOW_TABLE_NAME=os.environ["DYNAMO_FLOW_TABLE_NAME"]
BUCKET_NAME=os.environ["S3_FLOW_BUCKET_NAME"]

TEST_YAML_FLOW_HTTP_URL=f"https://{BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/test/flow.yaml"
TEST_JSON_FLOW_HTTP_URL=f"https://{BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/test/flow.json"


NEW_ITEM_NAME="new-test-flow"
EXISTING_ITEM_NAME="existing-test-flow"

def setup_module(module):
    dynamo = boto3.resource("dynamodb")
    flow_table = dynamo.Table(FLOW_TABLE_NAME)
    # delete new item
    flow_table.delete_item(
        Key={"name": NEW_ITEM_NAME}
    )
    # create existing item
    flow_table.put_item(
        Item={
            "name": EXISTING_ITEM_NAME,
            "description": "this is existing flow",
            "httpUrl": TEST_YAML_FLOW_HTTP_URL,
            "s3Url": utils.convert_http_to_s3(TEST_YAML_FLOW_HTTP_URL),
            "createAt": utils.strftime(utils.get_current_dt()),
            "updateAt": "-",
        }
    )


def teardown_module(module):
    pass

@pytest.mark.skip(reason="not implemented")
def test_validate_flow_body_valid():
    pass
@pytest.mark.skip(reason="not implemented")
def test_validate_flow_body_invalid():
    pass

def test_create_new_flow_file():
    http_url = create_new_flow_file("test-flow")
    s3_url = utils.convert_http_to_s3(http_url)

    bucket, key = s3_url.replace("s3://", "").split("/", 1)
    s3 = boto3.client("s3")
    res = s3.get_object(Bucket=bucket, Key=key)

    assert res["ResponseMetadata"]["HTTPStatusCode"] == 200

def test_upsert_flow_no_url():    
    req_body:RequestBody = {
        "name": NEW_ITEM_NAME,
        "description": None,
        "httpUrl": None,
    }
    ret_item = upsert_flow(req_body)

    assert ret_item["updateAt"] == "-"
    assert ret_item["httpUrl"] is not None

def test_upsert_flow_with_url():    
    req_body:RequestBody = {
        "name": NEW_ITEM_NAME,
        "description": None,
        "httpUrl": TEST_JSON_FLOW_HTTP_URL,
    }
    ret_item = upsert_flow(req_body)

    assert ret_item["updateAt"] != "-"
    assert ret_item["httpUrl"] == TEST_JSON_FLOW_HTTP_URL

def test_lambda_handler_success():
    req_body:RequestBody = {
        "name": NEW_ITEM_NAME,
        "description": "this is new test flow",
        "httpUrl": None,
    }
    event = {"body": utils.jdumps(dict(req_body))}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["flow"] is not None and ret_body["flow"]["name"] == NEW_ITEM_NAME


def test_lambda_handler_fail_invalid_request_body():
    req_body:RequestBody = {
        "name": NEW_ITEM_NAME,
        "description": "this is new test flow",
        "httpUrl": TEST_JSON_FLOW_HTTP_URL,
    }
    event = {"body": req_body}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 400
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is not None and ret_body["error"] == "invalid request body received"
    assert ret_body["flow"] is None


def test_lambda_handler_fail_flow_creation_failed(mocker):
    mocker.patch("put_flow.upsert_flow", side_effect=Exception)
    req_body = {
        "name": NEW_ITEM_NAME,
        "description": "this is new test flow",
        "httpUrl": None,
    }
    event = {"body": utils.jdumps(dict(req_body))}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 500
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is not None and ret_body["error"] == "flow creation failed"
    assert ret_body["flow"] is None

