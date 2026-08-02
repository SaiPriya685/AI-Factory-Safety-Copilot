from fastapi import APIRouter, HTTPException

from app.schemas.machine_schema import (
    MachineCreate,
    MachineUpdate
)

from app.services.machine_service import (
    create_machine,
    get_machines,
    get_machine,
    update_machine
)


router = APIRouter(
    prefix="/api/machines",
    tags=["Machines"]
)



@router.post("/")
async def create_new_machine(
    machine: MachineCreate
):

    return await create_machine(machine)



@router.get("/")
async def fetch_machines():

    return await get_machines()



@router.get("/{machine_id}")
async def fetch_machine(
    machine_id:str
):

    machine = await get_machine(machine_id)


    if machine is None:

        raise HTTPException(
            status_code=404,
            detail="Machine not found"
        )


    return machine



@router.put("/{machine_id}")
async def update_machine_api(
    machine_id:str,
    machine:MachineUpdate
):

    result = await update_machine(
        machine_id,
        machine
    )


    if result == 0:

        raise HTTPException(
            status_code=404,
            detail="Machine not found"
        )


    return {
        "message":"Machine updated successfully"
    }