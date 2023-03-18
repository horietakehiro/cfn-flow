from logging import INFO
import os
import typing
import utils
import boto3
from boto3.dynamodb.conditions import Key
from typing import List, TypedDict, Optional, Dict, Any

TEMPLATE_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_TABLE_NAME"]
TEMPLATE_SUMMARY_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_SUMMARY_TABLE_NAME"]
BUCKET_NAME=os.environ["S3_TEMPLATE_BUCKET_NAME"]

dynamo = boto3.resource("dynamodb")

get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)

Response = TypedDict("Response", {
    "statusCode": int, "body": str,
})
ResponseBody = TypedDict("ResponseBody", {
    "error": Optional[str], "templateName": Optional[str]
})
RequestPathParams = TypedDict("RequestPathParams", {
    "templateName": str,
})

def delete_template(template_name:str) -> None:
    """
    delete template item
    """
    try:
        table = dynamo.Table(TEMPLATE_TABLE_NAME)
        res = table.delete_item(
            Key={"name": template_name}
        )
        logger.info(utils.jdumps(dict(res)))
    except Exception as ex:
        raise ex

def delete_template_summaries(template_name:str, section_names:List[str]) -> None:
    table = dynamo.Table(TEMPLATE_SUMMARY_TABLE_NAME)
    try:
        for section_name in section_names:
            res = table.delete_item(
                Key={
                    "templateName": template_name,
                    "sectionName": section_name,
                }
            )
            logger.info(utils.jdumps(dict(res)))
    except Exception as ex:
        raise ex


def validate_path_params(template_name:str):
    if template_name == "":
        raise ValueError("templateName must be specified")

def lambda_handler(event:dict, context) -> Response:

    logger.info(utils.jdumps(event))

    # get template name from path
    try:
        params:RequestPathParams = event.get("pathParameters", {})
        template_name = params.get("templateName", "")
        validate_path_params(template_name)
    except Exception as ex:
        logger.error("invalid path parameters", exc_info=True)
        res:ResponseBody = {
            "error": "invalid path parameters : " + str(ex),
            "templateName": None,
        }
        return {
            "statusCode": 400,
            "body": utils.jdumps(dict(res))
        }
    
    # delete template and template summaries
    try:
        _ = delete_template(template_name)
    except Exception as ex:
        logger.info("template deletion failed", exc_info=True)
        res:ResponseBody = {
            "error": "template deletion failed" + str(ex),
            "templateName": None,
        }
        return {
            "statusCode": 500,
            "body": utils.jdumps(dict(res))
        }
    try:
        _ = delete_template_summaries(template_name, section_names=[
            "Parameters", "Resources", "Outputs",
        ])
    except Exception as ex:
        logger.info("template deletion succeeded but template summaries deletion failed", exc_info=True)
        res:ResponseBody = {
            "error": "template deletion succeeded but template summaries deletion failed" + str(ex),
            "templateName": None,
        }
        return {
            "statusCode": 500,
            "body": utils.jdumps(dict(res))
        }
    
    res:ResponseBody = {
        "error": None,
        "templateName": template_name,
    }
    return {
        "statusCode": 200,
        "body": utils.jdumps(dict(res))
    }

    