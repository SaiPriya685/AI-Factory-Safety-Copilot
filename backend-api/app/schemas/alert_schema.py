from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AlertCreate(BaseModel):
    camera_id: str
    worker_id: str
    alert_type: str
    confidence: float
    risk_score: int
    status: str = "Active"


class AlertResponse(BaseModel):
    id: str
    camera_id: str
    worker_id: str
    alert_type: str
    confidence: float
    risk_score: int
    status: str
    created_at: datetime


class AlertResolve(BaseModel):
    status: str = "Resolved"