"""
camera.py

Camera manager for AI Factory Safety Copilot.

Responsibilities
----------------
- Open webcam
- Configure resolution
- Read frames
- Calculate FPS
- Handle camera failures
"""

from __future__ import annotations

import time
import cv2

from ai.utils.config import (
    CAMERA_ID,
    FRAME_WIDTH,
    FRAME_HEIGHT,
)

from ai.utils.logger import Logger


logger = Logger.get_logger("Camera")


class CameraManager:
    """
    Handles webcam/video stream.
    """

    def __init__(self) -> None:

        self.cap = cv2.VideoCapture(CAMERA_ID)

        if not self.cap.isOpened():
            logger.error("Unable to open camera.")
            raise RuntimeError("Camera not found.")

        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)

        self.previous_time = time.time()

        logger.info("Camera initialized successfully.")

    def read(self):

        success, frame = self.cap.read()

        if not success:
            logger.warning("Failed to read frame.")
            return None

        return frame

    def calculate_fps(self):

        current_time = time.time()

        fps = 1 / (current_time - self.previous_time)

        self.previous_time = current_time

        return int(fps)

    def release(self):

        if self.cap.isOpened():
            self.cap.release()

        cv2.destroyAllWindows()

        logger.info("Camera released.")