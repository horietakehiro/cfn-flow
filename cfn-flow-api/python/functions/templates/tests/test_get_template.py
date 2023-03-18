import json
import pytest
import os
import boto3

from put_template import upsert_template_summaries
from get_template import (
    RequestPathParams, ResponseBody, get_template_summary, lambda_handler, validate_path_params,
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

@pytest.mark.parametrize("section_name,expect_str", [
    ("Parameters", "SYSTEM"), ("Resources", "AWS::EC2::VPC"), ("Outputs", "Export")
])
def test_get_template_summary(section_name, expect_str):
    res = get_template_summary(
        EXISTING_ITEM_NAME, section_name
    )

    assert res is not None
    assert res["templateName"] == EXISTING_ITEM_NAME
    assert res["sectionName"] == section_name
    assert expect_str in jdumps(res["summary"])
    
@pytest.mark.parametrize("section_name", [
    ("Parameters"), ("Resources"), ("Outputs")
])
def test_validate_path_params_pass(section_name):
    res = validate_path_params(EXISTING_ITEM_NAME, section_name)
    assert res is None

def test_validate_path_params_no_template_name():
    with pytest.raises(ValueError) as ex:
        validate_path_params("", "Parameters")
        assert "templateName" in str(ex)
def test_validate_path_params_invalid_():
    with pytest.raises(ValueError) as ex:
        validate_path_params(EXISTING_ITEM_NAME, "NotExistedSection")
        assert "NotExistedSection" in str(ex)

@pytest.mark.parametrize("section_name,expect_str", [
    ("Parameters", "SYSTEM"), ("Resources", "AWS::EC2::VPC"), ("Outputs", "Export")
])
def test_lambda_handler_200(section_name, expect_str):
    path_params:RequestPathParams = {
        "templateName": EXISTING_ITEM_NAME,
        "sectionName": section_name
    }
    res = lambda_handler({"pathParameters": path_params}, None)

    assert res["statusCode"] == 200
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is None
    assert ret_body["templateSummary"] is not None
    assert expect_str in jdumps(dict(ret_body["templateSummary"]))

def test_lambda_handler_200_empty():
    path_params:RequestPathParams = {
        "templateName": "NotExistTemplateName",
        "sectionName": "Parameters"
    }
    res = lambda_handler({"pathParameters": path_params}, None)

    assert res["statusCode"] == 200
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is None
    assert ret_body["templateSummary"] is None

def test_lambda_handler_400():
    path_params:RequestPathParams = {
        "templateName": EXISTING_ITEM_NAME,
        "sectionName": "NotExistSection"
    }
    res = lambda_handler({"pathParameters": path_params}, None)
    assert res["statusCode"] == 400
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is not None
    assert "NotExistSection" in ret_body["error"]
    assert ret_body["templateSummary"] is None


def test_lambda_handler_500(mocker):
    path_params:RequestPathParams = {
        "templateName": EXISTING_ITEM_NAME,
        "sectionName": "Parameters"
    }
    mocker.patch("get_template.get_template_summary", side_effect=Exception("some exception"))
    res = lambda_handler({"pathParameters": path_params}, None)
    assert res["statusCode"] == 500
    ret_body:ResponseBody = json.loads(res["body"])
    assert ret_body["error"] is not None
    assert "some exception" in ret_body["error"]
    assert ret_body["templateSummary"] is None

