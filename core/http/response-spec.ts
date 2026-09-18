/**
 * OpenAPI yanıt spec'leri — `Result` / `Page` / `Failure`.
 * Zarf şemaları `./result`; burası yalnızca route tanımına giren sarmalayıcı.
 */
import { z } from "@hono/zod-openapi";

import {
  ErrorEnvelopeSchema,
  pageSchema,
  refNameOf,
  resultSchema,
} from "./result";

/**
 * Zod şeması yer tutucusu.
 * `any` gerekli: zod-openapi'nin `ZodObject` / `ZodPipe` generic'leri invariant
 * davranıyor, daraltınca slice şemaları atanamaz hale geliyor.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ZodLike = z.ZodObject<any> | z.ZodPipe<any, any> | z.ZodTypeAny;

export type ResponseSpec = {
  mode: "result" | "page";
  openapi: {
    description: string;
    content: { "application/json": { schema: z.ZodType } };
  };
};

/**
 * İşlem zarfı — `Result<T>` ≈ `{ status, code, title, message, data: T }`.
 * HTTP 200. Platform `handle` sonucunu `renderSuccess` ile sarar.
 */
export function Result<T extends z.ZodType>(
  schema: T,
  description = "OK",
): ResponseSpec {
  const ref = refNameOf(schema);
  return {
    mode: "result",
    openapi: {
      description,
      content: {
        "application/json": {
          schema: resultSchema(schema, ref && `${ref}Result`),
        },
      },
    },
  };
}

/**
 * Sayfalı liste zarfı — `Page<T>` ≈ `{ data: T[], empty, pagination }`.
 * HTTP 200. `handle` zaten Page şekli döner; ekstra sarma yok.
 */
export function Page<T extends z.ZodType>(
  item: T,
  description = "OK",
): ResponseSpec {
  const ref = refNameOf(item);
  return {
    mode: "page",
    openapi: {
      description,
      content: {
        "application/json": { schema: pageSchema(item, ref && `${ref}Page`) },
      },
    },
  };
}

/** OpenAPI hata yanıtı — standart zarf. */
export function Failure(description: string) {
  return {
    description,
    content: { "application/json": { schema: ErrorEnvelopeSchema } },
  };
}
