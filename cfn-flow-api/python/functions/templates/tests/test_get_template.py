import json
import pytest
import os
import boto3

from put_template import upsert_template_summaries
from get_template import (
    RequestPathParams, ResponseBody, get_template, lambda_handler, validate_path_params,
)
import utils
from utils import jdumps

TEMPLATE_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_TABLE_NAME"]
TEMPLATE_SUMMARY_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_SUMMARY_TABLE_NAME"]
BUCKET_NAME=os.environ["S3_TEMPLATE_BUCKET_NAME"]

TEST_YAML_TEMPLATE_HTTP_URL=f"https://{BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/test/template.yaml"
TEST_JSON_TEMPLATE_HTTP_URL=f"https://{BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/test/template.json"

NEW_ITEM_NAME="new-test-template"
EXISTING_ITEM_NAME="existing-test-template"

def setup_module(module):
    basename = TEST_YAML_TEMPLATE_HTTP_URL.split("/")[-1]
    filepath = os.path.join(os.path.dirname(__file__), basename)
    s3 = boto3.client("s3")
    s3.upload_file(filepath, BUCKET_NAME, f"test/{basename}")

    dynamo = boto3.resource("dynamodb")
    template_table = dynamo.Table(TEMPLATE_TABLE_NAME)
    template_table.put_item(
        Item={
            "name": NEW_ITEM_NAME,
            "description": "this is new template",
            "httpUrl": TEST_YAML_TEMPLATE_HTTP_URL,
            "s3Url": utils.convert_http_to_s3(TEST_YAML_TEMPLATE_HTTP_URL),
            "createAt": utils.strftime(utils.get_current_dt()),
            "updateAt": "-",
        }
    )

def teardown_module(module):
    pass

def test_get_template():
    res = get_template(NEW_ITEM_NAME)

    assert res is not None
    assert res["name"] == NEW_ITEM_NAME
    
def test_validate_path_params_pass():
    res = validate_path_params("some-template")
    assert res is None

def test_validate_path_params_no_template_name():
    with pytest.raises(ValueError) as ex:
        validate_path_params("")
        assert "templateName" in str(ex)

def test_lambda_handler_200():
    path_params:RequestPathParams = {
        "templateName": NEW_ITEM_NAME,
    }
    res = lambda_handler({"pathParameters": path_params}, None)

    assert res["statusCode"] == 200
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is None
    assert ret_body["template"] is not None
    assert NEW_ITEM_NAME in jdumps(dict(ret_body["template"]))

def test_lambda_handler_200_empty():
    path_params:RequestPathParams = {
        "templateName": "NotExistTemplateName",
    }
    res = lambda_handler({"pathParameters": path_params}, None)

    assert res["statusCode"] == 200
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is None
    assert ret_body["template"] is None

def test_lambda_handler_400():
    res = lambda_handler({"pathParameters": {}}, None)
    assert res["statusCode"] == 400
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is not None
    assert "templateName" in ret_body["error"]
    assert ret_body["template"] is None

def test_lambda_handler_500(mocker):
    path_params:RequestPathParams = {
        "templateName": NEW_ITEM_NAME,
    }
    mocker.patch("get_template.get_template", side_effect=Exception("some exception"))
    res = lambda_handler({"pathParameters": path_params}, None)
    assert res["statusCode"] == 500
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is not None
    assert "some exception" in ret_body["error"]
    assert ret_body["template"] is None

