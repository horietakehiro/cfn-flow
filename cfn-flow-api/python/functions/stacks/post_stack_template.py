import datetime as dt
import typing
from logging import INFO
from typing import Optional, OrderedDict, TypedDict, Union

import boto3
import utils
from aws_xray_sdk.core import patch_all, xray_recorder
from stacks_common import BUCKET_NAME, POST_CORS_HEADERS, Response

RequestPathParams = TypedDict("RequestPathParams", {
    "stackName": str, "regionName": str,
})
ResponseBody = TypedDict("ResponseBody", {
    "httpUrl": Optional[str], "error": Optional[str],
})

get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)

patch_all()

def get_template_body(stack_name:str, region_name:str) -> str:
    """
    get template body for specified stack and region
    """
    try:    
        print(region_name)
        client = boto3.client("cloudformation", region_name=region_name)

        res = client.get_template(StackName=stack_name)
        logger.info(utils.jdumps(dict(res)))

        body = typing.cast(Union[str, OrderedDict], res["TemplateBody"])
        if isinstance(body, OrderedDict):
            body = utils.jdumps(body)
        return body
    except Exception as ex:
        raise ex

    
def post_template_body(stack_name:str, body:str) -> str:
    """
    put template body on s3 bucket and return s3 http url of it
    """
    try:

        client = boto3.client("s3")

        cur_timestamp = dt.datetime.timestamp(utils.get_current_dt())
        basename = f"{stack_name}.json" if body.startswith("{") else f"{stack_name}.yaml"
        key = f"templates/{str(cur_timestamp)}/{basename}"

        res = client.put_object(
            Bucket=BUCKET_NAME,
            Key=key,
            Body=body,
        )
        logger.info(utils.jdumps(dict(res)))

        # return f""
        return utils.convert_s3_to_http(f"s3://{BUCKET_NAME}/{key}")

    except Exception as ex:
        raise ex

def validate_path_params(stack_name:str, region_name:str):
    if stack_name == "":
        raise ValueError("stackName must be specified")
    if region_name == "":
        raise ValueError("regionName must be specified")

def lambda_handler(event:dict, context) -> Response:

    # get stack name and region name from path params
    try:
        params:RequestPathParams = event.get("pathParameters", None)
        stack_name = params.get("stackName", "") if params is not None else ""
        region_name = params.get("regionName", "") if params is not None else ""
        validate_path_params(stack_name, region_name)
    except Exception as ex:
        msg = "invalid path parameters : "
        logger.error(msg, exc_info=True)
        res:ResponseBody = {
            "httpUrl": None,
            "error": msg + str(ex)
        }
        return {
            "statusCode": 400,
            "headers": POST_CORS_HEADERS,
            "body": utils.jdumps(dict(res)),
        }
    
    # get template body
    try:
        template_body = get_template_body(stack_name, region_name)
    except Exception as ex:
        msg = f"failed to get template body for {stack_name} on {region_name} : "
        logger.error(msg, exc_info=True)
        res:ResponseBody = {
            "httpUrl": None,
            "error": msg + str(ex)
        }
        return {
            "statusCode": 500,
            "headers": POST_CORS_HEADERS,
            "body": utils.jdumps(dict(res)),
        }
    
    # put template body
    try:
        http_url = post_template_body(stack_name, template_body)
    except Exception as ex:
        msg = f"failed to put template body for {stack_name} on {region_name} : "
        logger.error(msg, exc_info=True)
        res:ResponseBody = {
            "httpUrl": None,
            "error": msg + str(ex)
        }
        return {
            "statusCode": 500,
            "headers": POST_CORS_HEADERS,
            "body": utils.jdumps(dict(res)),
        }
    
    res:ResponseBody = {
        "httpUrl": http_url,
        "error": None,
    }
    return {
        "statusCode": 200,
        "headers": POST_CORS_HEADERS,
        "body": utils.jdumps(dict(res))
    }
    
    



