import json
import os
import typing
from time import sleep

import boto3
import pytest
import utils
from boto3.dynamodb.conditions import Key
from list_plans import ResponseBody, lambda_handler, list_plans
from plans_common import Plan
from pytest_mock import mocker

PLAN_TABLE_NAME=os.environ["DYNAMO_FLOW_PLANS_TABLE_NAME"]

NEW_ITEM_NAME="new-test-plan"
EXISTING_ITEM_NAME="existing-test-plan"
FLOW_NAME="test-flow"
OTHER_FLOW_NAME="other-flow"

def setup_module(module):
    dynamo = boto3.resource("dynamodb")
    plans_table = dynamo.Table(PLAN_TABLE_NAME)
    item1:Plan = {
        "flowName": FLOW_NAME,
        "planName": NEW_ITEM_NAME,
        "description": None,
        "direction": "backward",
        "lastStatus": "completed",
    }
    item2:Plan = {
        "flowName": FLOW_NAME,
        "planName": EXISTING_ITEM_NAME,
        "description": None,
        "direction": "backward",
        "lastStatus": "completed",
    }
    item3:Plan = {
        "flowName": OTHER_FLOW_NAME,
        "planName": EXISTING_ITEM_NAME,
        "description": None,
        "direction": "backward",
        "lastStatus": "completed",
    }

    plans_table.put_item(Item=typing.cast(typing.Mapping[typing.Any, typing.Any], item1))
    plans_table.put_item(Item=typing.cast(typing.Mapping[typing.Any, typing.Any], item2))
    plans_table.put_item(Item=typing.cast(typing.Mapping[typing.Any, typing.Any], item3))


def teardown_module(module):
    pass

def test_list_plans_no_next():
    plans, next_token = list_plans(FLOW_NAME)

    assert next_token is None
    assert len(plans) > 1
    assert OTHER_FLOW_NAME not in [p["flowName"] for p in plans]

def test_list_plans_has_next():
    plans, next_token = list_plans(FLOW_NAME ,limit=1)
    assert next_token is not None
    assert len(plans) == 1

    next_plans, _ = list_plans(FLOW_NAME, limit=1, next_token=next_token)
    assert next_plans[0]["planName"] != plans[0]["planName"]


def test_lambda_handler_success_no_next():
    event = {
        "pathParameters": {
            "flowName": FLOW_NAME,
        }
    }

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["plans"] is not None and len(ret_body["plans"]) > 1
    assert ret_body["nextToken"] is None

def test_lambda_handler_success_has_next():
    event = {
        "queryStringParameters": {
            "limit": 1,
        },
        "pathParameters": {
            "flowName": FLOW_NAME,
        },
    }

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["plans"] is not None and len(ret_body["plans"]) == 1
    assert ret_body["nextToken"] is not None

    next_token = ret_body["nextToken"]
    event = {
        "queryStringParameters": {
            "limit": 1,
            "next-token": next_token,
        },
        "pathParameters": {
            "flowName": FLOW_NAME,
        },
    }
    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["plans"] is not None and len(ret_body["plans"]) == 1
    assert ret_body["plans"][0]["planName"] != next_token

def test_lambda_handler_fail_400(mocker):
    event = {}
    response = lambda_handler(event, None)

    assert response["statusCode"] == 400
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is not None and "flowName" in ret_body["error"]
    assert ret_body["plans"] is None
    assert ret_body["nextToken"] is None

def test_lambda_handler_fail_500(mocker):
    event = {
        "pathParameters": {
            "flowName": FLOW_NAME,
        }
    }
    mocker.patch("list_plans.list_plans", side_effect=Exception)
    response = lambda_handler(event, None)

    assert response["statusCode"] == 500
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is not None and "list plans failed" in ret_body["error"]
    assert ret_body["plans"] is None
    assert ret_body["nextToken"] is None