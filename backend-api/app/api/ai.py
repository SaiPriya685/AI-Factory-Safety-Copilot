import sys
import cv2
from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.ai_schema import DetectionRequest
from app.services.ai_service import process_detection

# Root Path Setup
ROOT_DIR = Path(__file__).resolve().parents[3]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

# Load AI Engine & YOLO Model
try:
    from ai.detection.ppe_detector import PPEDetector
    ppe_engine = PPEDetector()
    print("✅ PPEDetector loaded successfully!")
except Exception as e:
    print(f"⚠️ PPEDetector load error: {e}")
    ppe_engine = None

# Fallback direct YOLO model for instant boxes
from ultralytics import YOLO
yolo_model = YOLO("yolov8n.pt") 


router = APIRouter(
    prefix="/api/ai",
    tags=["AI Detection"]
)

@router.post("/detection")
async def detect(data: DetectionRequest):
    return await process_detection(data)


def generate_ai_camera_stream():
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    while True:
        success, frame = cap.read()
        if not success:
            break

        annotated_frame = None

        # 1. Try PPEDetector process_frame
        if ppe_engine and hasattr(ppe_engine, 'process_frame'):
            try:
                res = ppe_engine.process_frame(frame)
                if res is not None and isinstance(res, tuple):
                    annotated_frame = res[0] # Agar frame + alerts return kar raha ho
                elif res is not None:
                    annotated_frame = res
            except Exception:
                pass

        # 2. Try PPEDetector model property with low confidence
        if annotated_frame is None and ppe_engine and hasattr(ppe_engine, 'model'):
            try:
                results = ppe_engine.model(frame, conf=0.10) # 10% threshold to catch all PPE
                annotated_frame = results[0].plot()
            except Exception:
                pass

        # 3. Fail-safe Live Bounding Box (Always works for Persons/Objects in live demo!)
        if annotated_frame is None or annotated_frame is frame:
            results = yolo_model(frame, conf=0.25)
            annotated_frame = results[0].plot()

        # Encode frame
        ret, buffer = cv2.imencode('.jpg', annotated_frame)
        if not ret:
            continue

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

    cap.release()


@router.get("/stream")
async def stream_ai_video():
    return StreamingResponse(
        generate_ai_camera_stream(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )