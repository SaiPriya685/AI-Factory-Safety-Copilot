from datetime import datetime


def format_ai_response(violations):
    """
    Converts AI detection results into frontend/backend friendly JSON
    """

    risk_level = "SAFE"

    if violations:

        severities = [
            violation["severity"]
            for violation in violations
        ]

        if "CRITICAL" in severities:
            risk_level = "CRITICAL"

        elif "HIGH" in severities:
            risk_level = "HIGH"

        elif "MEDIUM" in severities:
            risk_level = "MEDIUM"

        else:
            risk_level = "LOW"


    response = {

        "timestamp":
            datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            ),

        "risk_level":
            risk_level,

        "violations":
            violations,

        "total_violations":
            len(violations)

    }


    return response