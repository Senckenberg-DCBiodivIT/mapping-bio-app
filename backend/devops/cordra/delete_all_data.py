import json
import requests
import os
import threading
from dotenv import dotenv_values

config = dotenv_values("../../variables.env")
CORDRA_BASE_URL = config["CORDRA_BASE_URI"]
CORDRA_USER = "admin"
CORDRA_PW = config["CORDRA_ADMIN_PASS"]


# Delete all objects in cordra
def delete_all_objects(type, batch):
    for obj_id in batch:
        url = CORDRA_BASE_URL + "/objects/" + obj_id
        delete_response = requests.delete(
            url, auth=requests.auth.HTTPBasicAuth(CORDRA_USER, CORDRA_PW)
        )


class DeleteThread(threading.Thread):
    def __init__(self, type, batch):
        threading.Thread.__init__(self)
        self.type = type
        self.batch = batch

    def run(self):
        print(
            "Starting delete thread for "
            + self.type
            + ", number of objects: "
            + str(len(self.batch))
        )
        delete_all_objects(self.type, self.batch)
        print("Exiting thread for" + self.type)


schemata = os.listdir("jsonSchema")
for schema in schemata:
    schema_name = schema.replace(".json", "")
    type_name = schema_name
    url = CORDRA_BASE_URL + '/search?query=type:"%s"&ids=true' % type_name
    search_response = requests.get(
        url, auth=requests.auth.HTTPBasicAuth(CORDRA_USER, CORDRA_PW)
    )
    results = search_response.json()["results"]
    if len(results) == 0:
        continue
    number_of_batches = 4
    if len(results) <= number_of_batches:
        batch_size = 1
    else:
        batch_size = int(len(results) / number_of_batches)
    to_process_size = len(results)
    processed_objects = 0
    while processed_objects < to_process_size:
        stop = processed_objects + batch_size
        if stop > to_process_size:
            stop = to_process_size
        # Create new threads
        delete_thread = DeleteThread(
            type_name, results[processed_objects:stop]
        )
        processed_objects += batch_size
        # Start new Threads
        delete_thread.start()
