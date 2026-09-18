import { z } from "@hono/zod-openapi";

import { TTL } from "@/core/cache";
import { Page, Result, createSlice, defineRoute } from "@/core/http";

import {
  createUser,
  getUser,
  searchUsers,
  softDeleteUser,
  updateUser,
} from "./domain";
import {
  UserCreateSchema,
  UserIdParamSchema,
  UserSchema,
  UserSearchQuerySchema,
  UserUpdateSchema,
} from "./user.schema";

const TAG = "user";
const BASE = "/user";

const UserIdResultSchema = z.object({ id: z.uuid() }).openapi("UserId");

const search = defineRoute({
  name: "user.search",
  method: "get",
  path: `${BASE}/search`,
  tag: TAG,
  summary: "Search users",
  request: { query: UserSearchQuerySchema },
  response: Page(UserSchema, "Matching users"),
  policy: ["user.get"],
  tenant: "member",
  cache: { read: { ttl: TTL.DEFAULT, tags: ["user"] } },
  handle: ({ query }) => searchUsers(query),
});

const create = defineRoute({
  name: "user.create",
  method: "post",
  path: BASE,
  tag: TAG,
  summary: "Create user",
  request: { body: UserCreateSchema },
  response: Result(UserSchema, "Created"),
  tenant: "member",
  cache: { write: { purge: ["user"] } },
  handle: ({ body }) => createUser(body),
});

const get = defineRoute({
  name: "user.get",
  method: "get",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Get a user by id",
  request: { params: UserIdParamSchema },
  response: Result(UserSchema, "The user"),
  policy: ["user.get"],
  tenant: "member",
  cache: { read: { ttl: TTL.LONG, tags: ["user"] } },
  handle: ({ params }) => getUser(params.id),
});

const update = defineRoute({
  name: "user.update",
  method: "patch",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Update user",
  request: {
    params: UserIdParamSchema,
    body: UserUpdateSchema,
  },
  response: Result(UserSchema, "Updated"),
  tenant: "member",
  cache: { write: { purge: ["user"] } },
  handle: ({ params, body, actorId }) => updateUser(actorId, params.id, body),
});

const remove = defineRoute({
  name: "user.delete",
  method: "delete",
  path: `${BASE}/{id}`,
  tag: TAG,
  summary: "Soft-delete user",
  request: { params: UserIdParamSchema },
  response: Result(UserIdResultSchema, "Deleted"),
  tenant: "member",
  cache: { write: { purge: ["user"] } },
  handle: ({ params }) => softDeleteUser(params.id),
});

export const userRouter = createSlice([search, create, get, update, remove]);
