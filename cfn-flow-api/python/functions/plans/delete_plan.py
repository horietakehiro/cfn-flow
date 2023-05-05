import os
import typing
from logging import INFO
from typing import Any, Dict, List, Optional, TypedDict

import boto3
import utils
from aws_xray_sdk.core import patch_all, xray_recorder
from boto3.dynamodb.conditions import Key
from plans_common import DELETE_CORS_HEADERS, PLAN_TABLE_NAME, Response

dynamo = boto3.resource("dynamodb")

get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)

patch_all()

ResponseBody = TypedDict("ResponseBody", {
    "error": Optional[str], "planName": Optional[str]
})
RequestPathParams = TypedDict("RequestPathParams", {
    "planName": str, "flowName": str,
})

def delete_plan(plan_name:str, flow_name) -> None:
    """
    delete plan item
    """
    try:
        table = dynamo.Table(PLAN_TABLE_NAME)
        res = table.delete_item(
            Key={"planName": plan_name, "flowName": flow_name, }
        )
        logger.info(utils.jdumps(dict(res)))
    except Exception as ex:
        raise ex


def validate_path_params(plan_name:str, flow_name:str):
    if plan_name == "":
        raise ValueError("planName must be specified")
    if flow_name == "":
        raise ValueError("flowName must be specified")

def lambda_handler(event:dict, context) -> Response:

    logger.info(utils.jdumps(event))

    try:
        params:RequestPathParams = event.get("pathParameters", None)
        plan_name = params.get("planName", "") if params is not None else ""
        flow_name = params.get("flowName", "") if params is not None else ""
        validate_path_params(plan_name, flow_name)
    except Exception as ex:
        logger.error("invalid path parameters", exc_info=True)
        res:ResponseBody = {
            "error": "invalid path parameters : " + str(ex),
            "planName": None,
        }
        return {
            "statusCode": 400,
            "headers": DELETE_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    # delete plan
    try:
        _ = delete_plan(plan_name, flow_name)
    except Exception as ex:
        logger.info("plan deletion failed", exc_info=True)
        res:ResponseBody = {
            "error": "plan deletion failed" + str(ex),
            "planName": None,
        }
        return {
            "statusCode": 500,
            "headers": DELETE_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    res:ResponseBody = {
        "error": None,
        "planName": plan_name,
    }
    return {
        "statusCode": 200,
        "headers": DELETE_CORS_HEADERS,
        "body": utils.jdumps(dict(res))
    }

    