import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Login } from "../../Icons/Login";
import { UserContext } from "../../../context/user-context";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { object, string, TypeOf } from "zod";
import { useCurrentUser } from "../../../hooks/queries/useCurrentUser";

const createUserSchema = object({
  firstName: string({ required_error: "First name is required" })
    .min(1, {
      message: "First name is required",
    })
    .max(100, {
      message: "First name must be 100 characters or less.",
    })
    .refine(
      (val) => /^\S+$/.test(val),
      () => ({
        message: `First name must not include white space. Please remove any whitespace.`,
      })
    ),
  lastName: string({ required_error: "Last name is required" })
    .min(1, {
      message: "Last name is required",
    })
    .max(100, {
      message: "Last name must be 100 characters or less.",
    })
    .refine(
      (val) => /^\S+$/.test(val),
      () => ({
        message: `Last name must not include white space. Please remove any whitespace.`,
      })
    ),
  password: string({ required_error: "Password is required" })
    .min(6, "Password too short - should be 6 chars minimum")
    .max(256, {
      message: "Password must be 256 characters or less.",
    }),
  email: string({
    required_error: "Email is required",
  })
    .email("Not a valid email")
    .min(5, {
      message: "Email is required",
    })
    .max(256, {
      message: "Email address must be 256 characters or less.",
    })
    .refine(
      (val) => /^\S+$/.test(val),
      () => ({
        message: `Email must not include white space. Please remove any whitespace.`,
      })
    ),
  username: string({ required_error: "Username is required" })
    .min(1, {
      message: "Username is required",
    })
    .max(100, {
      message: "Username must be 100 characters or less.",
    })
    .refine(
      (val) => /^\S+$/.test(val),
      () => ({
        message: `Username must not include white space. Please remove any whitespace.`,
      })
    ),
});

type CreateUserInput = TypeOf<typeof createUserSchema>;

export const SignUp: React.FC = () => {
  const router = useRouter();
  const { userDispatch } = useContext(UserContext);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  });

  const [registerError, setRegisterError] = useState(null);

  const { data, refetch: refetchCurrentUser } = useCurrentUser({
    enabled: false,
    refetchOnWindowFocus: false,
  });

  async function onSubmit(values: CreateUserInput) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/sessions/register`,
        {
          method: "POST",
          body: JSON.stringify(values),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const userJson = await res.json();
      if (userJson.error !== undefined) {
        setRegisterError(userJson.error);
      } else {
        refetchCurrentUser();
        router.push("/");
      }
    } catch (e: any) {
      console.log(e);

      setRegisterError(e.message);
    }
  }

  useEffect(() => {
    if (data) {
      userDispatch({ type: "SET_USER", payload: data });
    }
  }, [data, userDispatch]);

  return (
    <main>
      <div className="grid grid-cols-2 h-screen antialiased">
        <div className="bg-tan-background">
          <div className="ml-6 mt-4 flex flex-wrap content-center items-center">
            <div>
              <Image
                alt="Logo"
                src="/assets/images/logo.png"
                height={50}
                width={50}
              />
            </div>
            <div>
              <h1 className=" text-brand-green text-2xl font-bold">Chinwag</h1>
            </div>
          </div>
          <div className="flex justify-center mt-60">
            <Login width="550px" />
          </div>
          <div className="mt-6 flex justify-center">
            <h1 className="text-white text-3xl font-bold">
              Chat with anyone, anywhere.
            </h1>
          </div>
        </div>
        <div className="mx-20 xl:mx-24 mt-80">
          <div className="flex">
            <h2 className="text-3xl font-bold">Chat Now.</h2>
          </div>
          <div className="flex">
            <div>
              <p className="mt-1 text-sm text-gray-400">
                Already have an account?
              </p>
            </div>
            <div>
              <Link href="/">
                <p className="cursor-pointer ml-1 mt-1 text-tan-background-accent text-sm tracking-wide">
                  Log in
                </p>
              </Link>
            </div>
          </div>
          {/* <div className="flex mt-7 space-x-3">
            <button className="bg-white border shadow-md hover:bg-gray-100 px-4 py-2 font-semibold inline-flex items-center space-x-2 rounded">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path
                    fill="#4285F4"
                    d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                  />
                  <path
                    fill="#34A853"
                    d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                  />
                </g>
              </svg>
              <span className="font-semibold text-sm">Login with Google</span>
            </button>
            <button className="bg-blue-500 hover:bg-blue-800 px-4 py-2 font-semibold text-white inline-flex items-center space-x-2 rounded">
              <svg
                className="w-5 h-5 fill-current"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm">Login with Facebook</span>
            </button>
          </div> */}
          {/* <div className="mt-4 flex items-center">
          <span className="border-b w-2/5 lg:w-2/4"></span>
          <a
            href="#"
            className="text-sm text-gray-400 text-center"
          >
            OR
          </a>
          <span className="border-b w-2/5 lg:w-2/4"></span>
        </div> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid xl:grid-cols-2 xl:gap-6 mt-6">
              <div className="w-full">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  First name
                </label>
                <input
                  {...register("firstName")}
                  className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                  type="text"
                />
                <p className="text-red-400 font-bold text-sm">
                  {errors.firstName?.message}
                </p>
              </div>
              <div className="mt-4 xl:mt-0 w-full">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Last name
                </label>
                <input
                  {...register("lastName")}
                  className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                  type="text"
                />
                <p className="text-red-400 font-bold text-sm">
                  {errors.lastName?.message}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                {...register("email")}
                className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                type="email"
              />
              <p className="text-red-400 font-bold text-sm">
                {errors.email?.message}
              </p>
            </div>
            <div className="grid xl:grid-cols-2 xl:gap-6 mt-4">
              <div className="w-full">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Username
                </label>
                <input
                  autoComplete="off"
                  {...register("username")}
                  className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                  type="text"
                />
                <p className="text-red-400 font-bold text-sm">
                  {errors.username?.message}
                </p>
              </div>
              <div className="mt-4 xl:mt-0 w-full">
                <div className="flex justify-between">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Password
                  </label>
                  {/* <a href="#" className="text-xs text-gray-500">
              Forgot Password?
            </a> */}
                </div>
                <input
                  autoComplete="password"
                  {...register("password")}
                  className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                  type="password"
                />
                <p className="text-red-400 font-bold text-sm">
                  {errors.password?.message}
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="ml-1 mt-2">
                <input
                  type="checkbox"
                  defaultChecked
                  name="checkbok-1"
                  id="checkbok-1"
                />
                <span className="check-icon"></span>
              </div>
              <div>
                <p className="mt-2 ml-2 text-sm text-gray-400">
                  I agree to the
                </p>
              </div>
              <div>
                <p className="ml-1 mt-2 text-tan-background-accent text-sm">
                  Terms of Service
                </p>
              </div>
              <div>
                <p className="ml-1 mt-2 text-sm text-gray-400">&</p>
              </div>
              <div>
                <p className="ml-1 mt-2 text-tan-background-accent text-sm">
                  Privacy Policy
                </p>
              </div>
            </div>
            {registerError && (
              <p className="mt-2 text-red-400 font-bold">{registerError}</p>
            )}
            <div className="mt-8">
              <button
                type="submit"
                className="bg-tan-background-accent text-white font-bold py-2 px-4 w-full rounded hover:bg-tan-background"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};
