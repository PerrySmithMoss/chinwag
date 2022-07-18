import type { NextPage } from "next";
import Head from "next/head";
import { SignUp } from "../components/Containers/SignUp/SignUp";

const SignUpPage: NextPage = () => {
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
