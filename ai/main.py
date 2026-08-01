"""
main.py

AI Factory Safety Copilot
Main execution pipeline.
"""


import cv2
from ai.report.response_formatter import format_ai_response

from ai.utils.camera import CameraManager


from ai.detection.ppe_detector import PPEDetector

from ai.analytics.safety_analyzer import SafetyAnalyzer

from ai.analytics.risk_engine import RiskEngine

from ai.alerts.alert_manager import AlertManager

from ai.outputs.incident_logger import IncidentLogger



def main():


    camera = CameraManager()

    detector = PPEDetector()

    analyzer = SafetyAnalyzer()

    risk_engine = RiskEngine()

    alert_manager = AlertManager()

    incident_logger = IncidentLogger()



    while True:


        frame = camera.read()


        if frame is None:
            break



        # 1. Detect objects

        results, detections = detector.detect(
            frame
        )



        # 2. Analyze safety violations

        analysis = analyzer.analyze(
            detections
        )

        print("\nDetections:")
        for item in analysis["detections"]:
            print(item)


        print("\nViolations:")

        for item in analysis["violations"]:
            print(item)
        # Format AI response for backend/frontend

        ai_response = format_ai_response(
            analysis["violations"]
        )


        print("\nAI Response:")

        print(ai_response)
        # 3. Calculate risk

        risk = risk_engine.calculate(
            analysis
        )



        # 4. Generate alert

        alert = alert_manager.generate_alert(
            risk
        )



        # 5. Save incidents only when risk exists

        if risk["risk_level"] != "LOW":


            incident_logger.save(
                alert,
                analysis
            )



        # Display detections

        frame = detector.draw(
            frame,
            results
        )



        # Display risk level

        cv2.putText(
            frame,
            f"Risk: {risk['risk_level']}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            2
        )



        cv2.imshow(
            "AI Factory Safety Copilot",
            frame
        )



        key = cv2.waitKey(1)



        if key == ord("q"):

            break



    camera.release()

    cv2.destroyAllWindows()



if __name__ == "__main__":

    main()