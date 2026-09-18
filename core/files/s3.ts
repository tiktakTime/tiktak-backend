import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { env } from "@/core/env";

let client: S3Client | null = null;

/** MinIO / S3 uyumlu istemci (lazy). */
export function getS3(): S3Client {
  if (client) return client;

  if (!env.S3_ENDPOINT) {
    throw new Error("S3_ENDPOINT is not configured");
  }

  client = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: "auto",
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID || "minioadmin",
      secretAccessKey: env.S3_SECRET_ACCESS_KEY || "minioadmin",
    },
    forcePathStyle: true,
  });

  return client;
}

export function getBucketName(): string {
  return env.S3_BUCKET_NAME || "assets";
}

/** Public URL tabanı (`S3_URL`), trailing slash yok. */
export function getPublicBaseUrl(): string {
  const base = (env.S3_URL || "").replace(/\/+$/, "");
  if (base) return base;

  const endpoint = (env.S3_ENDPOINT || "").replace(/\/+$/, "");
  const bucket = getBucketName();
  return endpoint ? `${endpoint}/${bucket}` : "";
}

export function buildFileUrl(key: string): string {
  const base = getPublicBaseUrl();
  const normalized = key.replace(/^\/+/, "");
  return base ? `${base}/${normalized}` : normalized;
}

export async function putObject(input: {
  key: string;
  body: Buffer | Uint8Array;
  contentType?: string;
}): Promise<{ key: string; url: string }> {
  const key = input.key.replace(/^\/+/, "");

  await getS3().send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: input.body,
      ContentType: input.contentType,
    }),
  );

  return { key, url: buildFileUrl(key) };
}

export async function deleteObject(key: string): Promise<void> {
  const normalized = key.replace(/^\/+/, "");

  await getS3().send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: normalized,
    }),
  );
}
