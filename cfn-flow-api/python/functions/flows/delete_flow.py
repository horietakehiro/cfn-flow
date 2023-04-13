import os
import typing
from logging import INFO
from typing import Any, Dict, List, Optional, TypedDict

import boto3
import utils
from aws_xray_sdk.core import patch_all, xray_recorder
from boto3.dynamodb.conditions import Key
from flows_common import DELETE_CORS_HEADERS, FLOW_TABLE_NAME, Response

dynamo = boto3.resource("dynamodb")

get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)

patch_all()

ResponseBody = TypedDict("ResponseBody", {
    "error": Optional[str], "flowName": Optional[str]
})
RequestPathParams = TypedDict("RequestPathParams", {
    "flowName": str,
})

def delete_flow(flow_name:str) -> None:
    """
    delete flow item
    """
    try:
        table = dynamo.Table(FLOW_TABLE_NAME)
        res = table.delete_item(
            Key={"name": flow_name}
        )
        logger.info(utils.jdumps(dict(res)))
    except Exception as ex:
        raise ex


def validate_path_params(flow_name:str):
    if flow_name == "":
        raise ValueError("flowName must be specified")

def lambda_handler(event:dict, context) -> Response:

    logger.info(utils.jdumps(event))

    # get flow name from path
    try:
        params:RequestPathParams = event.get("pathParameters", None)
        flow_name = params.get("flowName", "") if params is not None else ""
        validate_path_params(flow_name)
    except Exception as ex:
        logger.error("invalid path parameters", exc_info=True)
        res:ResponseBody = {
            "error": "invalid path parameters : " + str(ex),
            "flowName": None,
        }
        return {
            "statusCode": 400,
            "headers": DELETE_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    # delete flow
    try:
        _ = delete_flow(flow_name)
    except Exception as ex:
        logger.info("flow deletion failed", exc_info=True)
        res:ResponseBody = {
            "error": "flow deletion failed" + str(ex),
            "flowName": None,
        }
        return {
            "statusCode": 500,
            "headers": DELETE_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    res:ResponseBody = {
        "error": None,
        "flowName": flow_name,
    }
    return {
        "statusCode": 200,
        "headers": DELETE_CORS_HEADERS,
        "body": utils.jdumps(dict(res))
    }

    