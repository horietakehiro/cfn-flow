from utils import utils
from logging import DEBUG
get_logger = utils.logger_manager()

logger = get_logger(__name__, DEBUG)

def lambda_handler(event: dict, context) -> dict:

    logger.debug(utils.jdumps(event))

    



    return {}