import json
import pytest
import os
import boto3

from put_template import upsert_template_summaries
from delete_template import (
    RequestPathParams, ResponseBody, delete_template, delete_template_summaries, lambda_handler, validate_path_params,
    delete_template, delete_template_summaries,
)
from utils import jdumps

TEMPLATE_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_TABLE_NAME"]
TEMPLATE_SUMMARY_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_SUMMARY_TABLE_NAME"]
BUCKET_NAME=os.environ["S3_TEMPLATE_BUCKET_NAME"]

TEST_YAML_TEMPLATE_HTTP_URL=f"https://{BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/test/template.yaml"
TEST_JSON_TEMPLATE_HTTP_URL=f"https://{BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/test/template.json"

NEW_ITEM_NAME="new-test-template"
EXISTING_ITEM_NAME="existing-test-template"

def setup_module(module):

    filepath = os.path.join(os.path.dirname(__file__), "template.json")
    with open(filepath, "r", encoding="utf-8") as fp:
        body = json.load(fp)
    summaries = upsert_template_summaries(
        {
            "name": EXISTING_ITEM_NAME,
            "description": "", "httpUrl": TEST_JSON_TEMPLATE_HTTP_URL
        }, body,
    )
    # upsert test template summaries
    dynamo = boto3.resource("dynamodb")
    template_summary_table = dynamo.Table(TEMPLATE_SUMMARY_TABLE_NAME)
    for key, val in summaries.items():
        template_summary_table.put_item(
            Item={
                "templateName": EXISTING_ITEM_NAME,
                "sectionName": key,
                "summary": val,
            }
        )

def teardown_module(module):
    pass

def test_delete_template():
    res = delete_template(EXISTING_ITEM_NAME)
    assert res is None

def test_delete_template_summaries():
    res = delete_template_summaries(
        EXISTING_ITEM_NAME, 
        ["Parameters", "Resources", "Outputs"]
    )
    assert res is None

def test_validate_path_params_pass():
    res = validate_path_params(EXISTING_ITEM_NAME)
    assert res is None

def test_validate_path_params_no_template_name():
    with pytest.raises(ValueError) as ex:
        validate_path_params("")
        assert "templateName" in str(ex)


def test_lambda_handler_200():
    path_params:RequestPathParams = {
        "templateName": EXISTING_ITEM_NAME,
    }
    res = lambda_handler({"pathParameters": path_params}, None)

    assert res["statusCode"] == 200
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is None
    assert ret_body["templateName"] is not None and ret_body["templateName"] == EXISTING_ITEM_NAME


def test_lambda_handler_400():
    path_params = {}
    res = lambda_handler({"pathParameters": path_params}, None)
    assert res["statusCode"] == 400
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is not None
    assert "templateName" in ret_body["error"]
    assert ret_body["templateName"] is None


def test_lambda_handler_500(mocker):
    path_params:RequestPathParams = {
        "templateName": EXISTING_ITEM_NAME,
    }
    mocker.patch("delete_template.delete_template", side_effect=Exception("some exception"))
    res = lambda_handler({"pathParameters": path_params}, None)
    assert res["statusCode"] == 500
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is not None
    assert "some exception" in ret_body["error"]
    assert ret_body["templateName"] is None


def test_lambda_handler_500_summaries(mocker):
    path_params:RequestPathParams = {
        "templateName": EXISTING_ITEM_NAME,
    }
    mocker.patch("delete_template.delete_template_summaries", side_effect=Exception("some exception"))
    res = lambda_handler({"pathParameters": path_params}, None)
    assert res["statusCode"] == 500
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is not None
    assert "template deletion succeeded but template summaries deletion failed" in ret_body["error"]
    assert ret_body["templateName"] is None
