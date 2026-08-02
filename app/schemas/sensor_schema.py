from pydantic import BaseModel
from datetime import datetime


class SensorCreate(BaseModel):

    machine_id: str
    temperature: float
    humidity: float
    vibration: float
    gas_level: float


class SensorResponse(BaseModel):

    id: str
    machine_id: str
    temperature: float
    humidity: float
    vibration: float
    gas_level: float
    timestamp: datetime