import Redis from "ioredis";

import { env } from "@/core/env";

const globalForRedis = globalThis as { __redis?: Redis };

/** Yeni ioredis istemcisi oluştur. */
function createClient(): Redis {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });
  client.on("error", (error) => {
    console.error("Redis client error:", error);
  });
  return client;
}

/** Cache, oturum, rate-limit ve BullMQ için paylaşılan Redis istemcisi. */
export function getRedis(): Redis {
  if (!globalForRedis.__redis) {
    globalForRedis.__redis = createClient();
  }
  return globalForRedis.__redis;
}

/** Paylaşılan Redis bağlantısını kapat. */
export async function closeRedis(): Promise<void> {
  const client = globalForRedis.__redis;
  if (!client) return;
  if (client.status !== "end") {
    await client.quit();
  }
  delete globalForRedis.__redis;
}
