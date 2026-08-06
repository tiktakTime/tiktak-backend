import { defineConfig } from "prisma/config";

import { env } from "@tiktak/env";

export default defineConfig({
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env.DIRECT_URL,
  },
});
