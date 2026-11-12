import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { User } from "../interfaces/User";
import { useUser } from "../context/user-context";
import { useCurrentUser } from "../hooks/queries/useCurrentUser";
import { ChatLayout } from "../components/Chat/ChatLayout/ChatLayout";
import { LoginForm } from "../components/LoginForm/LoginForm";
import { AuthLayout } from "../components/AuthLayout/AuthLayout";
import { fetcher } from "../utils/fetcher";

type UserData = {
  user: User | null;
};

const Home: NextPage<UserData> = ({ user }) => {
  const { userDispatch, userState } = useUser();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data, refetch: refetchCurrentUser } = useCurrentUser({
    initialData: user,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const onSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    setLoginError(null);

    try {
      await fetcher("/sessions/create", {
        method: "POST",
        body: values,
      });
      await refetchCurrentUser({ throwOnError: true });
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Could not sign in.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
      userDispatch({ type: "SET_USER", payload: data });
    }
  }, [data, userDispatch]);

  return userState.user ? (
    <ChatLayout user={userState.user} />
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

      <AuthLayout
        accountPrompt="Don't have an account?"
        accountLink="/sign-up"
        accountLinkText="Sign up"
      >
        <LoginForm
          onSubmit={onSubmit}
          loginError={loginError}
          pending={loading}
        />
      </AuthLayout>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let user: User | null = null;

  if (context.req.headers.cookie) {
    try {
      const headers = {
        cookie: context.req.headers.cookie || "",
      };
      user = await fetcher<User>(`/users/me/v2`, { headers });
    } catch (e) {
      console.error("Error fetching user:", e);
    }
  }

  return {
    props: {
      user,
    },
  };
};

export default Home;
