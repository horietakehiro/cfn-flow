import datetime as dt
import json
import os
import tempfile
import typing
from logging import INFO
from typing import Any, Dict, List, Optional, TypedDict

import boto3
import utils
from aws_xray_sdk.core import patch_all, xray_recorder
from boto3.dynamodb.conditions import Key
from plans_common import (PLAN_TABLE_NAME, PUT_CORS_HEADERS, Direction,
                          LastStatus, Plan, Response)

dynamo = boto3.resource("dynamodb")

patch_all()

get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)


RequestBody = TypedDict("RequestBody",{
    "planName": str, "flowName": str, "description": Optional[str],
    "direction": Direction, "lastStatus": LastStatus,
})

ResponseBody = TypedDict("ResponseBody", {
    "error": Optional[str], "plan": Optional[Plan]
})


def upsert_plan(req_body:RequestBody) -> Plan:
    try:
        table = dynamo.Table(PLAN_TABLE_NAME)
        item: Plan = {
            "planName": req_body["planName"],
            "flowName": req_body["flowName"],
            "description": req_body.get("description", None),
            "direction": req_body["direction"],
            "lastStatus": req_body["lastStatus"]
        }
        
        res = table.put_item(
            Item=typing.cast(typing.Mapping[str, typing.Any], item),
        )
        logger.info(utils.jdumps(dict(res)))
    except Exception as ex:
        raise ex
    
    return item


def lambda_handler(event:dict, context) -> Response:

    logger.info(utils.jdumps(event))
    try:
        req_body: RequestBody = json.loads(event["body"])
    except Exception as ex:
        logger.error("invalid request body", exc_info=True)
        res:ResponseBody = {
            "error": f"invalid request body received: {ex}",
            "plan": None,
        }
        return {
            "statusCode": 400,
            "headers": PUT_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    # upsert flow item in dynamodb table
    try:
        plan = upsert_plan(req_body)
    except Exception as ex:
        logger.error("plan creation failed", exc_info=True)
        res:ResponseBody = {
            "error": f"plan creation failed : {ex}",
            "plan": None,
        }
        return {
            "statusCode": 500,
            "headers": PUT_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    res:ResponseBody = {
        "error": None,
        "plan": plan,
    }
    return {
        "statusCode": 200,
        "headers": PUT_CORS_HEADERS,
        "body": utils.jdumps(dict(res))
    }

