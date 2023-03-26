import json
import os
import tempfile
from typing import Any, Dict, Optional, TypedDict, List
import typing
import boto3
from boto3.dynamodb.conditions import Key
import utils
from logging import INFO

from cfn_flip import to_json

from templates_common import (
    TEMPLATE_TABLE_NAME, TEMPLATE_SUMMARY_TABLE_NAME, BUCKET_NAME, Output, Parameter, Resource,
    Template, Response, TemplateSummaries, TemplateSummary,
    PUT_CORS_HEADERS,
)


dynamo = boto3.resource("dynamodb")
s3 = boto3.client("s3")

get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)


RequestBody = TypedDict("RequestBody",{
    "name": str, "description": Optional[str], "httpUrl": str,
})

ResponseBody = TypedDict("ResponseBody", {
    "error": Optional[str], "template": Optional[Template]
})

def parse_parameters(cfn_parameters:Dict[str, Dict]) -> List[Parameter]:
    parameters:List[Parameter] = []
    for name, value in cfn_parameters.items():
        parameters.append({
            "name": name,
            "type": value.get("Type", "String"),
            "default": value.get("Default", None),
            "description": value.get("Description", None),
            "allowedPattern": value.get("AllowedPattern", None),
            "allowedValues": value.get("AllowedValues", []),
            "constraintDescription": value.get("ConstraintDescription", None),
            "maxLength": value.get("MaxLength", None),
            "minLength": value.get("MinLength", None),
            "maxValue": value.get("MaxValue", None),
            "minValue": value.get("minValue", None),
            "noEcho": value.get("NoEcho", False),
        })
    return parameters

def parse_resources(cfn_resources:Dict[str, Dict]) -> List[Resource]:
    resources:List[Resource] = []
    for name, value in cfn_resources.items():
        resources.append({
            "name": name,
            "type": value.get("Type", "")
        })
    return resources

def parse_outputs(cfn_outputs:Dict[str, Dict]) -> List[Output]:
    outputs:List[Output] = []
    for name, value in cfn_outputs.items():
        v = value.get("Value", "")
        export_name = value.get("Export", {}).get("Name", None)
        if isinstance(v, dict):
            v = utils.jdumps(v)
        if isinstance(export_name, dict):
            export_name = utils.jdumps(export_name)
        outputs.append({
            "name": name,
            "value": v,
            "exportName": export_name,
        })

    return outputs

def get_template_body(http_url:str) -> Dict:
    """
    download template body from s3 bucket
    and register template summaries to dynamodb
    """
    s3_url = ""
    try:
        s3_url = utils.convert_http_to_s3(http_url)
        logger.info(f"convert {http_url} to {s3_url}")

        bucket, *keys = s3_url.replace("s3://", "").split("/")
        key = "/".join(keys)
        filename = key.split("/")[-1]
        filename = s3_url.split("/")[-1]
    except Exception as ex:
        raise ex

    with tempfile.TemporaryDirectory() as td:
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
        logger.info(utils.jdumps(dict(res)))

        prev_item = {}
        if len(res["Items"]) != 0:
            prev_item = res["Items"][0]
        
        item: Template = {
            "name": req_body["name"],
            "description": req_body.get("description", None),
            "httpUrl": req_body["httpUrl"],
            "s3Url": utils.convert_http_to_s3(req_body["httpUrl"]),

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


def upsert_template_summaries(req_body:RequestBody ,body:Dict) -> TemplateSummaries:
    """
    upsert template summaries (parameters, resources, outputs)
    """

    summaries:TemplateSummaries = {}
    try:
        table = dynamo.Table(TEMPLATE_SUMMARY_TABLE_NAME)

        parameters = parse_parameters(dict(body.get("Parameters", {})))
        resources = parse_resources(dict(body.get("Resources", {})))
        outputs = parse_outputs(dict(body.get("Outputs", {})))

        for key, val in {"Parameters": parameters, "Resources": resources, "Outputs": outputs}.items():
            item:TemplateSummary = {
                "templateName": req_body["name"],
                "sectionName": key,
                "summary": val
            }
            res = table.put_item(
                Item=typing.cast(typing.Mapping[str, Any], item),
            )
            logger.info(utils.jdumps(dict(res)))

            summaries[key] = item

    except Exception as ex:
        raise ex
    
    return summaries


def lambda_handler(event:dict, context) -> Response:

    logger.info(utils.jdumps(event))

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
            "headers": PUT_CORS_HEADERS,
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
            "headers": PUT_CORS_HEADERS,
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
            "headers": PUT_CORS_HEADERS,
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
            "headers": PUT_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }

    res:ResponseBody = {
        "error": None,
        "template": created_template,
    }
    return {
        "statusCode": 200,
        "headers": PUT_CORS_HEADERS,
        "body": utils.jdumps(dict(res))
    }

