import type { Server as HttpServer } from "node:http";

import { Server, Socket } from "socket.io";

import { type AuthIdentity, verifyFirebaseToken } from "@tiktak/auth";
import { setSocketEmitter } from "@tiktak/cache";

let io: Server | null = null;

interface AuthenticatedSocket extends Socket {
  user?: AuthIdentity;
}

export function attachSocketServer(httpServer: HttpServer) {
  if (io) {
    return { io };
  }

  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  setSocketEmitter((rooms, queryKeys) => {
    if (!io || queryKeys.length === 0) return;
    if (rooms.length > 0) {
      for (const room of rooms) {
        io.to(room).emit("invalidate", queryKeys);
      }
    } else {
      io.emit("invalidate", queryKeys);
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = (socket.handshake.auth.token ||
        socket.handshake.query.token) as string | undefined;
      if (!token) return next(new Error("Authentication required"));
      const firebaseUser = await verifyFirebaseToken(token);
      (socket as AuthenticatedSocket).user = firebaseUser;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as AuthenticatedSocket).user;
    if (user?.id) socket.join(`user:${user.id}`);

    socket.on("join:organization", (orgId: string) => {
      socket.join(`org:${orgId}`);
    });

    socket.on("leave:organization", (orgId: string) => {
      socket.leave(`org:${orgId}`);
    });
  });

  return { io };
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
