import { object, string } from "zod";

export const loginUserSchema = object({
  email: string().min(1).max(256),
  password: string().min(1).max(256),
});
