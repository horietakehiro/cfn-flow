import json
import logging
from typing import Callable

def jdumps(j:dict, indent=2, default=str) -> str:
    if not isinstance(j, dict):
        raise TypeError

    return json.dumps(j, indent=indent, default=default)


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
