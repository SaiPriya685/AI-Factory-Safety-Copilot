from pydantic import BaseModel
from datetime import datetime


class MachineCreate(BaseModel):

    machine_id: str
    machine_name: str
    department: str
    temperature: float
    humidity: float
    vibration: float
    health_score: float
    failure_prediction: str
    status: str = "Running"



class MachineUpdate(BaseModel):

    temperature: float | None = None
    humidity: float | None = None
    vibration: float | None = None
    health_score: float | None = None
    failure_prediction: str | None = None
    status: str | None = None