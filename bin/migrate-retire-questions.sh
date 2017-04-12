#!/usr/bin/env bash

PG_DUMP_FILE="../galilee-db-2017-04-12T02:00.sql"
TMP_SQL_FILE="/tmp/sequence-updates-$$.sql"
DATABASE=staging
ENV=${DATABASE}
KNEX="./node_modules/.bin/knex"

echo "Drop ${DATABASE}"
dropdb --if-exists ${DATABASE}

echo "Create ${DATABASE}"
createdb ${DATABASE}
psql ${DATABASE} --quiet --file=${PG_DUMP_FILE}

echo "Update sequence numbers"
psql ${DATABASE} --quiet --tuples-only --no-align --file="./bin/generate-sequence-updates.sql" > ${TMP_SQL_FILE}
psql ${DATABASE} --quiet --file="${TMP_SQL_FILE}"
rm -f ${TMP_SQL_FILE}

echo "Migrate database"
GALILEE=${ENV} $KNEX --env ${ENV} migrate:latest
# psql ${DATABASE} -c 'SELECT * FROM knex_migrations'
