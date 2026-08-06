import type { Kysely, Transaction } from "kysely";

import type { DB } from "@tiktak/database";

export type { DB } from "@tiktak/database";

export type Database = Kysely<DB> | Transaction<DB>;
