import cv2


from ai.utils.camera import CameraManager
from ai.detection.detector import Detector
from ai.analytics.safety_analyzer import SafetyAnalyzer


camera = CameraManager()

detector = Detector()

analyzer = SafetyAnalyzer()


while True:

    frame = camera.read()

    if frame is None:
        break


    results = detector.detect(frame)


    safety_data = analyzer.analyze(results)


    if safety_data:
        print(safety_data)


    frame = detector.draw(frame, results)


    cv2.imshow(
        "Detector Test",
        frame
    )


    key = cv2.waitKey(1)


    if key == ord("q"):
        break


camera.release()

cv2.destroyAllWindows()