#!/bin/sh
# Runs once on first container start (empty data volume).
# The main database comes from POSTGRES_DB; this adds the test database.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE DATABASE "tiktak-test-v2";
EOSQL
