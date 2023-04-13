import os
import typing
from logging import INFO
from typing import Any, Dict, Optional, TypedDict

import boto3
import utils
from aws_xray_sdk.core import patch_all, xray_recorder
from boto3.dynamodb.conditions import Key
from templates_common import (GET_CORS_HEADERS, TEMPLATE_SUMMARY_TABLE_NAME,
                              TEMPLATE_TABLE_NAME, Response, Template)

dynamo = boto3.resource("dynamodb")

get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)

patch_all()

ResponseBody = TypedDict("ResponseBody", {
    "error": Optional[str], "template": Optional[Template]
})
RequestPathParams = TypedDict("RequestPathParams", {
    "templateName": str,
})


def get_template(template_name:str) -> Optional[Template]:
    """
    get template  for specific template name
    """

    try:
        table = dynamo.Table(TEMPLATE_TABLE_NAME)
        res = table.query(
            KeyConditionExpression=Key("name").eq(template_name)
        )
        logger.info(utils.jdumps(dict(res)))
        if len(res["Items"]) == 0:
            return None
        
        return typing.cast(Template, res["Items"][0])
    except Exception as ex:
        raise ex

def validate_path_params(template_name:str):
    if template_name == "":
        raise ValueError("templateName must be specified")

def lambda_handler(event:dict, context) -> Response:

    logger.info(utils.jdumps(event))

    # get template name from path
    try:
        params:RequestPathParams = event.get("pathParameters", None)
        template_name = params.get("templateName", "") if params is not None else ""
        validate_path_params(template_name)
    except Exception as ex:
        logger.error("invalid path parameters", exc_info=True)
        res:ResponseBody = {
            "error": "invalid path parameters : " + str(ex),
            "template": None,
        }
        return {
            "statusCode": 400,
            "headers": GET_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    # get template
    try:
        template = get_template(template_name)
    except Exception as ex:
        logger.info("template summary cannot be retreived", exc_info=True)
        res:ResponseBody = {
            "error": "template summary cannot be retreived" + str(ex),
            "template": None,
        }
        return {
            "statusCode": 500,
            "headers": GET_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    res:ResponseBody = {
        "error": None,
        "template": template,
    }
    return {
        "statusCode": 200,
        "headers": GET_CORS_HEADERS,
        "body": utils.jdumps(dict(res))
    }

    