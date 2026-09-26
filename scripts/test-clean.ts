process.env.NODE_ENV = "test";

const redisUrl = new URL(process.env.REDIS_URL || "redis://localhost:6379");
redisUrl.pathname = "/15";
process.env.REDIS_URL = redisUrl.toString();

const { assertTestDatabase, closeTestConnections, resetDb } =
  await import("../tests/db");

assertTestDatabase();
await resetDb();
await closeTestConnections();
console.log("tiktak-test-v2 tabloları ve Redis db 15 temizlendi.");
