import os
from typing import Any, Dict, List, Optional, TypedDict, Union

APPROVER_TABLE_NAME=os.environ["DYNAMO_APPROVER_TABLE_NAME"]

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

Approver = TypedDict("Approver", {
    "name": str, "description": Optional[str], 
    "addresses": List[str],
    "topicArn": str,
})
