from fastapi import APIRouter

from app.schemas.ai_schema import DetectionRequest
from app.services.ai_service import process_detection


router = APIRouter(
    prefix="/api/ai",
    tags=["AI Detection"]
)


@router.post("/detection")
async def detect(data: DetectionRequest):
    return await process_detection(data)