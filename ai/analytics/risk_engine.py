"""
Risk Engine

Calculates factory safety risk
based on detected violations.
"""


from ai.utils.logger import Logger


class RiskEngine:


    def __init__(self):

        self.logger = Logger.get_logger(
            "RiskEngine"
        )

        self.logger.info(
            "Risk engine initialized."
        )



    def calculate(self, analysis):


        risk_score = 0


        violations = analysis.get(
            "violations",
            []
        )


        for violation in violations:


            severity = violation["severity"]



            if severity == "CRITICAL":

                risk_score += 80



            elif severity == "HIGH":

                risk_score += 60



            elif severity == "MEDIUM":

                risk_score += 30



            else:

                risk_score += 10



        # Limit score

        risk_score = min(
            risk_score,
            100
        )



        if risk_score >= 70:

            risk_level = "CRITICAL"


        elif risk_score >= 40:

            risk_level = "HIGH"


        elif risk_score > 0:

            risk_level = "MEDIUM"


        else:

            risk_level = "LOW"



        result = {

            "risk_score":
            risk_score,


            "risk_level":
            risk_level,


            "violations":
            violations

        }



        return result