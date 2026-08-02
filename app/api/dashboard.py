from fastapi import APIRouter

from app.services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
async def get_dashboard():

    return await DashboardService.get_dashboard_data()