from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <--- Added Import

from app.api.auth import router as auth_router
from app.api.incidents import router as incident_router
from app.api.dashboard import router as dashboard_router
from app.api.alerts import router as alert_router
from app.api.workers import router as worker_router
from app.api.machines import router as machine_router
from app.api.sensors import router as sensor_router
from app.websocket.routes import router as websocket_router
from app.api.ai import router as ai_router
from app.core.config import settings
from app.core.logger import logger
from app.database.database import (
    connect_to_mongodb,
    close_mongodb_connection,
)


@asynccontextmanager
async def lifespan(app: FastAPI):

    logger.info("Starting Backend...")

    await connect_to_mongodb()

    yield

    await close_mongodb_connection()

    logger.info("Backend Shutdown")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.API_VERSION,
    lifespan=lifespan,
)

# <--- Enable CORS Middleware --->
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Local testing ke liye sab allowed hai
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(incident_router)
app.include_router(dashboard_router)
app.include_router(alert_router)
app.include_router(worker_router)
app.include_router(machine_router)
app.include_router(sensor_router)
app.include_router(websocket_router)
app.include_router(ai_router)

@app.get("/")
async def home():

    return {
        "message": "AI Factory Safety Copilot Backend Running",
        "status": "success"
    }