import os
import typing
from logging import INFO
from typing import Any, Dict, List, Optional, Tuple, TypedDict

import boto3
import utils
from aws_xray_sdk.core import patch_all, xray_recorder
from templates_common import (GET_CORS_HEADERS, TEMPLATE_TABLE_NAME, Response,
                              Template)

dynamo = boto3.resource("dynamodb")

get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)

patch_all()

RequestQueryParams = TypedDict("RequestQueryParams", {
    "next-token": Optional[str], "limit": Optional[int]
})
ResponseBody = TypedDict("ResponseBody", {
    "error": Optional[str], "templates": Optional[List[Template]], "nextToken": Optional[str]
})

def list_templates(limit:int=100, next_token:Optional[str]=None) -> Tuple[List[Template], Optional[str]]:
    """
    scan templates table and get all items as all as possible
    """

    try:
        table = dynamo.Table(TEMPLATE_TABLE_NAME)

        kwargs:Dict[str, Any] = {"Limit": limit}
        if next_token:
            kwargs["ExclusiveStartKey"] = next_token
        res = table.scan(**kwargs)

        logger.info(f"Count: {res['Count']} / ScanedCound : {res['ScannedCount']}")
        logger.info(f"LastEvaluatedKey : {res.get('LastEvaluatedKey', '')}")
        templates = [typing.cast(Template, item) for item in res["Items"]]
        last_evaluated_key = res.get("LastEvaluatedKey", None)
        return templates, typing.cast(Optional[str], last_evaluated_key)

    except Exception as ex:
        raise ex


def lambda_handler(event:dict, context) -> Response:

    logger.info(utils.jdumps(event))
    params:RequestQueryParams = event.get("queryStringParameters", None)

    # get all template items as possible
    try:
        next_token = params.get("next-token", None) if params is not None else None
        limit = int(typing.cast(int, params.get("limit", 100))) if params is not None else 100
        templates, next_token = list_templates(limit=limit, next_token=next_token)
    except Exception as ex:
        logger.error(f"list templates failed", exc_info=True)
        res:ResponseBody = {
            "error": "list templates failed",
            "templates": None,
            "nextToken": None,
        }
        return {
            "statusCode": 500,
            "headers": GET_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    res: ResponseBody = {
        "error": None,
        "templates": templates,
        "nextToken": next_token,
    }
    return {
        "statusCode": 200,
        "headers": GET_CORS_HEADERS,
        "body": utils.jdumps(dict(res))
    }
