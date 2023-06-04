import os
from typing import Any, Dict, List, Optional, TypedDict, Union

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
