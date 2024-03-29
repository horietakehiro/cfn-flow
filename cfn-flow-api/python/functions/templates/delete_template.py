import os
import typing
from logging import INFO
from typing import Any, Dict, List, Optional, TypedDict

import boto3
import utils
from aws_xray_sdk.core import patch_all, xray_recorder
from boto3.dynamodb.conditions import Key
from templates_common import (DELETE_CORS_HEADERS, TEMPLATE_SUMMARY_TABLE_NAME,
                              TEMPLATE_TABLE_NAME, Response)

dynamo = boto3.resource("dynamodb")

get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)

patch_all()

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
            "headers": DELETE_CORS_HEADERS,
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
            "headers": DELETE_CORS_HEADERS,
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
            "headers": DELETE_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    res:ResponseBody = {
        "error": None,
        "templateName": template_name,
    }
    return {
        "statusCode": 200,
        "headers": DELETE_CORS_HEADERS,
        "body": utils.jdumps(dict(res))
    }

    