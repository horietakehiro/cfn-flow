import os
import typing
from logging import INFO
from typing import Any, Dict, List, Optional, Tuple, TypedDict

import boto3
import utils
from aws_xray_sdk.core import patch_all, xray_recorder
from flows_common import FLOW_TABLE_NAME, GET_CORS_HEADERS, Flow, Response

dynamo = boto3.resource("dynamodb")

get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)

patch_all()

RequestQueryParams = TypedDict("RequestQueryParams", {
    "next-token": Optional[str], "limit": Optional[int]
})
ResponseBody = TypedDict("ResponseBody", {
    "error": Optional[str], "flows": Optional[List[Flow]], "nextToken": Optional[str]
})

def list_flows(limit:int=100, next_token:Optional[str]=None) -> Tuple[List[Flow], Optional[str]]:
    """
    scan flows table and get all items as all as possible
    """

    try:
        table = dynamo.Table(FLOW_TABLE_NAME)

        kwargs:Dict[str, Any] = {"Limit": limit}
        if next_token:
            kwargs["ExclusiveStartKey"] = next_token
        res = table.scan(**kwargs)

        logger.info(f"Count: {res['Count']} / ScanedCound : {res['ScannedCount']}")
        logger.info(f"LastEvaluatedKey : {res.get('LastEvaluatedKey', '')}")
        flows = [typing.cast(Flow, item) for item in res["Items"]]
        last_evaluated_key = res.get("LastEvaluatedKey", None)
        return flows, typing.cast(Optional[str], last_evaluated_key)

    except Exception as ex:
        raise ex


def lambda_handler(event:dict, context) -> Response:

    logger.info(utils.jdumps(event))
    params:RequestQueryParams = event.get("queryStringParameters", None)

    # get all flows items as possible
    try:
        next_token = params.get("next-token", None) if params is not None else None
        limit = int(typing.cast(int, params.get("limit", 100))) if params is not None else 100
        flows, next_token = list_flows(limit=limit, next_token=next_token)
    except Exception as ex:
        logger.error(f"list flows failed", exc_info=True)
        res:ResponseBody = {
            "error": "list flows failed",
            "flows": None,
            "nextToken": None,
        }
        return {
            "statusCode": 500,
            "headers": GET_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    res: ResponseBody = {
        "error": None,
        "flows": flows,
        "nextToken": next_token,
    }
    return {
        "statusCode": 200,
        "headers": GET_CORS_HEADERS,
        "body": utils.jdumps(dict(res))
    }
