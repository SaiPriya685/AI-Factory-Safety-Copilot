from ai.analytics.risk_engine import RiskEngine


engine = RiskEngine()


detections = [

    {
        "name":"person",
        "confidence":0.92
    }

]


result = engine.calculate(
    detections
)


print(result)