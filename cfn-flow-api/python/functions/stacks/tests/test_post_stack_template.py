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
from post_stack_template import (RequestPathParams, ResponseBody,
                                 get_template_body, lambda_handler,
                                 post_template_body, validate_path_params)
from pytest_mock import mocker

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

def test_get_template_body_yaml():
    body = get_template_body(TEST_YAML_STACK_NAME, TEST_REGION_NAME)
    assert body == TEST_TEMPLATE_YAML_BODY

def test_get_template_body_json():
    body = get_template_body(TEST_JSON_STACK_NAME, TEST_REGION_NAME)
    assert isinstance(body, str)

def test_get_template_body_not_found():
    with pytest.raises(Exception) as ex:
        get_template_body(TEST_YAML_STACK_NAME+"NotExist", TEST_REGION_NAME)
        assert "does not exist" in str(ex)

def test_post_template_body_yaml():

    url = post_template_body(TEST_YAML_STACK_NAME, TEST_TEMPLATE_YAML_BODY)
    assert url.startswith("https://")
    assert url.endswith(".yaml")

def test_post_template_body_json():

    url = post_template_body(TEST_JSON_STACK_NAME, TEST_TEMPLATE_JSON_BODY)
    assert url.startswith("https://")
    assert url.endswith(".json")

def test_validate_path_params_valid():
    res = validate_path_params(TEST_YAML_STACK_NAME, TEST_REGION_NAME)
    assert res is None

def test_validate_path_params_invalid_stack_name():
    with pytest.raises(ValueError) as ex:
        validate_path_params("", TEST_REGION_NAME)
        assert "stackName" in str(ex)

def test_validate_path_params_invalid_region_name():
    with pytest.raises(ValueError) as ex:
        validate_path_params(TEST_YAML_STACK_NAME, "")
        assert "regionName" in str(ex)


def test_lambda_handler_success():
    params:RequestPathParams = {
        "stackName": TEST_YAML_STACK_NAME,
        "regionName": TEST_REGION_NAME,
    }
    event = {"pathParameters": params}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["httpUrl"] is not None
    assert ret_body["httpUrl"].startswith("https://") and ret_body["httpUrl"].endswith(".yaml")

def test_lambda_handler_fail_400():
    event = {"pathParameters": None}
    response = lambda_handler(event, None)

    assert response["statusCode"] == 400
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is not None and "stackName" in ret_body["error"]
    assert ret_body["httpUrl"] is None

def test_lambda_handler_fail_500_get_template_body():
    params:RequestPathParams = {
        "stackName": TEST_YAML_STACK_NAME+"NotExist",
        "regionName": TEST_REGION_NAME,
    }
    event = {"pathParameters": params}
    response = lambda_handler(event, None)

    assert response["statusCode"] == 500
    ret_body:ResponseBody = json.loads(response["body"])
    assert ret_body["error"] is not None and "does not exist" in ret_body["error"]
    assert ret_body["httpUrl"] is None

def test_lambda_handler_fail_500_post_template_body():
    try:
        post_stack_template.BUCKET_NAME = BUCKET_NAME + "NotExist"
        params:RequestPathParams = {
            "stackName": TEST_YAML_STACK_NAME,
            "regionName": TEST_REGION_NAME,
        }
        event = {"pathParameters": params}
        response = lambda_handler(event, None)

        assert response["statusCode"] == 500
        ret_body:ResponseBody = json.loads(response["body"])
        assert ret_body["error"] is not None and "NoSuchBucket" in ret_body["error"], ret_body["error"]
        assert ret_body["httpUrl"] is None
    finally:
        post_stack_template.BUCKET_NAME = BUCKET_NAME

