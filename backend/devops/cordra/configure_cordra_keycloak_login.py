from dotenv import dotenv_values
import requests
import json

config = dotenv_values("../../variables.env")
CORDRA_BASE_URL = config["CORDRA_BASE_URI"]
CORDRA_USER = "admin"
CORDRA_PW = config["CORDRA_ADMIN_PASS"]
KEYCLOAK_BASE_URL = config["KEYCLOAK_BASE_URL"]

# in order to allow custom login to the configured externeal authentication
# provider via Cordra's UI we add a payload to the Design object which
# contains the required HTML and JavaScript code
with open(
    "javascript/customAuthenticationFrame.html", encoding="utf-8"
) as file:
    customAuthScript = file.read()
    customAuthScript = customAuthScript.replace(
        "{__REPLACE_KEYCLOAK_BASE_URL__}", KEYCLOAK_BASE_URL
    )
    customAuthScript = customAuthScript.replace(
        "{__REPLACE_KEYCLOAK_REALM__}", config["KEYCLOAK_REALM"]
    )
    customAuthScript = customAuthScript.replace(
        "{__REPLACE_KEYCLOAK_CLIENT_ID__}", config["KEYCLOAK_CLIENT"]
    )

design_object = requests.get(
    CORDRA_BASE_URL + "/objects/design",
    auth=requests.auth.HTTPBasicAuth(CORDRA_USER, CORDRA_PW),
).json()

with open("javascript/DesignJavascript.js", encoding="utf-8") as file:
    javascript = file.read()

design_object["javascript"] = javascript
# Update the Design object with the javascript property in the JSON content
# and with the new payload
response = requests.put(
    CORDRA_BASE_URL + "/objects/design",
    auth=requests.auth.HTTPBasicAuth(CORDRA_USER, CORDRA_PW),
    files=[
        (
            "content",
            (
                None,
                bytes(json.dumps(design_object), "utf-8"),
                "application/json",
            ),
        ),
        (
            "customAuthenticationHTML",
            (
                "customAuthenticationFrame.html",
                bytes(customAuthScript, "utf-8"),
                "text/html",
            ),
        ),
    ],
    timeout=10,
)
if response.status_code != 200:
    raise Exception(f"Error updating the Design javascript: {response.text}")

print("Successfully uploaded design javascript to cordra")

print("Trying to access keycloak under URL: " + KEYCLOAK_BASE_URL)

token_response = requests.post(
    KEYCLOAK_BASE_URL + "/realms/master/protocol/openid-connect/token",
    headers={"content-type": "application/x-www-form-urlencoded"},
    data={
        "grant_type": "password",
        "client_id": "admin-cli",
        "username": config["KEYCLOAK_ADMIN"],
        "password": config["KEYCLOAK_ADMIN_PASSWORD"],
    },
    timeout=10,
)
token = token_response.json()["access_token"]

realm_create_response = requests.post(
    KEYCLOAK_BASE_URL + "/admin/realms",
    headers={
        "content-type": "application/json",
        "authorization": "bearer " + token,
    },
    data=json.dumps({"realm": config["KEYCLOAK_REALM"], "enabled": True}),
    timeout=10,
)
if realm_create_response.status_code == 409:
    print("Realm exists already, continuing")
elif realm_create_response.status_code != 201:
    raise Exception(
        "Error on trying to create the keycloak realm - "
        + realm_create_response.text
    )

client_create_response = requests.post(
    KEYCLOAK_BASE_URL
    + "/admin/realms/"
    + config["KEYCLOAK_REALM"]
    + "/clients",
    headers={
        "content-type": "application/json",
        "authorization": "bearer " + token,
    },
    data=json.dumps(
        {
            "clientId": config["KEYCLOAK_CLIENT"],
            "rootUrl": CORDRA_BASE_URL,
            "adminUrl": CORDRA_BASE_URL,
            "baseUrl": CORDRA_BASE_URL,
            "redirectUris": [CORDRA_BASE_URL + "/*"],
            "publicClient": True,
            "directAccessGrantsEnabled": True,
            "attributes": {
                "post.logout.redirect.uris": CORDRA_BASE_URL + "/*"
            },
        }
    ),
    timeout=10,
)
if realm_create_response.status_code == 409:
    print("Client exists already, continuing")
elif client_create_response.status_code != 201:
    raise Exception(
        "Error on trying to create the keycloak client - "
        + client_create_response.text
    )

# setup the ORCID identity provider
if config["KEYCLOAK_ORCID_CLIENT_ID"]:
    id_provider_create_response = requests.post(
        KEYCLOAK_BASE_URL
        + "/admin/realms/"
        + config["KEYCLOAK_REALM"]
        + "/identity-provider/instances",
        headers={
            "content-type": "application/json",
            "authorization": "bearer " + token,
        },
        data=json.dumps(
            {
                "alias": "orcid",
                "displayName": "ORCID",
                "providerId": "oidc",
                "config": {
                    "authorizationUrl": "https://orcid.org/oauth/authorize",
                    "clientAuthMethod": "client_secret_post",
                    "clientId": config["KEYCLOAK_ORCID_CLIENT_ID"],
                    "clientSecret": config["KEYCLOAK_ORCID_CLIENT_SECRET"],
                    "guiOrder": "",
                    "issuer": "https://orcid.org",
                    "jwksUrl": "https://orcid.org/oauth/jwks",
                    "logoutUrl": "",
                    "pkceEnabled": "false",
                    "tokenUrl": "https://orcid.org/oauth/token",
                    "useJwksUrl": "true",
                    "userInfoUrl": "https://orcid.org/oauth/userinfo",
                    "validateSignature": "true",
                },
            }
        ),
        timeout=10,
    )
    if realm_create_response.status_code == 409:
        print("Keycloak identity provider exists already")
    elif id_provider_create_response.status_code != 201:
        raise Exception(
            "Error on trying to create the keycloak identity provider - "
            + client_create_response.text
        )
else:
    print(
        "Did not add ORCID identity provider due to missing KEYCLOAK_ORCID_CLIENT_ID in variabels.env"
    )


# build the keycloakConfig.json for cordra
get_jwk_response = requests.get(
    KEYCLOAK_BASE_URL
    + "/realms/"
    + config["KEYCLOAK_REALM"]
    + "/protocol/openid-connect/certs",
    timeout=10
)

if get_jwk_response.status_code != 200:
    raise Exception(
        "Error on trying to retrieve the jwk cert - " + get_jwk_response.text
    )

available_keys = get_jwk_response.json()["keys"]
for key in available_keys:
    if key["use"] == "sig":
        keycloakConfig = {
            "iss": KEYCLOAK_BASE_URL + "/realms/" + config["KEYCLOAK_REALM"],
            "aud": ["account"],
            "jwk": key,
        }
        with open("keycloakConfig.json", "wt", encoding="utf-8") as file:
            file.write(json.dumps(keycloakConfig))

print("Successfully initialized keycloak configuration")
print("Copy to Cordra's data directory e.g. via docker cp keycloakConfig.json cordra:/opt/cordra-data")