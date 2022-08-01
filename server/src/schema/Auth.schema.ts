import { object, string, TypeOf } from "zod";

export const loginUserSchema = object({
  body: object({
    email: string({
      required_error: "Email is required",
    }),
    password: string({
      required_error: "Password is required",
    }),
  }),
});

export const createUserSchema = object({
  body: object({
    firstName: string().min(1, {
      message: "First name is required",
    }),
    lastName: string().min(1, {
      message: "Last name is required",
    }),
    password: string().min(6, "Password too short - should be 6 chars minimum"),
    email: string({
      required_error: "Email is required",
    })
      .email("Not a valid email")
      .min(5, {
        message: "Email is required",
      }),
    username: string().min(1, {
      message: "Username is required",
    }),
  }),
});

export type CreateUserInput = Omit<
  TypeOf<typeof createUserSchema>,
  "body.passwordConfirmation"
>;

export type LoginUserInput = Omit<
  TypeOf<typeof createUserSchema>,
  "body.passwordConfirmation"
>;
