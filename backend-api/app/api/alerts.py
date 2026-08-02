from fastapi import APIRouter, HTTPException

from app.schemas.alert_schema import AlertCreate
from app.services.alert_service import (
    create_alert,
    get_alerts,
    get_active_alerts,
    resolve_alert
)


router = APIRouter(
    prefix="/api/alerts",
    tags=["Alerts"]
)



@router.post("/")
async def create_new_alert(
    alert: AlertCreate
):

    return await create_alert(alert)



@router.get("/")
async def fetch_alerts():

    return await get_alerts()



@router.get("/active")
async def active_alerts():

    return await get_active_alerts()



@router.put("/{alert_id}/resolve")
async def resolve_alert_api(
    alert_id:str
):

    result = await resolve_alert(alert_id)

    if result == 0:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return {
        "message":"Alert resolved successfully"
    }