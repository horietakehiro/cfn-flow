import datetime as dt
import json
import logging
from typing import Callable, Dict, List, Union
from urllib.parse import urlparse

import boto3


def jdumps(j:Union[Dict, List], indent=2, default=str) -> str:
    if not isinstance(j, dict) and not isinstance(j, list):
        raise TypeError

    return json.dumps(j, indent=indent, default=default)

def convert_http_to_s3(url:str) -> str:
    """
    convert http url to s3 url
    e.g.:
        https://bucket-name.s3.ap-northeast-1.amazonaws.com/path/to/object
        -> s3://bucket-name/path/to/object
    """
    u = urlparse(url)
    hostname = u.hostname
    if hostname is None:
        raise ValueError(f"given httpUrl : {url} is invalid")
    
    bucket = hostname.split(".")[0]
    key = u.path

    return f"s3://{bucket}{key}"

def convert_s3_to_http(url:str) -> str:
    """
    convert s3 url to http url
    e.g.:
        s3://bucket-name/path/to/object
        -> https://bucket-name.s3.ap-northeast-1.amazonaws.com/path/to/object
    """

    bucket, key = url.replace("s3://", "").split("/", maxsplit=1)
    # get region of the bucket
    client = boto3.client("s3")
    res = client.get_bucket_location(Bucket=bucket)
    region:str = res["LocationConstraint"]

    http_url = f"https://{bucket}.s3.{region}.amazonaws.com/{key}"
    return http_url


def strftime(datetime:dt.datetime, fmt="%Y-%m-%dT%H:%M:%S%z") -> str:
    return dt.datetime.strftime(datetime, fmt)

def get_current_dt(hours=9) -> dt.datetime:
    t_delta = dt.timedelta(hours=hours)
    timezone = dt.timezone(t_delta, "Asia/Tokyo")
    now = dt.datetime.now(timezone)

    return now


def logger_manager() -> Callable[[str, int], logging.Logger]:

    loggers:dict = {}
    logging.basicConfig()

    def get_logger(module:str, loglevel:int) -> logging.Logger:
        nonlocal loggers
        if loggers.get(module, None):
            return loggers[module]

        logger = logging.getLogger()
        logger.setLevel(loglevel)
        for handler in logger.handlers:
            handler.setFormatter(logging.Formatter(
                "%(asctime)s %(name)s:%(module)s.%(funcName)s.%(lineno)s [%(levelname)s]: %(message)s",
            ))
        loggers[module] = logger

        return logger

    return get_logger
