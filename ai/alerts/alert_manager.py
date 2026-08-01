"""
alert_manager.py

Handles factory safety alerts.
"""


from datetime import datetime

from ai.utils.logger import Logger



class AlertManager:


    def __init__(self):

        self.logger = Logger.get_logger(
            "AlertManager"
        )

        self.logger.info(
            "Alert manager initialized."
        )



    def generate_alert(self, risk_data):


        level = risk_data["risk_level"]

        score = risk_data["risk_score"]

        violations = risk_data.get(
            "violations",
            []
        )


        alert = {


            "time":
            datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            ),



            "risk_level":
            level,



            "risk_score":
            score,



            "violations":
            violations,



            "message":
            self.get_message(
                level,
                violations
            )

        }



        if level != "LOW":

            self.logger.warning(
                alert["message"]
            )

        else:

            self.logger.info(
                alert["message"]
            )



        return alert




    def get_message(
        self,
        level,
        violations
    ):



        if violations:


            violation_names = [
                v["type"]
                for v in violations
            ]


            return (
                f"{level} risk detected: "
                +
                ", ".join(
                    violation_names
                )
            )



        messages = {


            "LOW":
            "Normal operation. No safety threat.",



            "MEDIUM":
            "Warning: Possible safety concern detected.",



            "HIGH":
            "High risk! Immediate attention required.",



            "CRITICAL":
            "CRITICAL ALERT! Emergency response required."

        }



        return messages.get(
            level,
            "Unknown risk level"
        )