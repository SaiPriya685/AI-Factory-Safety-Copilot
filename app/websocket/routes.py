from fastapi import APIRouter, WebSocket

from app.websocket.manager import manager


router = APIRouter()



@router.websocket("/ws/alerts")
async def websocket_alerts(
    websocket: WebSocket
):

    await manager.connect(websocket)


    try:

        while True:

            data = await websocket.receive_text()

            print(data)


    except Exception:

        manager.disconnect(websocket)