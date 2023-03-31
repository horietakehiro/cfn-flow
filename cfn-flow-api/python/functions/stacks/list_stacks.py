
import typing
from logging import INFO
from typing import List, Optional, TypedDict

import boto3
import utils
from stacks_common import GET_CORS_HEADERS, Response

Stack = TypedDict("Stack", {
    "stackName": str, "regionName": str,
})
ResponseBody = TypedDict("ResponseBody", {
    "stacks": Optional[List[Stack]], "error": Optional[str],
})
RequestPathParams = TypedDict("RequestPathParams", {
    "regionName": str,
})

get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)

def list_stacks(region_name:str) -> List[Stack]:
    """
    list stacks for the specified region
    """

    stacks:List[Stack] = []

    client = boto3.client("cloudformation", region_name=region_name)
    res = client.list_stacks()
    logger.info(utils.jdumps(dict(res)))
    stacks += [
        typing.cast(Stack, {"stackName": s["StackName"], "regionName": region_name})
        for s in res["StackSummaries"]
    ]
    next_token:Optional[str] = res.get("NextToken", None)
    while next_token is not None:
        res = client.list_stacks(NextToken=next_token)
        logger.info(utils.jdumps(dict(res)))
        stacks += [
            typing.cast(Stack, {"stackName": s["StackName"], "regionName": region_name})
            for s in res["StackSummaries"]
        ]
        next_token = res.get("NextToken", None)
    
    stacks = sorted(stacks, key=lambda s: s["stackName"])

    return stacks

def validate_path_params(region_name:str):
    if region_name == "":
        raise ValueError("regionName must be specified")
    
def lambda_handler(event:dict, context) -> Response:

    # get region name from path params
    try:
        params:RequestPathParams = event.get("pathParameters", None)
        region_name = params.get("regionName", "") if params is not None else ""
        validate_path_params(region_name)
    except Exception as ex:
        msg = "invalid path parameters : "
        logger.error(msg, exc_info=True)
        res:ResponseBody = {
            "stacks": None,
            "error": msg + str(ex)
        }
        return {
            "statusCode": 400,
            "headers": GET_CORS_HEADERS,
            "body": utils.jdumps(dict(res)),
        }
    
    # list stacks for the region
    try:
        stacks = list_stacks(region_name)
    except Exception as ex:
        msg = f"failed to list stacks on {region_name} : "
        logger.error(msg, exc_info=True)
        res:ResponseBody = {
            "stacks": None,
            "error": msg + str(ex)
        }
        return {
            "statusCode": 500,
            "headers": GET_CORS_HEADERS,
            "body": utils.jdumps(dict(res)),
        }

    res:ResponseBody = {
        "stacks": stacks,
        "error": None
    }
    return {
        "statusCode": 200,
        "headers": GET_CORS_HEADERS,
        "body": utils.jdumps(dict(res))
    }