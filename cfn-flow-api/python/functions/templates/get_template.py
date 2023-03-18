from logging import INFO
import os
import typing
import utils
import boto3
from boto3.dynamodb.conditions import Key
from typing import TypedDict, Optional, Dict, Any

TEMPLATE_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_TABLE_NAME"]
TEMPLATE_SUMMARY_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_SUMMARY_TABLE_NAME"]
BUCKET_NAME=os.environ["S3_TEMPLATE_BUCKET_NAME"]

dynamo = boto3.resource("dynamodb")

get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)

Template = TypedDict("Template", {
    "name": str, "description": Optional[str], 
    "httpUrl": str, "s3Url": str, "createAt": str, "updateAt": str
})
TemplateSummary = TypedDict("TemplateSummary", {
    "templateName": str, "sectionName": str,
    "summary": Dict[Any, Any]
})

Response = TypedDict("Response", {
    "statusCode": int, "body": str,
})

ResponseBody = TypedDict("ResponseBody", {
    "error": Optional[str], "templateSummary": Optional[TemplateSummary]
})
RequestPathParams = TypedDict("RequestPathParams", {
    "templateName": str, "sectionName": str
})


def get_template_summary(template_name:str, section_name:str) -> Optional[TemplateSummary]:
    """
    get template summary for specific template name and section
    """

    try:
        table = dynamo.Table(TEMPLATE_SUMMARY_TABLE_NAME)

        res = table.query(
            KeyConditionExpression=Key("templateName").eq(template_name) & Key("sectionName").eq(section_name)
        )

        logger.info(utils.jdumps(dict(res)))

        if len(res["Items"]) == 0:
            return None
        
        return typing.cast(TemplateSummary, res["Items"][0])
    except Exception as ex:
        raise ex

def validate_path_params(template_name:str, section_name:str):
    if template_name == "":
        raise ValueError("templateName must be specified")
    
    if section_name not in ["Parameters", "Resources", "Outputs"]:
        raise ValueError(f"sectionName : {section_name} must be one of 'Parameters' or 'Resources' or 'Outputs'")

def lambda_handler(event:dict, context) -> Response:

    logger.info(utils.jdumps(event))

    # get template name and section name from path
    try:
        params:RequestPathParams = event.get("pathParameters", {})
        template_name = params.get("templateName", "")
        section_name = params.get("sectionName", "")
        validate_path_params(template_name, section_name)
    except Exception as ex:
        logger.error("invalid path parameters", exc_info=True)
        res:ResponseBody = {
            "error": "invalid path parameters : " + str(ex),
            "templateSummary": None,
        }
        return {
            "statusCode": 400,
            "body": utils.jdumps(dict(res))
        }
    
    # get template summary
    try:
        template_summary = get_template_summary(
            template_name, section_name,
        )
    except Exception as ex:
        logger.info("template summary cannot be retreived", exc_info=True)
        res:ResponseBody = {
            "error": "template summary cannot be retreived" + str(ex),
            "templateSummary": None,
        }
        return {
            "statusCode": 500,
            "body": utils.jdumps(dict(res))
        }
    
    res:ResponseBody = {
        "error": None,
        "templateSummary": template_summary,
    }
    return {
        "statusCode": 200,
        "body": utils.jdumps(dict(res))
    }

    