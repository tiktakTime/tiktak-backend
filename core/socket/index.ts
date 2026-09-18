import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";

import { setSocketEmitter } from "@/core/cache";
import { extractBearerToken } from "@/core/http/bearer";

let io: Server | null = null;

type InvalidateDebugLog = (rooms: string[], queryKeys: unknown[][]) => void;

let invalidateDebugLog: InvalidateDebugLog | null = null;

/** Dev: invalidate emit’lerini dışarıdan (ör. index) loglamak için. */
export function setInvalidateDebugLog(fn: InvalidateDebugLog | null) {
  invalidateDebugLog = fn;
}

export type SocketIdentity = {
  id: string;
  session?: string;
};

export type SocketRoomBinding = {
  join: string;
  leave: string;
  prefix: string;
  /** Odaya katılım yetkisi. Verilmezse katılım serbesttir. */
  canJoin?: (
    identity: SocketIdentity,
    id: string,
  ) => Promise<boolean> | boolean;
};

export type AttachSocketOptions = {
  authenticate: (token: string) => Promise<SocketIdentity | null>;
  /** Bağlanınca otomatik oda — örn. `user:${id}`. */
  room?: (identity: SocketIdentity) => string | undefined;
  /** Dinamik join/leave event’leri. */
  rooms?: SocketRoomBinding[];
};

/**
 * Socket.IO’yu Node HTTP sunucusuna bağla.
 * Kimlik ve oda adları çağıran tarafından verilir (platform wiring).
 */
export function attachSocketServer(
  httpServer: HttpServer,
  options: AttachSocketOptions,
): Server {
  if (io) return io;

  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  setSocketEmitter((rooms, queryKeys) => {
    if (!io || queryKeys.length === 0) return;
    invalidateDebugLog?.(rooms, queryKeys);
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
      const fromAuth = socket.handshake.auth.token;
      const fromHeader = extractBearerToken(
        typeof socket.handshake.headers.authorization === "string"
          ? socket.handshake.headers.authorization
          : undefined,
      );
      const fromQuery = socket.handshake.query.token;
      const token =
        (typeof fromAuth === "string" ? fromAuth : undefined) ??
        fromHeader ??
        (typeof fromQuery === "string" ? fromQuery : undefined);

      if (!token) return next(new Error("Authentication required"));

      const identity = await options.authenticate(token);
      if (!identity) return next(new Error("Invalid token"));

      socket.data.identity = identity;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const identity = socket.data.identity as SocketIdentity | undefined;
    if (identity && options.room) {
      const auto = options.room(identity);
      if (auto) socket.join(auto);
    }

    for (const binding of options.rooms ?? []) {
      socket.on(binding.join, (id: string) => {
        if (typeof id !== "string" || id.length === 0) return;
        void (async () => {
          if (binding.canJoin) {
            // Yetki kontrolü varsa kimlik zorunlu — hata / kimliksiz durumda reddet.
            if (!identity) return;
            try {
              if (!(await binding.canJoin(identity, id))) return;
            } catch {
              return;
            }
          }
          socket.join(`${binding.prefix}:${id}`);
        })();
      });
      socket.on(binding.leave, (id: string) => {
        if (typeof id === "string" && id.length > 0) {
          socket.leave(`${binding.prefix}:${id}`);
        }
      });
    }
  });

  return io;
}

/** Başlatılmış Socket.IO sunucusunu döndür. */
export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

/** Socket.IO sunucusunu kapat. */
export async function closeSocket(): Promise<void> {
  if (!io) return;
  const server = io;
  io = null;
  invalidateDebugLog = null;
  try {
    server.disconnectSockets(true);
  } catch {
    // ignore
  }
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
    setTimeout(resolve, 500).unref?.();
  });
}
