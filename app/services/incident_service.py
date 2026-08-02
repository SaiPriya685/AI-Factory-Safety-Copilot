from datetime import datetime
from bson import ObjectId

from app.database.database import get_database


class IncidentService:

    @staticmethod
    async def create_incident(data: dict):

        db = get_database()

        data["created_at"] = datetime.utcnow()

        result = await db.incidents.insert_one(data)

        return str(result.inserted_id)

    @staticmethod
    async def get_all():

        db = get_database()

        incidents = []

        async for item in db.incidents.find().sort("created_at", -1):
            item["id"] = str(item["_id"])
            del item["_id"]
            incidents.append(item)

        return incidents

    @staticmethod
    async def get_one(id: str):

        db = get_database()

        incident = await db.incidents.find_one(
            {"_id": ObjectId(id)}
        )

        if incident:
            incident["id"] = str(incident["_id"])
            del incident["_id"]

        return incident

    @staticmethod
    async def delete(id: str):

        db = get_database()

        result = await db.incidents.delete_one(
            {"_id": ObjectId(id)}
        )

        return result.deleted_count