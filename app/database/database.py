from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings
from app.core.logger import logger


class MongoDB:
    client: AsyncIOMotorClient | None = None
    database: AsyncIOMotorDatabase | None = None


mongodb = MongoDB()


async def connect_to_mongodb() -> None:
    """
    Connect to MongoDB.
    """

    try:
        mongodb.client = AsyncIOMotorClient(settings.MONGODB_URL)

        mongodb.database = mongodb.client[settings.DATABASE_NAME]

        await mongodb.client.admin.command("ping")

        logger.info("✅ MongoDB Connected Successfully")

    except Exception as e:
        logger.error(f"MongoDB Connection Failed : {e}")
        raise


async def close_mongodb_connection() -> None:
    """
    Close MongoDB Connection
    """

    if mongodb.client:
        mongodb.client.close()

        logger.info("MongoDB Connection Closed")


def get_database() -> AsyncIOMotorDatabase:
    return mongodb.database