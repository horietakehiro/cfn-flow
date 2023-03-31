import os
from typing import Any, Dict, List, Optional, TypedDict, Union

# TEMPLATE_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_TABLE_NAME"]
# TEMPLATE_SUMMARY_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_SUMMARY_TABLE_NAME"]
BUCKET_NAME=os.environ["S3_TEMPLATE_BUCKET_NAME"]

GET_CORS_HEADERS = {
    'Access-Control-Allow-Headers': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,GET'
}
PUT_CORS_HEADERS = {
    'Access-Control-Allow-Headers': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,PUT'
}
DELETE_CORS_HEADERS = {
    'Access-Control-Allow-Headers': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,DELETE'
}
POST_CORS_HEADERS = {
    'Access-Control-Allow-Headers': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,POST'
}


Response = TypedDict("Response", {
    "statusCode": int, "body": str, "headers": Dict[str, str]
})

Stack = TypedDict("Stack", {
    "name": str, "description": Optional[str], 
    # "httpUrl": str, "s3Url": str, "createAt": str, "updateAt": str
})
Parameter = TypedDict("Parameter", {
    "name": str,
    "type": str,
    "default": Optional[str],
    "description": Optional[str],
    "allowedPattern": Optional[str],
    "allowedValues": List[str],
    "constraintDescription": Optional[str],
    "maxLength": Optional[int],
    "minLength": Optional[int],
    "maxValue": Optional[int],
    "minValue": Optional[int],
    "noEcho": bool,
})
Resource = TypedDict("Resource", {
    "name": str,
    "type": str,
})
Output = TypedDict("Outputs", {
    "name": str,
    "value": str,
    "exportName": Optional[str],
})

TemplateSummary = TypedDict("TemplateSummary", {
    "templateName": str, "sectionName": str,
    "summary": Union[List[Parameter], List[Resource], List[Output]]
})

TemplateSummaries = Dict[str, TemplateSummary]
