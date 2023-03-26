import os
from typing import Dict, List, TypedDict, Optional, Any, Union

FLOW_TABLE_NAME=os.environ["DYNAMO_FLOW_TABLE_NAME"]
BUCKET_NAME=os.environ["S3_FLOW_BUCKET_NAME"]

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

Flow = TypedDict("Flow", {
    "name": str, "description": Optional[str], 
    "httpUrl": str, "s3Url": str, "createAt": str, "updateAt": str
})
