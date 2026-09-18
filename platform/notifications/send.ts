import { env } from "@/core/env";
import { addMailJob } from "@/core/queue";

import type { MailJob } from "./mail-job";

/**
 * Mail gönderimini kuyruğa alır (BullMQ).
 * Dev’de ayrıca konsola yazar — worker yokken debug için.
 */
export async function sendEmail(input: MailJob | MailJob[]): Promise<void> {
  const jobs = Array.isArray(input) ? input : [input];

  for (const job of jobs) {
    await addMailJob({
      key: job.key,
      mail: job.mail,
      payload: job.payload,
      meta: job.userId !== undefined ? { userId: job.userId } : undefined,
    });

    if (env.NODE_ENV !== "production") {
      console.info("[mail]", job.key, "→", job.mail, job.payload);
    }
  }
}
