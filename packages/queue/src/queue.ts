import type { ConnectionOptions } from "bullmq";
import { Queue } from "bullmq";
import IORedis from "ioredis";

import { env } from "@tiktak/env";

const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
}) as unknown as ConnectionOptions;

export const mailQueue = new Queue("mail-queue", { connection });
export const imageQueue = new Queue("image-queue", { connection });

export async function addMailJob(data: {
  to: string;
  subject: string;
  body: string;
}) {
  await mailQueue.add("send-mail", data);
}

export async function addImageJob(data: { path: string; parentId: string }) {
  await imageQueue.add("process-image", data);
}
