import os
import typing
from logging import INFO
from typing import Any, Dict, Optional, TypedDict

import boto3
import utils
from aws_xray_sdk.core import patch_all, xray_recorder
from boto3.dynamodb.conditions import Key
from templates_common import (GET_CORS_HEADERS, TEMPLATE_SUMMARY_TABLE_NAME,
                              Response, TemplateSummary)

dynamo = boto3.resource("dynamodb")

get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)

patch_all()

ResponseBody = TypedDict("ResponseBody", {
    "error": Optional[str], "templateSummary": Optional[TemplateSummary]
})
RequestPathParams = TypedDict("RequestPathParams", {
    "templateName": str, "sectionName": str
})


def get_template_summary(template_name:str, section_name:str) -> Optional[TemplateSummary]:
    """
    get template summary for specific template name and section
    """

    try:
        table = dynamo.Table(TEMPLATE_SUMMARY_TABLE_NAME)

        res = table.query(
            KeyConditionExpression=Key("templateName").eq(template_name) & Key("sectionName").eq(section_name)
        )

        logger.info(utils.jdumps(dict(res)))

        if len(res["Items"]) == 0:
            return None
        
        return typing.cast(TemplateSummary, res["Items"][0])
    except Exception as ex:
        raise ex

def validate_path_params(template_name:str, section_name:str):
    if template_name == "":
        raise ValueError("templateName must be specified")
    
    if section_name not in ["Parameters", "Resources", "Outputs"]:
        raise ValueError(f"sectionName : {section_name} must be one of 'Parameters' or 'Resources' or 'Outputs'")

def lambda_handler(event:dict, context) -> Response:

    logger.info(utils.jdumps(event))

    # get template name and section name from path
    try:
        params:RequestPathParams = event.get("pathParameters", {})
        template_name = params.get("templateName", "")
        section_name = params.get("sectionName", "")
        validate_path_params(template_name, section_name)
    except Exception as ex:
        logger.error("invalid path parameters", exc_info=True)
        res:ResponseBody = {
            "error": "invalid path parameters : " + str(ex),
            "templateSummary": None,
        }
        return {
            "statusCode": 400,
            "headers": GET_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    # get template summary
    try:
        template_summary = get_template_summary(
            template_name, section_name,
        )
    except Exception as ex:
        logger.info("template summary cannot be retreived", exc_info=True)
        res:ResponseBody = {
            "error": "template summary cannot be retreived" + str(ex),
            "templateSummary": None,
        }
        return {
            "statusCode": 500,
            "headers": GET_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    res:ResponseBody = {
        "error": None,
        "templateSummary": template_summary,
    }
    return {
        "statusCode": 200,
        "headers": GET_CORS_HEADERS,
        "body": utils.jdumps(dict(res))
    }

    