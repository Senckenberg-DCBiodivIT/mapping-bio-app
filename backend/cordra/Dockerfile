FROM tomcat:9.0.65-jre11-openjdk-bullseye

ARG CORDRA_VERSION=2.5.0

COPY docker-startup.sh /opt/docker-startup.sh
RUN apt-get update && apt-get install -y zip && \
  wget https://www.cordra.org/assets/sw/cordra-$CORDRA_VERSION-distribution.zip -O /tmp/cordra.zip && \
  unzip /tmp/cordra.zip -d /tmp && \
  unzip /tmp/cordra-$CORDRA_VERSION/sw/webapps-priority/cordra.war -d /usr/local/tomcat/webapps/api && \
  rm -r /tmp/cordra.zip /tmp/cordra-$CORDRA_VERSION && \
  adduser --disabled-password --gecos "" tomcatuser && \
  mkdir /opt/cordra-data && \
  touch /usr/local/tomcat/bin/setenv.sh && \
  chown -R  tomcatuser:tomcatuser /usr/local/tomcat/bin/setenv.sh /opt/cordra-data && \
  chmod +x /opt/docker-startup.sh


# Run the docker container as non-root for security reasons
USER tomcatuser

WORKDIR /opt/cordra-data

RUN echo CATALINA_OPTS=\"-Dcordra.data=/opt/cordra-data \${CATALINA_OPTS}\" > /usr/local/tomcat/bin/setenv.sh

EXPOSE 8080
EXPOSE 9000

ENTRYPOINT ["/opt/docker-startup.sh"]
