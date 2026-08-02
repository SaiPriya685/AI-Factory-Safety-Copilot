from datetime import datetime
from pydantic import BaseModel, Field


class IncidentCreate(BaseModel):
    camera_id: str
    worker_id: str
    incident_type: str
    confidence: float = Field(..., ge=0, le=1)
    risk_score: int = Field(..., ge=0, le=100)
    image_url: str | None = None


class IncidentResponse(BaseModel):
    id: str
    camera_id: str
    worker_id: str
    incident_type: str
    confidence: float
    risk_score: int
    image_url: str | None
    created_at: datetime