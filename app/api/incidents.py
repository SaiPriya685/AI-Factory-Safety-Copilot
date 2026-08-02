from fastapi import APIRouter, HTTPException

from app.schemas.incident_schema import IncidentCreate
from app.services.incident_service import IncidentService

router = APIRouter(
    prefix="/api/incidents",
    tags=["Incidents"]
)


@router.post("/")
async def create_incident(data: IncidentCreate):

    incident_id = await IncidentService.create_incident(
        data.model_dump()
    )

    return {
        "success": True,
        "incident_id": incident_id
    }


@router.get("/")
async def get_incidents():

    return await IncidentService.get_all()


@router.get("/{incident_id}")
async def get_incident(incident_id: str):

    incident = await IncidentService.get_one(
        incident_id
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident Not Found"
        )

    return incident


@router.delete("/{incident_id}")
async def delete_incident(incident_id: str):

    deleted = await IncidentService.delete(
        incident_id
    )

    if deleted == 0:
        raise HTTPException(
            status_code=404,
            detail="Incident Not Found"
        )

    return {
        "success": True
    }