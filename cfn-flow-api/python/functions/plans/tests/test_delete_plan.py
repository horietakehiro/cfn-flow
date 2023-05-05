import json
import os
import typing

import boto3
import pytest
from delete_plan import (RequestPathParams, ResponseBody, delete_plan,
                         lambda_handler, validate_path_params)
from plans_common import Plan
from put_plan import upsert_plan
from utils import jdumps

PLAN_TABLE_NAME=os.environ["DYNAMO_FLOW_PLANS_TABLE_NAME"]

NEW_ITEM_NAME="new-test-plan"
EXISTING_ITEM_NAME="existing-test-plan"
FLOW_NAME="test-flow-name"

def setup_module(module):
    dynamo = boto3.resource("dynamodb")
    plan_table = dynamo.Table(PLAN_TABLE_NAME)
    # create existing item
    item:Plan = {
        "planName": EXISTING_ITEM_NAME,
        "flowName": FLOW_NAME,
        "description": "existinrg plan",
        "direction": "forward",
        "lastStatus": "unused",
    }
    plan_table.put_item(
        Item=typing.cast(typing.Mapping[typing.Any, typing.Any], item),
    )

def teardown_module(module):
    pass

def test_delete_plan():
    res = delete_plan(EXISTING_ITEM_NAME, FLOW_NAME)
    assert res is None

def test_validate_path_params_pass():
    res = validate_path_params(EXISTING_ITEM_NAME, FLOW_NAME)
    assert res is None

def test_validate_path_params_no_plan_name():
    with pytest.raises(ValueError) as ex:
        validate_path_params("", FLOW_NAME)
        assert "planName" in str(ex)

def test_validate_path_params_no_flow_name():
    with pytest.raises(ValueError) as ex:
        validate_path_params(EXISTING_ITEM_NAME, "")
        assert "flowName" in str(ex)


def test_lambda_handler_200():
    path_params:RequestPathParams = {
        "planName": EXISTING_ITEM_NAME,
        "flowName": FLOW_NAME,
    }
    res = lambda_handler({"pathParameters": path_params}, None)

    assert res["statusCode"] == 200
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is None
    assert ret_body["planName"] is not None and ret_body["planName"] == EXISTING_ITEM_NAME


def test_lambda_handler_400():
    path_params = {}
    res = lambda_handler({"pathParameters": path_params}, None)
    assert res["statusCode"] == 400
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is not None
    assert "planName" in ret_body["error"]
    assert ret_body["planName"] is None


def test_lambda_handler_500(mocker):
    path_params:RequestPathParams = {
        "planName": EXISTING_ITEM_NAME,
        "flowName": FLOW_NAME,
    }
    mocker.patch("delete_plan.delete_plan", side_effect=Exception("some exception"))
    res = lambda_handler({"pathParameters": path_params}, None)
    assert res["statusCode"] == 500
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is not None
    assert "some exception" in ret_body["error"]
    assert ret_body["planName"] is None


