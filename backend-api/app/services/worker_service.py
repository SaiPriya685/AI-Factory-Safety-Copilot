from app.database.database import get_database
from datetime import datetime



async def create_worker(data):

    database = get_database()


    worker = {
        "worker_id": data.worker_id,
        "name": data.name,
        "department": data.department,
        "shift": data.shift,
        "status": data.status,
        "created_at": datetime.utcnow()
    }


    result = await database.workers.insert_one(worker)


    worker["id"] = str(result.inserted_id)

    return worker




async def get_workers():

    database = get_database()

    workers = []


    cursor = database.workers.find()


    async for worker in cursor:

        worker["id"] = str(worker["_id"])

        del worker["_id"]

        workers.append(worker)


    return workers




async def get_worker(worker_id):

    database = get_database()


    worker = await database.workers.find_one(
        {
            "worker_id": worker_id
        }
    )


    if worker:

        worker["id"] = str(worker["_id"])

        del worker["_id"]


    return worker