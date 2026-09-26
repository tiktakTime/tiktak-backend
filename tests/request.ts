import { env } from "@/core/env";

type RequestApp = {
  request: (input: string, init?: RequestInit) => Response | Promise<Response>;
};

export type RequestOptions = {
  method?: string;
  token?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

let lastBody: unknown;

function parseBody(text: string): unknown {
  if (text.length === 0) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function lastResponseBody(): unknown {
  return lastBody;
}

/** `app.request` + JSON gövde. Path `API_BASE_PATH` ile birleşir. */
export async function request(
  app: RequestApp,
  path: string,
  options: RequestOptions = {},
) {
  const headers = new Headers(options.headers);
  if (options.token) headers.set("authorization", `Bearer ${options.token}`);
  if (options.body !== undefined)
    headers.set("content-type", "application/json");

  const url = path.startsWith("/")
    ? `${env.API_BASE_PATH}${path}`
    : `${env.API_BASE_PATH}/${path}`;

  const response = await Promise.resolve(
    app.request(url, {
      method: options.method ?? (options.body === undefined ? "GET" : "POST"),
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    }),
  );

  const body = parseBody(await response.text());
  lastBody = body;

  return { status: response.status, body, headers: response.headers };
}
