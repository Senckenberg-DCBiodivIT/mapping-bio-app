#!/usr/bin/env bash
CORDRADATADIR=/opt/cordra-data

if !(curl -f http://mongo:27017); then
  echo "cordra docker-startup script: Could not reach mongodb. Wait 10 seconds for mongodb to initialize"
  sleep 10
fi

# ${SOLR_URL%/*} removes the last part of the url (ie. the /cordra path to core)
if !(curl -f ${SOLR_URL%/*}); then
  echo "cordra docker-startup script: Could not reach solr. Wait 10 seconds for solr to initialize"
  sleep 10
fi

if [[ ! -z "$CORDRA_ADMIN_PASS" || ! -z "$CORDRA_BASE_URI" || ! -z "$CORDRA_PREFIX" || ! -z "$CORDRA_HDL_ADMIN" ]]; then
    echo "{ " > "$CORDRADATADIR/repoInit.json"
    if [ ! -z "$CORDRA_BASE_URI" ]; then echo "  \"baseUri\": \"${CORDRA_BASE_URI}\"," >> "$CORDRADATADIR/repoInit.json"; fi
    if [ ! -z "$CORDRA_PREFIX" ]; then echo "  \"prefix\": \"${CORDRA_PREFIX}\"," >> "$CORDRADATADIR/repoInit.json"; fi
    if [ ! -z "$CORDRA_HDL_ADMIN" ]; then echo "  \"handleAdminIdentity\": \"${CORDRA_HDL_ADMIN}\"," >> "$CORDRADATADIR/repoInit.json"; fi
    if [ ! -z "$CORDRA_ADMIN_PASS" ]; then echo "  \"adminPassword\": \"${CORDRA_ADMIN_PASS}\"," >> "$CORDRADATADIR/repoInit.json"; fi
    if [[ ! -z "$CORDRA_SITE_TITLE" && ! -z "$CORDRA_PREFIX" ]]; then echo "  \"design\": {
    \"allowInsecureAuthentication\": true,
    \"uiConfig\": {
      \"customAuthentication\": {
        \"url\": \"/api/objects/design?payload=customAuthenticationHTML\",
        \"tabName\": \"BioDT Login\",
        \"height\": 100
      },
      \"title\": \"$CORDRA_SITE_TITLE\",
      \"navBarLinks\": [
        {
          \"type\": \"url\",
          \"title\": \"API Docs\",
          \"url\": \"openapi/index.html\"
        },
        {
          \"type\": \"query\",
          \"title\": \"All Objects\",
          \"query\": \"*:*\",
          \"sortFields\": \"/name\"
        },
        {
          \"type\": \"typeDropdown\",
          \"title\": \"Show Only\",
          \"maxItems\": 15
        }
      ]
    },
    \"doip\": {
      \"enabled\": true,
      \"listenAddress\": \"0.0.0.0\",
      \"port\": 9000,
      \"processorConfig\": {
        \"serviceId\": \"$CORDRA_PREFIX/service\"
      }
    }
  }," >> "$CORDRADATADIR/repoInit.json"; fi
    sed -i "$ s/.$/\n}\n/" "$CORDRADATADIR/repoInit.json"
fi

# With the following we create an initial config.json file for Cordra but
# give the opportunity to manually edit the config_editable.json file later
# for customizations (e.g. via the docker volume)
if [ -f $CORDRADATADIR/config_editable.json ]; then
    cp $CORDRADATADIR/config_editable.json $CORDRADATADIR/config.json
else
    echo "{
      \"javascript\" : {
        \"engine\" : \"nashorn\"
      },
      \"storage\" : {
        \"module\" : \"mongodb\",
        \"options\" : {
          \"connectionUri\" : \"mongodb://$MONGODB_CORDRA_USER:$MONGODB_CORDRA_PASS@mongo:27017/$MONGODB_CORDRA_DATABASE?authSource=admin\",
          \"databaseName\": \"$MONGODB_CORDRA_DATABASE\"
        }
      },
      \"index\" : {
        \"module\" : \"solr\",
        \"options\" : {
          \"baseUri\": \"$SOLR_URL\"
        }
      },
      \"reindexing\" : {
        \"logChunkSize\": 500,
        \"logProgressToConsole\": true
      }
    }" >> "$CORDRADATADIR/config.json"
    cp $CORDRADATADIR/config.json $CORDRADATADIR/config_editable.json
fi

$CATALINA_HOME/bin/catalina.sh run
