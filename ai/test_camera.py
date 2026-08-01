import cv2

from ai.utils.camera import CameraManager


camera = CameraManager()

while True:

    frame = camera.read()

    if frame is None:
        break

    fps = camera.calculate_fps()

    cv2.putText(
        frame,
        f"FPS : {fps}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2,
    )

    cv2.imshow("Camera Test", frame)

    key = cv2.waitKey(1)

    if key == ord("q"):
        break

camera.release()