import os
import typing
from logging import INFO
from typing import Any, Dict, List, Optional, Tuple, TypedDict

import boto3
import utils
from aws_xray_sdk.core import patch_all, xray_recorder
from boto3.dynamodb.conditions import Key
from plans_common import (GET_CORS_HEADERS, PLAN_GSI_NAME, PLAN_TABLE_NAME,
                          Plan, Response)

dynamo = boto3.resource("dynamodb")

get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)

patch_all()

RequestQueryParams = TypedDict("RequestQueryParams", {
    "next-token": Optional[str], "limit": Optional[int]
})
RequestPathParams = TypedDict("RequestPathParams", {
    "flowName": str,
})
ResponseBody = TypedDict("ResponseBody", {
    "error": Optional[str], "plans": Optional[List[Plan]], "nextToken": Optional[str]
})

def list_plans(flow_name, limit:int=100, next_token:Optional[str]=None) -> Tuple[List[Plan], Optional[str]]:
    """
    scan plans table and get all items for the specific flow as all as possible
    """

    try:
        table = dynamo.Table(PLAN_TABLE_NAME)

        kwargs:Dict[str, Any] = {
            "IndexName": PLAN_GSI_NAME,
            "KeyConditionExpression": Key("flowName").eq(flow_name),
            "Limit": limit,
        }
        if next_token:
            kwargs["ExclusiveStartKey"] = next_token
        res = table.query(**kwargs)

        logger.info(f"LastEvaluatedKey : {res.get('LastEvaluatedKey', '')}")
        plans = [typing.cast(Plan, item) for item in res["Items"]]
        last_evaluated_key = res.get("LastEvaluatedKey", None)
        return plans, typing.cast(Optional[str], last_evaluated_key)

    except Exception as ex:
        raise ex

def validate_path_params(flow_name:str):
    if flow_name == "":
        raise ValueError("flowName must be specified")


def lambda_handler(event:dict, context) -> Response:

    logger.info(utils.jdumps(event))
    query_params:RequestQueryParams = event.get("queryStringParameters", None)
    path_params:RequestPathParams = event.get("pathParameters", None)
    try:
        flow_name = path_params.get("flowName", "") if path_params is not None else ""
        validate_path_params(flow_name)
    except Exception as ex:
        logger.error("invalid path parameters", exc_info=True)
        res:ResponseBody = {
            "error": "invalid path parameters : " + str(ex),
            "plans": None,
            "nextToken": None,
        }
        return {
            "statusCode": 400,
            "headers": GET_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }


    try:
        next_token = query_params.get("next-token", None) if query_params is not None else None
        limit = int(typing.cast(int, query_params.get("limit", 100))) if query_params is not None else 100
        plans, next_token = list_plans(flow_name, limit=limit, next_token=next_token)
    except Exception as ex:
        logger.error(f"list plans failed", exc_info=True)
        res:ResponseBody = {
            "error": f"list plans failed : {ex}",
            "plans": None,
            "nextToken": None,
        }
        return {
            "statusCode": 500,
            "headers": GET_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    res: ResponseBody = {
        "error": None,
        "plans": plans,
        "nextToken": next_token,
    }
    return {
        "statusCode": 200,
        "headers": GET_CORS_HEADERS,
        "body": utils.jdumps(dict(res))
    }
