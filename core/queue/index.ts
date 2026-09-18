import type { ConnectionOptions } from "bullmq";
import { Queue } from "bullmq";

import { getRedis } from "@/core/redis";

const connection = getRedis() as unknown as ConnectionOptions;

export const mailQueue = new Queue("mail-queue", { connection });
export const imageQueue = new Queue("image-queue", { connection });

/** Generic mail enqueue — ürün alanları `meta` (ör. userId). */
export type EnqueueMailJob = {
  key: string;
  mail: string;
  payload: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

/** Mail kuyruğuna iş ekle. */
export async function addMailJob(data: EnqueueMailJob) {
  await mailQueue.add("send-mail", data);
}

/** Görüntü işleme kuyruğuna iş ekle. */
export async function addImageJob(data: {
  path: string;
  reference_id: string;
}) {
  await imageQueue.add("process-image", data);
}

/** BullMQ kuyruk bağlantılarını kapat. */
export async function closeQueues(): Promise<void> {
  await Promise.all([mailQueue.close(), imageQueue.close()]);
}
