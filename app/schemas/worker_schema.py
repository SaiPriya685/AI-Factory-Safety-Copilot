from pydantic import BaseModel
from datetime import datetime


class WorkerCreate(BaseModel):
    worker_id: str
    name: str
    department: str
    shift: str
    status: str = "Active"


class WorkerResponse(BaseModel):
    id: str
    worker_id: str
    name: str
    department: str
    shift: str
    status: str
    created_at: datetime