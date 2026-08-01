"""
incident_logger.py

Stores factory safety incidents.
"""

import json
import os
from datetime import datetime

from ai.utils.logger import Logger


class IncidentLogger:


    def __init__(self):

        self.logger = Logger.get_logger(
            "IncidentLogger"
        )


        self.folder = (
            "ai/outputs/incidents"
        )


        self.file = (
            f"{self.folder}/incidents.json"
        )


        # duplicate prevention window
        self.cooldown_seconds = 60


        os.makedirs(
            self.folder,
            exist_ok=True
        )


        if not os.path.exists(self.file):

            with open(self.file,"w") as f:
                json.dump([],f,indent=4)


        self.logger.info(
            "Incident logger initialized."
        )



    def is_duplicate(self, incident):


        with open(self.file,"r") as f:
            incidents=json.load(f)



        if len(incidents)==0:
            return False



        last_incident = incidents[-1]


        last_time=datetime.strptime(
            last_incident["timestamp"],
            "%Y-%m-%d %H:%M:%S"
        )


        current_time=datetime.strptime(
            incident["timestamp"],
            "%Y-%m-%d %H:%M:%S"
        )



        difference = (
            current_time-last_time
        ).total_seconds()



        old_types=set(
            v["type"]
            for v in last_incident["violations"]
        )


        new_types=set(
            v["type"]
            for v in incident["violations"]
        )



        if (
            old_types == new_types
            and difference < self.cooldown_seconds
        ):

            return True



        return False





    def save(
        self,
        alert,
        analysis
    ):


        incident={


            "timestamp":
            datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            ),



            "alert":
            alert,



            "violations":
            analysis.get(
                "violations",
                []
            ),



            "detections":
            analysis.get(
                "detections",
                []
            )

        }



        if self.is_duplicate(incident):

            self.logger.info(
                "Duplicate incident ignored."
            )

            return None



        with open(self.file,"r") as f:

            incidents=json.load(f)



        incidents.append(
            incident
        )



        with open(self.file,"w") as f:

            json.dump(
                incidents,
                f,
                indent=4
            )



        self.logger.warning(
            "Safety incident saved."
        )


        return incident