from fastapi import APIRouter, HTTPException

from app.schemas.sensor_schema import SensorCreate

from app.services.sensor_service import (
    create_sensor_data,
    get_sensor_history,
    get_latest_sensor
)


router = APIRouter(
    prefix="/api/sensors",
    tags=["Sensors"]
)



@router.post("/")
async def create_sensor(
    sensor: SensorCreate
):

    return await create_sensor_data(sensor)




@router.get("/{machine_id}")
async def sensor_history(
    machine_id:str
):

    return await get_sensor_history(machine_id)




@router.get("/{machine_id}/latest")
async def latest_sensor(
    machine_id:str
):

    sensor = await get_latest_sensor(machine_id)


    if sensor is None:

        raise HTTPException(
            status_code=404,
            detail="Sensor data not found"
        )


    return sensor