import { createConfiguredApp } from "../src/app/index";

async function main() {
  const app = createConfiguredApp();

  const doc = app.getOpenAPIDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Tiktak Backend API",
    },
  });

  process.stdout.write(JSON.stringify(doc, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
