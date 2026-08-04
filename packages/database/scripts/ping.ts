import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(import.meta.dirname, "../../../.env") });

const { checkDatabaseConnection, closeDatabase } = await import("../client/index.js");

try {
  const result = await checkDatabaseConnection();
  console.log("Database connection OK:", result);
} catch (error) {
  console.error("Database connection failed:", error);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
