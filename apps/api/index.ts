import { serve } from "@hono/node-server";

import { env } from "@tiktak/env";

import { createConfiguredApp } from "./app/index.js";

const app = createConfiguredApp();

console.log(`API listening on http://localhost:${env.PORT}`);

serve({
  fetch: app.fetch,
  port: env.PORT,
});
