import os
from typing import Dict, TypedDict, Optional, Any

TEMPLATE_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_TABLE_NAME"]
TEMPLATE_SUMMARY_TABLE_NAME=os.environ["DYNAMO_TEMPLATE_SUMMARY_TABLE_NAME"]
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


Response = TypedDict("Response", {
    "statusCode": int, "body": str, "headers": Dict[str, str]
})

Template = TypedDict("Template", {
    "name": str, "description": Optional[str], 
    "httpUrl": str, "s3Url": str, "createAt": str, "updateAt": str
})
TemplateSummary = TypedDict("TemplateSummary", {
    "templateName": str, "sectionName": str,
    "summary": Dict[Any, Any]
})
TemplateSummaries = Dict[str, TemplateSummary]