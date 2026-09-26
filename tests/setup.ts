import { afterAll, beforeEach, onTestFailed } from "vitest";

import { closeTestConnections, dumpRowCounts, flushTestRedis } from "./db";
import { lastResponseBody } from "./request";

beforeEach(async () => {
  await flushTestRedis();
  onTestFailed(async () => {
    console.log("son yanıt:", lastResponseBody());
    await dumpRowCounts();
  });
});

afterAll(async () => {
  await closeTestConnections();
});
