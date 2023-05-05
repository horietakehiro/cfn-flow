import os
from typing import Any, Dict, List, Literal, Optional, TypedDict, Union

PLAN_TABLE_NAME=os.environ["DYNAMO_FLOW_PLANS_TABLE_NAME"]
PLAN_GSI_NAME=os.environ["DYNAMO_FLOW_PLANS_GSI_NAME"]

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

LastStatus = Literal["inProgress", "completed", "failed", "unused"]
Direction = Literal["forward", "backward"]
Plan = TypedDict("Flow", {
    "planName": str, "flowName": str,
    "description": Optional[str], 
    "direction": Direction,
    "lastStatus" : LastStatus,
})
