from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
from app.core.logger import logger
from bson import ObjectId
import copy

class MockCursor:
    def __init__(self, data):
        self.data = data
        self.index = 0
    def sort(self, *args, **kwargs):
        return self
    def __aiter__(self):
        return self
    async def __anext__(self):
        if self.index < len(self.data):
            val = self.data[self.index]
            self.index += 1
            return val
        raise StopAsyncIteration

class MockCollection:
    def __init__(self, name):
        self.name = name
        self.docs = []
        # Prepopulate workers & machines so overview dashboard has baseline counts
        if name == "workers":
            self.docs = [{"_id": ObjectId(), "name": f"Worker {i}", "status": "Active"} for i in range(30)]
        elif name == "machines":
            self.docs = [{"_id": ObjectId(), "name": f"Machine {i}", "status": "Active"} for i in range(12)]
    async def insert_one(self, doc):
        if "_id" not in doc:
            doc["_id"] = ObjectId()
        self.docs.append(doc)
        class InsertResult:
            inserted_id = doc["_id"]
        return InsertResult()
    async def count_documents(self, query):
        return len(self.docs)
    def find(self, query=None):
        return MockCursor(copy.deepcopy(self.docs))
    async def find_one(self, query):
        if not self.docs:
            return None
        return self.docs[0]
    async def delete_one(self, query):
        if self.docs:
            self.docs.pop(0)
            class DeleteResult:
                deleted_count = 1
            return DeleteResult()
        class DeleteResult:
            deleted_count = 0
        return DeleteResult()
    async def delete_many(self, query):
        count = len(self.docs)
        self.docs.clear()
        class DeleteResult:
            deleted_count = count
        return DeleteResult()
    async def update_one(self, query, update):
        class UpdateResult:
            modified_count = 1
        return UpdateResult()

class MockDatabase:
    def __init__(self):
        self.collections = {}
    def __getattr__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection(name)
        return self.collections[name]

class MongoDB:
    client: AsyncIOMotorClient | None = None
    database: AsyncIOMotorDatabase | MockDatabase | None = None

mongodb = MongoDB()

async def connect_to_mongodb() -> None:
    try:
        # Reduced timeout to 2 seconds for faster demo startup check
        mongodb.client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
        mongodb.database = mongodb.client[settings.DATABASE_NAME]
        await mongodb.client.admin.command("ping")
        logger.info("✅ MongoDB Connected Successfully")
    except Exception as e:
        logger.warning(f"⚠️ MongoDB Connection Failed ({e}). Falling back to In-Memory Mock Database.")
        mongodb.database = MockDatabase()

async def close_mongodb_connection() -> None:
    if mongodb.client:
        mongodb.client.close()
        logger.info("MongoDB Connection Closed")

def get_database() -> AsyncIOMotorDatabase:
    return mongodb.database