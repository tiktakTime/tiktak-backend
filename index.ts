import { serve } from "@hono/node-server";
import type { Server as HttpServer } from "node:http";

import { app_config } from "@/app.config";
import { env } from "@/core/env";
import { closeQueues } from "@/core/queue";
import { closeRedis } from "@/core/redis";
import {
  attachSocketServer,
  closeSocket,
  getIO,
  setInvalidateDebugLog,
} from "@/core/socket";
import { closeDb } from "@/modules/db";
import { verifyAccessToken } from "@/platform/auth";
import { socketRoomBindings, userRoom } from "@/platform/scope";

import { buildServer } from "./server";

const httpServer = serve(
  { fetch: buildServer().fetch, port: env.PORT },
  ({ port }) => {
    console.log(`listening on http://localhost:${port}${env.API_BASE_PATH}`);
    if (env.NODE_ENV !== "production") {
      console.log(
        `docs      http://localhost:${port}${env.API_BASE_PATH}${app_config.openapi.docs_path}`,
      );
    }
    console.log(`socket    http://localhost:${port}/socket.io`);
  },
) as HttpServer;

attachSocketServer(httpServer, {
  authenticate: async (token) => {
    const claims = await verifyAccessToken(token);
    return { id: claims.sub, session: claims.sid };
  },
  room: (identity) => userRoom(identity.id),
  rooms: socketRoomBindings,
});

if (env.NODE_ENV !== "production") {
  setInvalidateDebugLog((rooms, queryKeys) => {
    console.log("[socket] invalidate", {
      rooms: rooms.length > 0 ? rooms : ["*"],
      keys: queryKeys,
    });
  });

  getIO().on("connection", (socket) => {
    console.log("[socket] connect", {
      id: socket.id,
      user_id: socket.data.identity?.id,
    });

    socket.onAny((event, ...args) => {
      console.log("[socket] ←", event, ...args);
    });

    socket.on("disconnect", (reason) => {
      console.log("[socket] disconnect", { id: socket.id, reason });
    });
  });
}

let shuttingDown = false;

/**
 * Socket.IO açık tutulan bağlantılar `httpServer.close()` callback’ini
 * geciktirebilir; tsx watch bu yüzden "Force killing" döngüsüne girer.
 * Önce socket’i kes, HTTP’yi kapat, en fazla 3s sonra zorla çık.
 */
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[shutdown] ${signal}`);

  const forceTimer = setTimeout(() => {
    console.error("[shutdown] timeout — forced exit");
    process.exit(1);
  }, 3_000);
  forceTimer.unref?.();

  try {
    await closeSocket();
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
      if (typeof httpServer.closeAllConnections === "function") {
        httpServer.closeAllConnections();
      }
    });
    await closeQueues();
    await closeRedis();
    await closeDb();
  } catch (err) {
    console.error("[shutdown] error", err);
  } finally {
    clearTimeout(forceTimer);
    process.exit(0);
  }
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void shutdown(signal);
  });
}
