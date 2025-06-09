import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { User } from "../interfaces/User";
import { UserContext } from "../context/user-context";
import fetcher from "../utils/fetcher";
import { useCurrentUser } from "../hooks/queries/useCurrentUser";
import { ChatLayout } from "../components/Chat/ChatLayout/ChatLayout";
import { LoginForm } from "../components/LoginForm/LoginForm";
import Image from "next/image";
import { Login as LoginIcon } from "../components/Icons/Login";

type UserData = {
  user: User | null;
};

const Home: NextPage<UserData> = ({ user }) => {
  const { userDispatch, userState } = useContext(UserContext);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    data,
    refetch: refetchCurrentUser,
    isFetching,
  } = useCurrentUser({ initialData: user, refetchOnWindowFocus: false });

  const onSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);

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

      if (userJson.error) {
        setLoginError(userJson.error);
      } else {
        setLoginError(null);
        refetchCurrentUser();
      }
    } catch (e: unknown) {
      console.error(e);
      setLoginError("An unexpected error occurred.");
    }
  };

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
  return data && userState ? (
    <ChatLayout user={data} />
  ) : (
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
          <div className="bg-tan-background flex flex-col justify-center items-center h-full p-10">
            <div className="flex items-center space-x-2 mb-8">
              <Image
                src="/assets/images/logo.png"
                height={50}
                width={50}
                alt="Logo"
              />
              <h1 className="text-brand-green text-2xl font-bold">Chinwag</h1>
            </div>
            <LoginIcon width="550px" />
            <h1 className="text-white text-3xl font-bold mt-6">
              Chat with anyone, anywhere.
            </h1>
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
            <LoginForm onSubmit={onSubmit} loginError={loginError} />
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
