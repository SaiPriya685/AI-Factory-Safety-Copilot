from pydantic import BaseModel


class DetectionRequest(BaseModel):
    camera_id: str
    worker_id: str
    incident_type: str
    confidence: float
    risk_score: int
    image_url: str

class AIQueryRequest(BaseModel):
    query: str