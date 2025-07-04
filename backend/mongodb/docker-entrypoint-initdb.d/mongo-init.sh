# This script will only be executed upon docker-compose up if the mongo directory
# /data/db is empty -> So for a fresh reinstall the docker volume must be removed

# This will create the users on the 'admin' database so --authenticationDatabase,
# respectively authSource must always be defined as 'admin' when connecting

set -e

mongo <<EOF
use admin

db.createUser({
  user: '$MONGODB_CORDRA_USER',
  pwd:  '$MONGODB_CORDRA_PASS',
  roles: [{
    role: 'readWrite',
    db: '$MONGODB_CORDRA_DATABASE'
  }]
});

EOF
