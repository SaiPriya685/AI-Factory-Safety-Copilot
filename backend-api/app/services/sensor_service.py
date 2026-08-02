from app.database.database import get_database
from datetime import datetime



async def create_sensor_data(data):

    database = get_database()


    sensor = {
        "machine_id": data.machine_id,
        "temperature": data.temperature,
        "humidity": data.humidity,
        "vibration": data.vibration,
        "gas_level": data.gas_level,
        "timestamp": datetime.utcnow()
    }


    result = await database.sensor_data.insert_one(sensor)


    sensor["id"] = str(result.inserted_id)


    return sensor




async def get_sensor_history(machine_id):

    database = get_database()

    sensors = []


    cursor = database.sensor_data.find(
        {
            "machine_id": machine_id
        }
    ).sort(
        "timestamp",
        -1
    )


    async for sensor in cursor:

        sensor["id"] = str(sensor["_id"])

        del sensor["_id"]

        sensors.append(sensor)


    return sensors




async def get_latest_sensor(machine_id):

    database = get_database()


    sensor = await database.sensor_data.find_one(
        {
            "machine_id": machine_id
        },
        sort=[
            (
                "timestamp",
                -1
            )
        ]
    )


    if sensor:

        sensor["id"] = str(sensor["_id"])

        del sensor["_id"]


    return sensor