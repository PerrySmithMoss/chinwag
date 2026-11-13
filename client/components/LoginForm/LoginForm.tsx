import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { object, string, infer as Infer } from "zod";
import { AuthFormField } from "../AuthFormField/AuthFormField";

const loginSchema = object({
  email: string().min(1, { message: "Email is required" }),
  password: string().min(1, { message: "Password is required" }),
});

type LoginInput = Infer<typeof loginSchema>;

type Props = {
  onSubmit: (values: LoginInput) => void;
  loginError: string | null;
  pending: boolean;
};

export const LoginForm: React.FC<Props> = ({
  onSubmit,
  loginError,
  pending,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      <AuthFormField
        {...register("email")}
        id="email"
        label="Email Address"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
      />
      <AuthFormField
        {...register("password")}
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
      />
      {loginError && (
        <p
          role="alert"
          className="font-bold text-red-500 [overflow-wrap:anywhere]"
        >
          {loginError}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="min-h-12 w-full cursor-pointer rounded bg-tan-background-accent px-4 py-3 font-bold text-white hover:bg-tan-background disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Login"}
      </button>
    </form>
  );
};
