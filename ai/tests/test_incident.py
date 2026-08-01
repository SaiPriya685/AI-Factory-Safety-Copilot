from ai.outputs.incident_logger import IncidentLogger


logger = IncidentLogger()


alert = {
    "risk_level": "HIGH",
    "risk_score": 60,
    "message": "Missing Helmet detected"
}


analysis = {

    "violations":[
        {
            "type":"Missing Helmet",
            "severity":"HIGH",
            "confidence":0.92
        }
    ],

    "detections":[
        {
            "name":"person",
            "confidence":0.92
        }
    ]

}


result = logger.save(
    alert,
    analysis
)


print(result)