from loguru import logger
import sys

logger.remove()

logger.add(
    sys.stdout,
    level="INFO",
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level}</level> | {message}",
)

logger.add(
    "logs/backend.log",
    rotation="10 MB",
    retention="10 days",
    compression="zip",
)