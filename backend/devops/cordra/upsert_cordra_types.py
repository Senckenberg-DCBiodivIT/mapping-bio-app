import json
import requests
import os
from dotenv import dotenv_values

config = dotenv_values("../../variables.env")
CORDRA_BASE_URL = config["CORDRA_BASE_URI"]
CORDRA_USER = "admin"
CORDRA_PW = config["CORDRA_ADMIN_PASS"]

SSSOM_VERSION = "0.15.0"

def delete_schema(type_name):
    print("Will delete schema: " + type_name)
    res_delete = requests.delete(
        CORDRA_BASE_URL + "/schemas/" + type_name,
        headers={"Content-Type": "application/json"},
        auth=requests.auth.HTTPBasicAuth(CORDRA_USER, CORDRA_PW),
    )
    print(res_delete.status_code)

def create_schema(schema: dict):
    res_create = requests.post(
        CORDRA_BASE_URL + "/objects?type=Schema",
        headers={"Content-Type": "application/json"},
        auth=requests.auth.HTTPBasicAuth(CORDRA_USER, CORDRA_PW),
        data=json.dumps(schema),
    )

    if res_create.status_code != 200:
        print("Failed to upload new schema " + schema["name"])
        import pdb

        pdb.set_trace()
    print("Uploaded: " + schema["name"])


# ---- SSSOM schema
type_name = "SSSOMSchema"
response = requests.get(CORDRA_BASE_URL + "/schemas/" + type_name)
if response.status_code == 404:
    print("Will import SSSOM JSON Schema from Github")
    url = f"https://raw.githubusercontent.com/mapping-commons/sssom/{SSSOM_VERSION}/project/jsonschema/sssom_schema.schema.json"
    response = requests.get(url)
    sssom_schema = response.json()
    schema = {
        "name": type_name,
        "schema": sssom_schema,
        "description": f"SSSOM {SSSOM_VERSION} JSON Schema imported from {url} The schema itself is under CC0 https://creativecommons.org/publicdomain/zero/1.0/ license."
    }
    create_schema(schema)
else:
    sssom_schema = response.json()


# ---- MappingSet
type_name = "MappingSet"
delete_schema(type_name)
mapping_set_schema = {
    "additionalProperties": False,
    "description": "Represents a set of mappings",
    "required": ["mapping_set_id","license"],
    "properties": {
        "@context": {
            "type": "string",
            "default": f"https://raw.githubusercontent.com/mapping-commons/sssom/{SSSOM_VERSION}/src/sssom_schema/context/sssom_schema.context.jsonld"
        },
        "@id": {
            "type": "string"
        },
        "@type": {
            "type": "string",
            "default": "MappingSet"
        }
    },
    "title": "MappingSet",
    "type": "object"
}

for prop_name in sssom_schema["$defs"]["MappingSet"]["properties"]:
    mapping_set_schema["properties"][prop_name] = {"$ref": "SSSOMSchema#/$defs/MappingSet/properties/" + prop_name}

schema = {
    "name": type_name,
    "schema": mapping_set_schema,
    "description": "A schema to represent instances of sssom:MappingSet."
}
schema["authConfig"] = {
    "defaultAclRead": ["public"],
    "defaultAclWrite": ["creator"],
    "aclCreate": [
        "authenticated"
    ],
  "aclMethods": {
    "instance": {
      "getAsROCrate": [
        "readers"
      ]
    }
  }
}
with open(os.path.join("javascript", "lifecycle.js")) as file:
    js = file.read()
schema["javascript"] = js
create_schema(schema)
