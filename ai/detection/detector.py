"""
detector.py

Runs YOLO inference on camera frames.
"""


from ultralytics import YOLO

from ai.detection.classes import SAFETY_CLASSES

from ai.utils.logger import Logger

from ai.utils.config import (
    PERSON_MODEL,
    CONFIDENCE_THRESHOLD
)



class Detector:


    def __init__(self):

        self.logger = Logger.get_logger(
            "Detector"
        )

        self.logger.info(
            "Loading YOLO model..."
        )


        self.model = YOLO(
            PERSON_MODEL
        )


        self.logger.info(
            "YOLO loaded successfully."
        )



    def detect(self, frame):


        results = self.model(
            frame,
            conf=CONFIDENCE_THRESHOLD,
            verbose=False
        )


        detections = []



        for result in results:


            boxes = result.boxes



            for box in boxes:


                class_id = int(
                    box.cls[0]
                )


                confidence = float(
                    box.conf[0]
                )


                detections.append({

                    "class_id": class_id,

                    "name":
                    SAFETY_CLASSES.get(
                        class_id,
                        "unknown"
                    ),

                    "confidence":
                    confidence

                })



        return results, detections



    def draw(self, frame, results):


        annotated = results[0].plot()


        return annotated