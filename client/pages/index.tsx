import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { Login } from "../components/Icons/Login";
import { User } from "../interfaces/User";
import { UserContext } from "../context/user-context";
import fetcher from "../utils/fetcher";
import { Chat } from "../components/Containers/Chat/Chat";
import { SocketProvider } from "../context/socket.context";
import { object, string, TypeOf } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCurrentUser } from "../hooks/queries/useCurrentUser";

const loginSchema = object({
  email: string().min(1, {
    message: "Email is required",
  }),
  password: string().min(1, {
    message: "Password is required",
  }),
});

type LoginInput = TypeOf<typeof loginSchema>;

type UserData = {
  user: User | null;
};

const Home: NextPage<UserData> = ({ user }) => {
  const { userDispatch, userState } = useContext(UserContext);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const {
    data,
    refetch: refetchCurrentUser,
    isFetching,
  } = useCurrentUser({ initialData: user, refetchOnWindowFocus: false });

  async function onSubmit(values: LoginInput) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/sessions/create`,
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
        setLoginError(userJson.error);
      } else {
        refetchCurrentUser();
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e);
        setLoginError(e.message);
      } else {
        console.error("Unexpected error", e);
        setLoginError("An unexpected error occurred.");
      }
    }
  }

  useEffect(() => {
    if (data) {
      userDispatch({ type: "SET_USER", payload: data });
    }
  }, [data, userDispatch]);

  useEffect(() => {
    if (!isFetching) {
      setLoading(false);
    }
  }, [isFetching]);

  if (loading) {
    return null;
  }
  if (data && !loading && userState) {
    return (
      <SocketProvider>
        <div>
          <Head>
            <title>Chat | Chinwag</title>
            <meta
              name="description"
              content="Text, Phone, Video with anyone, anywhere."
            />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <Chat user={data} />
        </div>
      </SocketProvider>
    );
  } else
    return (
      <div>
        <Head>
          <title>Chinwag</title>
          <meta
            name="description"
            content="Text, Phone, Video with anyone, anywhere."
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <div className="grid grid-cols-2 h-screen antialiased">
            <div className="bg-tan-background">
              <div className="ml-6 mt-4 flex flex-wrap content-center items-center">
                <div>
                  <Image
                    src="/assets/images/logo.png"
                    height={50}
                    width={50}
                    alt="Logo"
                  />
                </div>
                <div>
                  <h1 className="text-brand-green text-2xl font-bold">
                    Chinwag
                  </h1>
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
            <div className="ml-24 mt-80">
              <div className="flex">
                <h2 className="text-3xl font-bold">Chat Now.</h2>
              </div>
              <div className="flex">
                <div>
                  <p className="mt-1 text-sm text-gray-400">
                    Don&apos;t have an account?
                  </p>
                </div>
                <div>
                  <Link href="/sign-up">
                    <p className="cursor-pointer ml-1 mt-1 text-tan-background-accent hover:text-red-500 text-sm tracking-wide">
                      Sign up
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
                  <span className="font-semibold text-sm">
                    Login with Google
                  </span>
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
                <div className="mt-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email Address
                  </label>
                  <input
                    autoComplete="on"
                    {...register("email")}
                    className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-96 appearance-none"
                    type="email"
                  />
                  <p className="text-red-400 text-sm font-bold">
                    {errors.email?.message}
                  </p>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Password
                    </label>
                    {/* <a href="#" className="text-xs text-gray-500">
                  Forgot Password?
                </a> */}
                  </div>
                  <input
                    autoComplete="on"
                    {...register("password")}
                    className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-96 appearance-none"
                    type="password"
                  />
                  <p className="text-red-400 text-sm font-bold">
                    {errors.password?.message}
                  </p>
                </div>
                {loginError && (
                  <p className="mt-2 text-red-400 font-bold">{loginError}</p>
                )}
                <div className="mt-5">
                  <button
                    type="submit"
                    className="bg-tan-background-accent text-white font-bold py-2 px-4 w-96 rounded hover:bg-tan-background"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let user: null | UserData = null;

  if (context.req.headers.cookie) {
    try {
      user = await fetcher(`/users/me`, context.req.headers);
    } catch (e) {
      console.error("Error while trying to fetch current user", e);
    }
  }

  return {
    props: {
      user,
    },
  };
};

export default Home;
