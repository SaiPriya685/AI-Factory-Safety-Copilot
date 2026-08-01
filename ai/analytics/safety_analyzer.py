"""
Safety Analyzer

Converts AI detections into
factory safety violations.
"""


from ai.utils.logger import Logger



class SafetyAnalyzer:


    def __init__(self):

        self.logger = Logger.get_logger(
            "SafetyAnalyzer"
        )

        self.logger.info(
            "Safety analyzer initialized."
        )



    def analyze(self, detections):


        violations = []


        for item in detections:


            name = item["name"]

            confidence = item["confidence"]



            if name == "no_helmet":

                violations.append(
                    {
                        "type": "Missing Helmet",
                        "severity": "HIGH",
                        "confidence": confidence
                    }
                )


            elif name == "no_vest":

                violations.append(
                    {
                        "type": "Missing Safety Vest",
                        "severity": "MEDIUM",
                        "confidence": confidence
                    }
                )


            elif name == "fire":

                violations.append(
                    {
                        "type": "Fire Detected",
                        "severity": "CRITICAL",
                        "confidence": confidence
                    }
                )


            elif name == "smoke":

                violations.append(
                    {
                        "type": "Smoke Detected",
                        "severity": "HIGH",
                        "confidence": confidence
                    }
                )



        # Remove duplicate violations
        violations = self.remove_duplicates(
            violations
        )


        analysis = {


            "detections": detections,


            "violations": violations

        }


        return analysis



    def remove_duplicates(self, violations):


        unique = {}


        for violation in violations:


            violation_type = violation["type"]


            if violation_type not in unique:

                unique[violation_type] = violation


            else:

                # Keep highest confidence detection

                if (
                    violation["confidence"]
                    >
                    unique[violation_type]["confidence"]
                ):

                    unique[violation_type] = violation



        return list(
            unique.values()
        )