from ai.alerts.alert_manager import AlertManager



manager = AlertManager()



risk = {

    "risk_score":90,

    "risk_level":"CRITICAL"

}



alert = manager.generate_alert(
    risk
)


print(alert)