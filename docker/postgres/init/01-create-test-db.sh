#!/bin/bash
set -euo pipefail

# POSTGRES_DB already creates tiktak-v2; add test DB for NODE_ENV=test.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<-EOSQL
  CREATE DATABASE "tiktak-test-v2";
EOSQL
