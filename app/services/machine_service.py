from app.database.database import get_database
from datetime import datetime


async def create_machine(data):

    database = get_database()

    machine = {
        "machine_id": data.machine_id,
        "machine_name": data.machine_name,
        "department": data.department,
        "temperature": data.temperature,
        "humidity": data.humidity,
        "vibration": data.vibration,
        "health_score": data.health_score,
        "failure_prediction": data.failure_prediction,
        "status": data.status,
        "created_at": datetime.utcnow()
    }


    result = await database.machines.insert_one(machine)


    machine["id"] = str(result.inserted_id)

    return machine



async def get_machines():

    database = get_database()

    machines = []


    cursor = database.machines.find()


    async for machine in cursor:

        machine["id"] = str(machine["_id"])

        del machine["_id"]

        machines.append(machine)


    return machines



async def get_machine(machine_id):

    database = get_database()


    machine = await database.machines.find_one(
        {
            "machine_id": machine_id
        }
    )


    if machine:

        machine["id"] = str(machine["_id"])

        del machine["_id"]


    return machine



async def update_machine(machine_id, data):

    database = get_database()


    update_data = {
        key:value
        for key,value in data.dict().items()
        if value is not None
    }


    result = await database.machines.update_one(
        {
            "machine_id": machine_id
        },
        {
            "$set": update_data
        }
    )


    return result.modified_count