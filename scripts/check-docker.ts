import { execSync } from "node:child_process";

if (
  process.env.NODE_ENV === "production" ||
  process.env.CI ||
  process.env.VERCEL ||
  process.env.SKIP_DOCKER_CHECK
) {
  console.log(
    "⏭️ Docker check skipped (SKIP_DOCKER_CHECK / production / CI).",
  );
  process.exit(0);
}

console.log("🔍 Checking Docker status...");

try {
  execSync("docker info", { stdio: "ignore" });
} catch {
  console.error("\n❌ Error: Docker daemon is not running!");
  console.error(
    "💡 Please start OrbStack or Docker Desktop on your Mac first, then try again.\n",
  );
  process.exit(1);
}

try {
  console.log("🐳 Starting local infrastructure (Postgres, Redis, MinIO)...");
  execSync("docker compose up -d", { stdio: "inherit" });
  console.log("✅ Local infrastructure is running!\n");
} catch (error) {
  console.error("\n❌ Error: Failed to start docker compose services!");
  console.error(error);
  process.exit(1);
}
