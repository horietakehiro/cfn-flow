import importlib
import json
import os
from collections import OrderedDict
from time import sleep
from typing import Any
from unittest import mock
from unittest.mock import Mock

import boto3
import post_stack_template
import pytest
import utils
from boto3.dynamodb.conditions import Key
from list_stacks import (RequestPathParams, ResponseBody, lambda_handler,
                         list_stacks, validate_path_params)

BUCKET_NAME=os.environ["S3_TEMPLATE_BUCKET_NAME"]

TEST_YAML_STACK_NAME="cfn-flow-api-stacks-test-yaml-stack"
TEST_JSON_STACK_NAME="cfn-flow-api-stacks-test-json-stack"
TEST_REGION_NAME="ap-northeast-1"

with open(os.path.join(os.path.dirname(__file__), "template.yaml"), "r") as fp:
    TEST_TEMPLATE_YAML_BODY=fp.read()
with open(os.path.join(os.path.dirname(__file__), "template.json"), "r") as fp:
    TEST_TEMPLATE_JSON_BODY=fp.read()

original_boto3 = None

def setup_module(module):
    cfn = boto3.client("cloudformation", region_name=TEST_REGION_NAME)
    try:
        cfn.create_stack(
            StackName=TEST_YAML_STACK_NAME,
            TemplateBody=TEST_TEMPLATE_YAML_BODY,
        )
    except Exception as ex:
        if "AlreadyExistsException" in str(ex):
            pass
    try:
        cfn.create_stack(
            StackName=TEST_JSON_STACK_NAME,
            TemplateBody=TEST_TEMPLATE_JSON_BODY,
        )
    except Exception as ex:
        if "AlreadyExistsException" in str(ex):
            pass

def teardown_module(module):
    pass

def test_list_stacks_success():
    stacks = list_stacks(TEST_REGION_NAME)
    assert len(stacks) >= 2

def test_list_stacks_fail():
    with pytest.raises(Exception) as ex:
        stacks = list_stacks("")
        assert stacks is None

def test_validate_path_params_valid():
    res = validate_path_params(TEST_REGION_NAME)
    assert res is None

def test_validate_path_params_invalid_region_name():
    with pytest.raises(ValueError) as ex:
        validate_path_params("")
        assert "regionName" in str(ex)


def test_lambda_handler_success():
    params:RequestPathParams = {
        "regionName": TEST_REGION_NAME,
    }
    event = {"pathParameters": params}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["stacks"] is not None
    assert len(ret_body["stacks"]) >= 2

def test_lambda_handler_fail_400():
    event = {"pathParameters": None}
    response = lambda_handler(event, None)

    assert response["statusCode"] == 400
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is not None and "regionName" in ret_body["error"]
    assert ret_body["stacks"] is None

def test_lambda_handler_fail_500():
    params:RequestPathParams = {
        "regionName": TEST_REGION_NAME+"NotExist",
    }
    event = {"pathParameters": params}
    response = lambda_handler(event, None)

    assert response["statusCode"] == 500
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is not None
    assert ret_body["stacks"] is None


