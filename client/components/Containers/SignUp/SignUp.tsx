import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useUser } from "../../../context/user-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { object, string, infer as Infer } from "zod";
import { useCurrentUser } from "../../../hooks/queries/useCurrentUser";
import { fetcher } from "../../../utils/fetcher";
import { AuthLayout } from "../../AuthLayout/AuthLayout";
import { AuthFormField } from "../../AuthFormField/AuthFormField";

const createUserSchema = object({
  firstName: string({ error: "First name is required" })
    .min(1, {
      message: "First name is required",
    })
    .max(100, {
      message: "First name must be 100 characters or less.",
    })
    .refine((val) => /^\S+$/.test(val), {
      message: `First name must not include white space. Please remove any whitespace.`,
    }),
  lastName: string({ error: "Last name is required" })
    .min(1, {
      message: "Last name is required",
    })
    .max(100, {
      message: "Last name must be 100 characters or less.",
    })
    .refine((val) => /^\S+$/.test(val), {
      message: `Last name must not include white space. Please remove any whitespace.`,
    }),
  password: string({ error: "Password is required" })
    .min(6, "Password too short - should be 6 characters minimum")
    .max(256, {
      message: "Password must be 256 characters or less.",
    }),
  email: string({
    error: "Email is required",
  })
    .email("Not a valid email")
    .min(5, {
      message: "Email is required",
    })
    .max(256, {
      message: "Email address must be 256 characters or less.",
    })
    .refine((val) => /^\S+$/.test(val), {
      message: `Email must not include white space. Please remove any whitespace.`,
    }),
  username: string({ error: "Username is required" })
    .min(1, {
      message: "Username is required",
    })
    .max(100, {
      message: "Username must be 100 characters or less.",
    })
    .refine((val) => /^\S+$/.test(val), {
      message: `Username must not include white space. Please remove any whitespace.`,
    }),
});

type CreateUserInput = Infer<typeof createUserSchema>;

export const SignUp: React.FC = () => {
  const router = useRouter();
  const { userDispatch } = useUser();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  });

  const [registerError, setRegisterError] = useState<string | null>(null);

  const { data, refetch: refetchCurrentUser } = useCurrentUser({
    enabled: false,
    refetchOnWindowFocus: false,
  });

  async function onSubmit(values: CreateUserInput) {
    try {
      const userJson = await fetcher<{ error: string }>(`/sessions/register`, {
        method: "POST",
        body: values,
      });

      if (userJson?.error !== undefined) {
        setRegisterError(userJson.error);
      } else {
        refetchCurrentUser();
        router.push("/");
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e);
        setRegisterError(e.message);
      } else {
        console.error("Unexpected error", e);
        setRegisterError("An unexpected error occurred.");
      }
    }
  }

  useEffect(() => {
    if (data) {
      userDispatch({ type: "SET_USER", payload: data });
    }
  }, [data, userDispatch]);

  return (
    <AuthLayout
      accountPrompt="Already have an account?"
      accountLink="/"
      accountLinkText="Log in"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <AuthFormField
            {...register("firstName")}
            id="firstName"
            label="First name"
            type="text"
            autoComplete="given-name"
            error={errors.firstName?.message}
          />
          <AuthFormField
            {...register("lastName")}
            id="lastName"
            label="Last name"
            type="text"
            autoComplete="family-name"
            error={errors.lastName?.message}
          />
        </div>
        <AuthFormField
          {...register("email")}
          id="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
        />
        <AuthFormField
          {...register("username")}
          id="username"
          label="Username"
          type="text"
          autoComplete="username"
          error={errors.username?.message}
        />
        <AuthFormField
          {...register("password")}
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
        />
        <label className="flex items-start gap-3 text-sm text-gray-500">
          <input
            type="checkbox"
            defaultChecked
            name="checkbok-1"
            id="checkbok-1"
            className="mt-1 size-4 shrink-0 accent-brand-green"
          />
          <span className="min-w-0">
            I agree to the{" "}
            <span className="text-tan-background-accent">Terms of Service</span>{" "}
            &amp;{" "}
            <span className="text-tan-background-accent">Privacy Policy</span>
          </span>
        </label>
        {registerError && (
          <p
            role="alert"
            className="font-bold text-red-500 [overflow-wrap:anywhere]"
          >
            {registerError}
          </p>
        )}
        <button
          type="submit"
          className="min-h-12 w-full cursor-pointer rounded bg-tan-background-accent px-4 py-3 font-bold text-white hover:bg-tan-background"
        >
          Sign up
        </button>
      </form>
    </AuthLayout>
  );
};
