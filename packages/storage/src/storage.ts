import { S3Client } from "@aws-sdk/client-s3";

import { env } from "@tiktak/env";

export const s3 = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID || "minioadmin",
    secretAccessKey: env.S3_SECRET_ACCESS_KEY || "minioadmin",
  },
  forcePathStyle: true,
});

export const BUCKET_NAME = env.S3_BUCKET_NAME || "assets";
