from ai.outputs.incident_logger import IncidentLogger



logger = IncidentLogger()



alert = {

    "risk_level":"HIGH",

    "risk_score":60,

    "message":
    "High risk detected"

}



detections = [

    {
        "name":"person",
        "confidence":0.91
    }

]



incident = logger.save(
    alert,
    detections
)


print(incident)