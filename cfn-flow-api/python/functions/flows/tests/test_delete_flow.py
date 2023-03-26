import json
import pytest
import os
import boto3

from put_flow import upsert_flow
from delete_flow import (
    RequestPathParams, ResponseBody, delete_flow, lambda_handler, validate_path_params,
)
from utils import jdumps


FLOW_TABLE_NAME=os.environ["DYNAMO_FLOW_TABLE_NAME"]
BUCKET_NAME=os.environ["S3_FLOW_BUCKET_NAME"]

TEST_YAML_FLOW_HTTP_URL=f"https://{BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/test/flow.yaml"
TEST_JSON_FLOW_HTTP_URL=f"https://{BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/test/flow.json"


NEW_ITEM_NAME="new-test-flow"
EXISTING_ITEM_NAME="existing-test-flow"

def setup_module(module):
    pass

def teardown_module(module):
    pass

def test_delete_flow():
    res = delete_flow(EXISTING_ITEM_NAME)
    assert res is None

def test_validate_path_params_pass():
    res = validate_path_params(EXISTING_ITEM_NAME)
    assert res is None

def test_validate_path_params_no_flow_name():
    with pytest.raises(ValueError) as ex:
        validate_path_params("")
        assert "flowName" in str(ex)


def test_lambda_handler_200():
    path_params:RequestPathParams = {
        "flowName": EXISTING_ITEM_NAME,
    }
    res = lambda_handler({"pathParameters": path_params}, None)

    assert res["statusCode"] == 200
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is None
    assert ret_body["flowName"] is not None and ret_body["flowName"] == EXISTING_ITEM_NAME


def test_lambda_handler_400():
    path_params = {}
    res = lambda_handler({"pathParameters": path_params}, None)
    assert res["statusCode"] == 400
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is not None
    assert "flowName" in ret_body["error"]
    assert ret_body["flowName"] is None


def test_lambda_handler_500(mocker):
    path_params:RequestPathParams = {
        "flowName": EXISTING_ITEM_NAME,
    }
    mocker.patch("delete_flow.delete_flow", side_effect=Exception("some exception"))
    res = lambda_handler({"pathParameters": path_params}, None)
    assert res["statusCode"] == 500
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is not None
    assert "some exception" in ret_body["error"]
    assert ret_body["flowName"] is None

