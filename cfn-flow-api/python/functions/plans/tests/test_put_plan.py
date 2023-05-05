import json
import os
from time import sleep

import boto3
import pytest
import utils
from boto3.dynamodb.conditions import Key
from put_plan import RequestBody, ResponseBody, lambda_handler, upsert_plan
from pytest_mock import mocker

PLAN_TABLE_NAME=os.environ["DYNAMO_FLOW_PLANS_TABLE_NAME"]
BUCKET_NAME=os.environ["S3_FLOW_BUCKET_NAME"]

TEST_YAML_FLOW_HTTP_URL=f"https://{BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/test/flow.yaml"
TEST_JSON_FLOW_HTTP_URL=f"https://{BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/test/flow.json"


NEW_ITEM_NAME="new-test-plan"
EXISTING_ITEM_NAME="existing-test-plan"

def setup_module(module):
    pass

def teardown_module(module):
    pass

def test_upsert_plan():    
    req_body:RequestBody = {
        "planName": NEW_ITEM_NAME,
        "description": None,
        "direction": "forward",
        "flowName": "test-flow",
        "lastStatus": "unused",
    }
    ret_item = upsert_plan(req_body)
    assert ret_item["lastStatus"] == "unused"


def test_lambda_handler_success():
    req_body:RequestBody = {
        "planName": NEW_ITEM_NAME,
        "description": None,
        "direction": "forward",
        "flowName": "test-flow",
        "lastStatus": "unused",
    }

    event = {"body": utils.jdumps(dict(req_body))}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["plan"] is not None and ret_body["plan"]["planName"] == NEW_ITEM_NAME


def test_lambda_handler_fail_invalid_request_body():
    req_body = "body"
    event = {"body": req_body}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 400
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is not None and "invalid request body received" in ret_body["error"]
    assert ret_body["plan"] is None


def test_lambda_handler_fail_plan_creation_failed(mocker):
    mocker.patch("put_plan.upsert_plan", side_effect=Exception)
    req_body = {}
    event = {"body": utils.jdumps(dict(req_body))}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 500
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is not None and "plan creation failed" in ret_body["error"]
    assert ret_body["plan"] is None


