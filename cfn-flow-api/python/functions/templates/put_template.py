import json
import os
from tempfile import tempdir
import tempfile
from typing import Dict, Optional, TypedDict
import typing
from urllib.parse import urlparse
import boto3
from boto3.dynamodb.conditions import Key
import utils
from logging import DEBUG
from dataclasses import dataclass
import datetime as dt

from cfn_flip import to_json


TEMPLATE_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_TABLE_NAME"]
TEMPLATE_SUMMARY_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_SUMMARY_TABLE_NAME"]
BUCKET_NAME=os.environ["S3_BUCKET_NAME"]


dynamo = boto3.resource("dynamodb")
s3 = boto3.client("s3")

get_logger = utils.logger_manager()
logger = get_logger(__name__, DEBUG)


Template = TypedDict("Template", {
    "name": str, "description": Optional[str], 
    "httpUrl": str, "s3Url": str, "createAt": str, "updateAt": str
})

RequestBody = TypedDict("RequestBody",{
    "name": str, "description": Optional[str], "httpUrl": str,
})

Response = TypedDict("SuccessResponse", {
    "statusCode": int, "body": str,
})

ResponseBody = TypedDict("ResponseBody", {
    "error": Optional[str], "template": Optional[Template]
})

def get_template_body(http_url:str) -> Dict:
    """
    download template body from s3 bucket
    and register template summaries to dynamodb
    """
    s3_url = ""
    try:
        s3_url = convert_http_to_s3(http_url)
        bucket, keys = s3_url.replace("s3://", "").split("/")
        key = "/".join(keys)
        filename = key.split("/")[-1]
        filename = s3_url.split("/")[-1]
    except Exception as ex:
        raise ex

    with tempfile.TemporaryDirectory(suffix="/tmp") as td:
        try:
            filepath = os.path.join(td, filename)
            s3.download_file(bucket, key, filepath)
        except Exception as ex:
            raise ex

        row = ""
        try:
            with open(filepath, "r", encoding="utf-8") as fp:
                row = fp.read()
                body = {}
                if filename.endswith(".json"):
                    body = json.loads(row)
                else:
                    body = json.loads(to_json(row))
        except Exception as ex:
            raise ex
    return body

def strftime(datetime:dt.datetime, fmt="%Y-%m-%dT%H:%M:%S%z") -> str:
    return dt.datetime.strftime(datetime, fmt)

def get_current_dt(hours=9) -> dt.datetime:
    t_delta = dt.timedelta(hours=hours)
    timezone = dt.timezone(t_delta, "Asia/Tokyo")
    now = dt.datetime.now(timezone)

    return now

def upsert_template(req_body:RequestBody) -> Template:
    """
    if item does not exist, create new,
    if item already exist, upsert it and update updateAt field
    """
    try:
        table = dynamo.Table(TEMPLATE_TABLE_NAME)
        name = req_body["name"]
        res = table.query(
            KeyConditionExpression=Key("name").eq(name),
        )
        logger.debug(utils.jdumps(dict(res)))

        prev_item = {}
        if len(res["Items"]) != 0:
            prev_item = res["Items"][0]
        
        item: Template = {
            "name": req_body["name"],
            "description": req_body.get("description", None),
            "httpUrl": req_body["httpUrl"],
            "s3Url": convert_http_to_s3(req_body["httpUrl"]),

            "createAt": str(prev_item.get("createAt", strftime(get_current_dt()))),
            "updateAt": "-" if not prev_item else strftime(get_current_dt()),
        }
        
        res = table.put_item(
            Item=typing.cast(typing.Mapping[str, typing.Any], item),
        )
        logger.debug(utils.jdumps(dict(res)))
    except Exception as ex:
        raise ex
    
    return item


def convert_http_to_s3(url:str) -> str:
    """
    convert http url to s3 url
    e.g.:
        https://BUCKET-NAME.s3.ap-northeast-1.amazonaws.com/path/to/object
        -> s3://BUCKEt-NAME/path/to/pbject
    """
    u = urlparse(url)
    hostname = u.hostname
    if hostname is None:
        raise ValueError(f"given httpUrl : {url} is invalid")
    
    bucket = hostname.split(".")[0]
    key = u.path

    return f"s3://{bucket}{key}"

def upsert_template_summaries(req_body:RequestBody ,body:Dict) -> None:
    """
    upsert template summaries (parameters, resources, outputs)
    """

    try:
        table = dynamo.Table(TEMPLATE_SUMMARY_TABLE_NAME)

        parameters = dict(body.get("Parameters", {}))
        resources_full = dict(body.get("Resources", {}))
        resources = {rid: {"Type": rval["Type"]} for rid, rval in resources_full.items()}
        outputs = dict(body.get("Outputs", {}))

        for key, val in {"Parameters": parameters, "Resources": resources, "Outputs": outputs}.items():
            res = table.put_item(
                Item={
                    "templateName": req_body["name"],
                    "sectionName": key,
                    "summary": val
                }
            )
            logger.debug(utils.jdumps(dict(res)))

    except Exception as ex:
        raise ex


def lambda_handler(event:dict, context) -> Response:

    logger.debug(utils.jdumps(event))

    try:
        req_body: RequestBody = json.loads(event["body"])
    except Exception as ex:
        logger.error("invalid request body", exc_info=True)
        res:ResponseBody = {
            "error": "invalid request body received",
            "template": None,
        }
        return {
            "statusCode": 400,
            "body": utils.jdumps(dict(res))
        }
    

    # get and validate template body
    url = req_body["httpUrl"]
    body = {}
    try:
        body = get_template_body(url)
    except Exception as ex:
        logger.error("template validation failed", exc_info=True)
        res:ResponseBody = {
            "error": "template validation failed",
            "template": None,
        }
        return {
            "statusCode": 500,
            "body": utils.jdumps(dict(res))
        }

    # upsert template item in dynamodb table
    try:
        created_template = upsert_template(req_body)
    except Exception as ex:
        logger.error("template creation failed", exc_info=True)
        res:ResponseBody = {
            "error": "template creation failed",
            "template": None,
        }
        return {
            "statusCode": 500,
            "body": utils.jdumps(dict(res))
        }
    
    # upsert template summaries
    try:
        upsert_template_summaries(req_body, body)
    except Exception as ex:
        logger.error("template summaries creation failed", exc_info=True)
        res:ResponseBody = {
            "error": "template summaries creation failed",
            "template": None,
        }
        return {
            "statusCode": 500,
            "body": utils.jdumps(dict(res))
        }

    res:ResponseBody = {
        "error": None,
        "template": created_template,
    }
    return {
        "statusCode": 200,
        "body": utils.jdumps(dict(res))
    }