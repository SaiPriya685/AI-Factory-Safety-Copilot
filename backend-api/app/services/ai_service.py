from datetime import datetime

from app.database.database import get_database
from app.websocket.manager import manager


async def process_detection(data):

    database = get_database()

    # Incident Document
    incident = {
        "camera_id": data.camera_id,
        "worker_id": data.worker_id,
        "incident_type": data.incident_type,
        "confidence": data.confidence,
        "risk_score": data.risk_score,
        "image_url": data.image_url,
        "created_at": datetime.utcnow()
    }

    incident_result = await database.incidents.insert_one(incident)

    # Alert Document
    alert = {
        "camera_id": data.camera_id,
        "worker_id": data.worker_id,
        "alert_type": data.incident_type,
        "confidence": data.confidence,
        "risk_score": data.risk_score,
        "status": "Active",
        "created_at": datetime.utcnow()
    }

    alert_result = await database.alerts.insert_one(alert)

    # Broadcast Alert
    await manager.broadcast({
        "type": "NEW_ALERT",
        "camera_id": data.camera_id,
        "worker_id": data.worker_id,
        "alert_type": data.incident_type,
        "risk_score": data.risk_score,
        "status": "Active"
    })

    return {
        "message": "Detection processed successfully",
        "incident_id": str(incident_result.inserted_id),
        "alert_id": str(alert_result.inserted_id)
    }