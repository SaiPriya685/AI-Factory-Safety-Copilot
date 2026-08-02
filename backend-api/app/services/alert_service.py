from app.database.database import get_database
from app.websocket.manager import manager
from datetime import datetime
from bson import ObjectId


async def create_alert(data):

    database = get_database()

    alert = {
        "camera_id": data.camera_id,
        "worker_id": data.worker_id,
        "alert_type": data.alert_type,
        "confidence": data.confidence,
        "risk_score": data.risk_score,
        "status": data.status,
        "created_at": datetime.utcnow()
    }


    result = await database.alerts.insert_one(alert)


    alert["id"] = str(result.inserted_id)


    # 🔴 Real-time WebSocket Alert
    await manager.broadcast(
        {
            "type": "NEW_ALERT",
            "camera_id": alert["camera_id"],
            "worker_id": alert["worker_id"],
            "alert_type": alert["alert_type"],
            "risk_score": alert["risk_score"],
            "status": alert["status"]
        }
    )


    return alert




async def get_alerts():

    database = get_database()

    alerts=[]


    cursor = database.alerts.find()


    async for alert in cursor:

        alert["id"] = str(alert["_id"])

        del alert["_id"]

        alerts.append(alert)


    return alerts




async def get_active_alerts():

    database = get_database()

    alerts=[]


    cursor = database.alerts.find(
        {
            "status":"Active"
        }
    )


    async for alert in cursor:

        alert["id"] = str(alert["_id"])

        del alert["_id"]

        alerts.append(alert)


    return alerts




async def resolve_alert(alert_id:str):

    database = get_database()


    result = await database.alerts.update_one(
        {
            "_id":ObjectId(alert_id)
        },
        {
            "$set":{
                "status":"Resolved"
            }
        }
    )


    return result.modified_count