from logging import INFO
import os
import typing
import utils
import boto3
from boto3.dynamodb.conditions import Key
from typing import TypedDict, Optional, Dict, Any

from flows_common import (
    FLOW_TABLE_NAME,
    Response, Flow,
    GET_CORS_HEADERS,
)

dynamo = boto3.resource("dynamodb")

get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)


ResponseBody = TypedDict("ResponseBody", {
    "error": Optional[str], "flow": Optional[Flow]
})
RequestPathParams = TypedDict("RequestPathParams", {
    "flowName": str,
})


def get_flow(flow_name:str) -> Optional[Flow]:
    """
    get flow  for specific flow name
    """

    try:
        table = dynamo.Table(FLOW_TABLE_NAME)
        res = table.query(
            KeyConditionExpression=Key("name").eq(flow_name)
        )
        logger.info(utils.jdumps(dict(res)))
        if len(res["Items"]) == 0:
            return None
        
        return typing.cast(Flow, res["Items"][0])
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
            "flow": None,
        }
        return {
            "statusCode": 400,
            "headers": GET_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    # get flow
    try:
        flow = get_flow(flow_name)
    except Exception as ex:
        logger.info("flow cannot be retreived", exc_info=True)
        res:ResponseBody = {
            "error": "flow cannot be retreived" + str(ex),
            "flow": None,
        }
        return {
            "statusCode": 500,
            "headers": GET_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    res:ResponseBody = {
        "error": None,
        "flow": flow,
    }
    return {
        "statusCode": 200,
        "headers": GET_CORS_HEADERS,
        "body": utils.jdumps(dict(res))
    }

    