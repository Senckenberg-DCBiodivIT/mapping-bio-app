FROM solr:8

EXPOSE 8983

ENV SOLR_CONFIG_DIR="/opt/solr/server/solr/configsets"
ENV SOLR_SCHEMA_FILE="$SOLR_CONFIG_DIR/cordra/conf/managed-schema"
ENV SOLR_CONFIG_FILE="$SOLR_CONFIG_DIR/cordra/conf/solrconfig.xml"

USER root

# Create a CKAN configset by copying the default one
RUN cp -R $SOLR_CONFIG_DIR/_default $SOLR_CONFIG_DIR/cordra

# Update the schema
ADD cordra-managed-schema $SOLR_SCHEMA_FILE
ADD solrconfig.xml $SOLR_CONFIG_FILE
RUN chmod 644 $SOLR_SCHEMA_FILE && chmod 644 $SOLR_CONFIG_FILE

USER solr

CMD ["sh", "-c", "solr-precreate cordra $SOLR_CONFIG_DIR/cordra"]
