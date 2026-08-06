import z from "zod";

import { UserSchema } from "@tiktak/database";

export const CreateUserSchema = UserSchema.pick({
  id: true,
  email: true,
  name: true,
  avatar: true,
  isVerified: true,
});

export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = UserSchema.pick({
  name: true,
  avatar: true,
}).partial();

export type UpdateUser = z.infer<typeof UpdateUserSchema>;
