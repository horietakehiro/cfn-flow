import json
import os
from time import sleep
import boto3
from boto3.dynamodb.conditions import Key
from pytest_mock import mocker

from list_flows import (
    ResponseBody,
    list_flows,
    lambda_handler,
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
    flows_table = dynamo.Table(FLOW_TABLE_NAME)
    flows_table.put_item(
        Item={
            "name": NEW_ITEM_NAME,
            "description": "this is new flow",
            "httpUrl": TEST_YAML_FLOW_HTTP_URL,
            "s3Url": utils.convert_http_to_s3(TEST_YAML_FLOW_HTTP_URL),
            "createAt": utils.strftime(utils.get_current_dt()),
            "updateAt": "-",
        }
    )
    flows_table.put_item(
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

def test_list_flows_no_next():
    flows, next_token = list_flows()

    assert next_token is None
    assert len(flows) > 1

def test_list_flows_has_next():
    flows, next_token = list_flows(limit=1)
    assert next_token is not None
    assert len(flows) == 1

    next_flows, _ = list_flows(limit=1, next_token=next_token)
    assert next_flows[0]["name"] != flows[0]["name"]


def test_lambda_handler_success_no_next():
    event = {}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["flows"] is not None and len(ret_body["flows"]) > 1
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
    assert ret_body["flows"] is not None and len(ret_body["flows"]) == 1
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
    assert ret_body["flows"] is not None and len(ret_body["flows"]) == 1
    assert ret_body["flows"][0]["name"] != next_token


def test_lambda_handler_fail(mocker):
    event = {}

    mocker.patch("list_flows.list_flows", side_effect=Exception)
    response = lambda_handler(event, None)

    assert response["statusCode"] == 500
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is not None and ret_body["error"] == "list flows failed"
    assert ret_body["flows"] is None
    assert ret_body["nextToken"] is None