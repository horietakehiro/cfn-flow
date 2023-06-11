import json
import os
import tempfile
import typing
from logging import INFO
from typing import Any, Dict, List, Optional, TypedDict

import boto3
import utils
from approvers_common import (APPROVER_TABLE_NAME, PUT_CORS_HEADERS, Approver,
                              Response)
from aws_xray_sdk.core import patch_all, xray_recorder
from boto3.dynamodb.conditions import Key

dynamo = boto3.resource("dynamodb")
sns = boto3.client("sns")


get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)

patch_all()

class RequestBody(TypedDict):
    name: str
    description: Optional[str]
    addresses: List[str]
class ResponseBody(TypedDict):
    error: Optional[str]
    approver: Optional[Approver]

def put_approver(approver:Approver) -> Approver:
    try:
        table = dynamo.Table(APPROVER_TABLE_NAME)
        res = table.put_item(
            Item=approver, # type: ignore
        )
        logger.info(utils.jdumps(dict(res)))
    except Exception as ex:
        raise ex
    return approver

def put_approver_topic(req_body:RequestBody) -> Approver:
    topic_name = f"cfn-flow-approver-topic-{req_body['name']}"
    res = sns.list_topics()
    logger.info(utils.jdumps(dict(res)))

    # if topic has not yet created, create firstly
    if topic_name not in [t["TopicArn"].split(":")[-1] for t in res["Topics"]]: # type: ignore
        res = sns.create_topic(Name=topic_name)
        logger.info(utils.jdumps(dict(res)))
        topic_arn = res["TopicArn"]
    else:
        topic_arn = [t["TopicArn"].split(":")[-1] for t in res["Topics"]][0] # type: ignore

    res = sns.list_subscriptions_by_topic(
        TopicArn=topic_arn,
    )
    current_subscriptions = [s for s in res["Subscriptions"]]
    logger.info(utils.jdumps(dict(res)))

    unsubscribe_arns = [
        s["SubscriptionArn"] for s in current_subscriptions if s["Endpoint"] not in req_body["addresses"] # type: ignore
    ]
    for arn in unsubscribe_arns:
        res = sns.unsubscribe(SubscriptionArn=arn)
        logger.info(utils.jdumps(dict(res)))

    for address in req_body["addresses"]:
        if address in [s["Endpoint"] for s in current_subscriptions]: # type: ignore
            continue
        res = sns.subscribe(
            TopicArn=topic_arn,
            Protocol="email",
            Endpoint=address,
        )
    
    return Approver(
        **req_body, topicArn=topic_arn,
    )


def lambda_handler(event:dict, context) -> Response:

    logger.info(utils.jdumps(event))

    try:
        req_body: RequestBody = json.loads(event["body"])
    except Exception as ex:
        logger.error("invalid request body", exc_info=True)
        res:ResponseBody = {
            "error": "invalid request body received",
            "approver": None,
        }
        return {
            "statusCode": 400,
            "headers": PUT_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }
    
    
    try:
        approver = put_approver_topic(req_body)
        approver = put_approver(approver)
    except Exception as ex:
        logger.error("approver creation failed", exc_info=True)
        res:ResponseBody = {
            "error": "approver creation failed",
            "approver": None,
        }
        return {
            "statusCode": 500,
            "headers": PUT_CORS_HEADERS,
            "body": utils.jdumps(dict(res))
        }

    res:ResponseBody = {
        "error": None,
        "approver": approver,
    }
    return {
        "statusCode": 200,
        "headers": PUT_CORS_HEADERS,
        "body": utils.jdumps(dict(res))
    }

