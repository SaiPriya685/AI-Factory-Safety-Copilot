"""
ppe_detector.py

Detects worker PPE compliance.
"""


from ultralytics import YOLO

from ai.utils.logger import Logger


from ai.utils.config import (
    SAFETY_MODEL,
    CONFIDENCE_THRESHOLD
)


from ai.detection.classes import SAFETY_CLASSES

class PPEDetector:


    def __init__(self):

        self.logger = Logger.get_logger(
            "PPEDetector"
        )


        self.logger.info(
            "Loading PPE detection model..."
        )


        self.model = YOLO(
            SAFETY_MODEL
        )


        self.logger.info(
            "PPE detector initialized."
        )



    def detect(self, frame):


        results = self.model(
            frame,
            conf=CONFIDENCE_THRESHOLD,
            verbose=False
        )


        detections = []


        for result in results:


            for box in result.boxes:


                class_id = int(
                    box.cls[0]
                )


                confidence = float(
                    box.conf[0]
                )


                detections.append(

                    {

                    "class_id":
                        class_id,


                    "name":
                        SAFETY_CLASSES.get(
                            class_id,
                            "unknown"
                        ),


                    "confidence":
                        confidence

                    }

                )
    

        return results, detections
    def draw(self, frame, results):


        annotated = results[0].plot()

        return annotated