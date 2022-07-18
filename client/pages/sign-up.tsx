import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext } from "react";
import { useQuery } from "react-query";
import { SignUp } from "../components/Containers/SignUp/SignUp";
import { UserContext } from "../context/user-context";
import { User } from "../interfaces/User";
import fetcher from "../utils/fetcher";

const SignUpPage: NextPage = () => {
  const { userState, userDispatch } = useContext(UserContext);
  const router = useRouter();


  const { data } = useQuery(
    ["me"],
    () => fetcher(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`),
    {
      onSuccess: (data: User) => {
        // console.log("Logged in user: ", data);
        userDispatch({ type: "SET_USER", payload: data });
      },
    }
  );

  if (data) {
    router.push("/")
  }

  return (
    <div>
      <Head>
        <title>Sign up | Chinwag</title>
        <meta
          name="description"
          content="Text, Phone, Video with anyone, anywhere."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SignUp />
    </div>
  );
};

export default SignUpPage;