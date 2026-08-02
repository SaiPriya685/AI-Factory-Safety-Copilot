from fastapi import APIRouter, HTTPException

from app.schemas.worker_schema import WorkerCreate

from app.services.worker_service import (
    create_worker,
    get_workers,
    get_worker
)


router = APIRouter(
    prefix="/api/workers",
    tags=["Workers"]
)



@router.post("/")
async def create_new_worker(
    worker: WorkerCreate
):

    return await create_worker(worker)




@router.get("/")
async def fetch_workers():

    return await get_workers()




@router.get("/{worker_id}")
async def fetch_worker(
    worker_id:str
):

    worker = await get_worker(worker_id)


    if worker is None:

        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )


    return worker