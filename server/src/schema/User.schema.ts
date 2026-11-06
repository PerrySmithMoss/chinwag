import { email, object, string } from "zod";

export const createUserSchema = object({
  firstName: string().min(1).max(100),
  lastName: string().min(1).max(100),
  username: string().min(1).max(100),
  email: email().max(256),
  password: string().min(6).max(256),
});

export const updateProfileSchema = createUserSchema
  .pick({ firstName: true, lastName: true, username: true })
  .partial()
  .strict();
