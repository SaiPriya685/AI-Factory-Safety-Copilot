from app.database.database import get_database


class DashboardService:

    @staticmethod
    async def get_dashboard_data():

        db = get_database()

        total_workers = await db.workers.count_documents({})

        active_machines = await db.machines.count_documents(
            {"status": "Active"}
        )

        active_alerts = await db.alerts.count_documents(
            {"status": "Active"}
        )

        helmet_violations = await db.incidents.count_documents(
            {"incident_type": "Helmet Missing"}
        )

        vest_violations = await db.incidents.count_documents(
            {"incident_type": "Vest Missing"}
        )

        fire_alerts = await db.incidents.count_documents(
            {"incident_type": "Fire"}
        )

        total_incidents = await db.incidents.count_documents({})

        if total_workers == 0:
            safety_score = 100
        else:
            safety_score = max(
                0,
                round(
                    100 - ((total_incidents / total_workers) * 10),
                    2
                )
            )

        return {
            "total_workers": total_workers,
            "active_machines": active_machines,
            "active_alerts": active_alerts,
            "helmet_violations": helmet_violations,
            "vest_violations": vest_violations,
            "fire_alerts": fire_alerts,
            "total_incidents": total_incidents,
            "safety_score": safety_score
        }