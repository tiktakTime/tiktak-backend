import { createServer } from "node:http";

import { getRequestListener } from "@hono/node-server";
import { env } from "@tiktak/env";
import { attachSocketServer } from "@tiktak/socket";

import { createConfiguredApp } from "./app/index";

const app = createConfiguredApp();
const server = createServer(getRequestListener(app.fetch));

attachSocketServer(server);

server.listen(env.PORT, () => {
  console.log(
    `Server is running on Node at http://localhost:${env.PORT}`,
  );
});
