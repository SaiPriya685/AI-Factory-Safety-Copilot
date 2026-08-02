from ai.analytics.risk_engine import RiskEngine
from ai.alerts.alert_manager import AlertManager
from ai.outputs.incident_logger import IncidentLogger



def main():

    risk_engine = RiskEngine()

    alert_manager = AlertManager()

    incident_logger = IncidentLogger()


    analysis = {


        "violations": [

            {
                "type": "Missing Helmet",

                "severity": "HIGH",

                "confidence": 0.92
            }

        ],


        "detections": [

            {
                "name": "person",

                "confidence": 0.95
            },


            {
                "name": "no_helmet",

                "confidence": 0.92
            }

        ]

    }



    risk = risk_engine.calculate(
        analysis
    )


    print("\nRisk:")
    print(risk)



    alert = alert_manager.generate_alert(
        risk
    )


    print("\nAlert:")
    print(alert)



    if risk["risk_level"] != "LOW":


        incident = incident_logger.save(

            alert,

            analysis

        )
        


        print("\nIncident:")
        print(incident)



if __name__ == "__main__":

    main()