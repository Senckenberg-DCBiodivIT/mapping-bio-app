# mapping.bio backend

## Requirements

- [Docker Engine](https://docs.docker.com/engine/) with the [Compose plugin](https://docs.docker.com/compose/)
- Python3 as default `python` command
- Python module libraries `venv` (if `python -m venv` does not work consider `apt-get install python-venv`)

## Setup

### Configuration`

```bash
cp variables.env.default variables.env
```

Set custom variables in `variabels.env` (passwords, etc.)

## Run mapping.bio backend

```bash
docker compose up
```

Now the following services should be running on the host machine:

| Port | Name        | Description                                                                                                                         |
| ---- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 8080 | Cordra      | The Cordra Digital Object management service under the path /api (http)                                                             |
| 9000 | Cordra DOIP | The DOIP interface from Cordra                                                                                                      |
|      | MongoDB     | The MongoDB document store. Serves as storage backend for Cordra - container port is `27017`, can be mapped Docker host if required |
|      | Solr        | The Apache Solr search index. Serves as indexing backend for Cordra container port is `8983`, can be mapped Docker host if required |

You can control this by inspecting the output of `docker ps`.

Now the Keycloak and Cordra applications need to be configured with the prepared Python scripts in the folder `/devops`.
First, set up an environment and install the required Python libraries in a new terminal.

```bash
cd devops
python -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

Then run the following commands:

```bash
cd cordra
# Configure the Cordra application
python configure_cordra_keycloak_login.py

# This has also created keycloakConfig.json which needs to be copied to the cordra-volume
docker cp keycloakConfig.json cordra:/opt/cordra-data
```

### Create type schema

```bash
# Now (when Cordra is up again) upload the schema definition for the Digital Object types (includes lifecycle hooks for interaction with the handle server)
cd devops/cordra
python upsert_cordra_types.py
```
