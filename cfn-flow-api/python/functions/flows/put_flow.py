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
from flows_common import (BUCKET_NAME, FLOW_TABLE_NAME, PUT_CORS_HEADERS, Flow,
                          Response)

dynamo = boto3.resource("dynamodb")
s3 = boto3.client("s3")

patch_all()

get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)


RequestBody = TypedDict("RequestBody",{
    "name": str, "description": Optional[str], "httpUrl": Optional[str],
})

ResponseBody = TypedDict("ResponseBody", {
    "error": Optional[str], "flow": Optional[Flow]
})

def create_new_flow_file(flow_name:str) -> str:
    try:
        key = "/".join(["flows", str(dt.datetime.timestamp(dt.datetime.now())), f"{flow_name}.json"])
        initial_body = utils.jdumps({})
        res = s3.put_object(
            Bucket=BUCKET_NAME,
            Key=key,
            Body=initial_body,
        )

        logger.info(utils.jdumps(dict(res)))

        res = s3.get_bucket_location(Bucket=BUCKET_NAME)
        region:str = res["LocationConstraint"]

        http_url = f"https://{BUCKET_NAME}.s3.{region}.amazonaws.com/{key}"

        return http_url
        
    except Exception as ex:
        raise ex


def upsert_flow(req_body:RequestBody) -> Flow:
    """
    if item does not exist, create new,
    if item already exist, upsert it and update updateAt field
    """
    try:
        table = dynamo.Table(FLOW_TABLE_NAME)
        name = req_body["name"]
        res = table.query(
            KeyConditionExpression=Key("name").eq(name),
        )
        logger.info(utils.jdumps(dict(res)))

        prev_item = {}
        if len(res["Items"]) != 0:
            prev_item = res["Items"][0]

        http_url = ""
        if req_body["httpUrl"] is None:
            http_url = create_new_flow_file(req_body["name"])
        else:
            http_url = req_body["httpUrl"]
        
        item: Flow = {
            "name": req_body["name"],
            "description": req_body.get("description", None),
            "httpUrl": http_url,
            "s3Url": utils.convert_http_to_s3(http_url),
            "createAt": str(prev_item.get("createAt", utils.strftime(utils.get_current_dt()))),
            "updateAt": "-" if not prev_item else utils.strftime(utils.get_current_dt()),
        }
        
        res = table.put_item(
            Item=typing.cast(typing.Mapping[str, typing.Any], item),
        )
        logger.info(utils.jdumps(dict(res)))
    except Exception as ex:
        raise ex
    
    return item

def validate_flow_body(url:str):
    raise NotImplementedError

def lambda_handler(event:dict, context) -> Response:

    logger.info(utils.jdumps(event))

    try:
        req_body: RequestBody = json.loads(event["body"])
    except Exception as ex:
        logger.error("invalid request body", exc_info=True)
        res:ResponseBody = {
            "error": "invalid request body received",
            "flow": None,
        }
        return {
            "statusCode": 400,
            "headers": PUT_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    

    # # get and validate flow body if given
    # if req_body["httpUrl"] is not None:
    #     try:
    #         validate_flow_body(req_body["httpUrl"])
    #     except Exception as ex:
    #         logger.error("flow validation failed", exc_info=True)
    #         res:ResponseBody = {
    #             "error": "flow validation failed",
    #             "flow": None,
    #         }
    #         return {
    #             "statusCode": 500,
    #             "headers": PUT_CORS_HEADERS,
    #             "body": utils.jdumps(dict(res))
    #         }


    # upsert flow item in dynamodb table
    try:
        created_flow = upsert_flow(req_body)
    except Exception as ex:
        logger.error("flow creation failed", exc_info=True)
        res:ResponseBody = {
            "error": "flow creation failed",
            "flow": None,
        }
        return {
            "statusCode": 500,
            "headers": PUT_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    res:ResponseBody = {
        "error": None,
        "flow": created_flow,
    }
    return {
        "statusCode": 200,
        "headers": PUT_CORS_HEADERS,
        "body": utils.jdumps(dict(res))
    }

