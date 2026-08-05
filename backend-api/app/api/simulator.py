from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from app.database.database import get_database
from app.websocket.manager import manager

router = APIRouter(
    prefix="/api/simulator",
    tags=["Simulator"]
)

class SimulatorTriggerRequest(BaseModel):
    event: str
    zone: str
    level: str
    message: str

@router.post("/trigger")
async def trigger_event(data: SimulatorTriggerRequest):
    db = get_database()
    
    camera_id = f"CAM_{data.zone}_01" if data.zone else "CAM_A_01"
    worker_id = "WRK-3829"
    risk_score = 85 if data.level == "critical" else 55
    
    # 1. Insert Incident
    incident = {
        "camera_id": camera_id,
        "worker_id": worker_id,
        "incident_type": data.event,
        "confidence": 0.94,
        "risk_score": risk_score,
        "image_url": None,
        "created_at": datetime.utcnow()
    }
    await db.incidents.insert_one(incident)
    
    # 2. Insert Alert
    alert = {
        "camera_id": camera_id,
        "worker_id": worker_id,
        "alert_type": data.event,
        "confidence": 0.94,
        "risk_score": risk_score,
        "status": "Active",
        "created_at": datetime.utcnow()
    }
    await db.alerts.insert_one(alert)
    
    # 3. Broadcast Alert
    await manager.broadcast({
        "type": "NEW_ALERT",
        "camera_id": camera_id,
        "worker_id": worker_id,
        "alert_type": data.event,
        "risk_score": risk_score,
        "status": "Active"
    })
    
    return {"status": "success", "message": "Simulation event triggered"}

@router.post("/reset")
async def reset_simulator():
    db = get_database()
    await db.alerts.delete_many({})
    await db.incidents.delete_many({})
    return {"status": "success", "message": "Simulator database cleared"}
