import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useContext } from "react";
import { useQuery } from "react-query";
import { Chat } from "../components/Containers/Chat/Chat";
import { UserContext } from "../context/user-context";
import { User } from "../interfaces/User";
import fetcher from "../utils/fetcher";

type UserData = {
  user: User;
};
const ChatPage: NextPage<UserData> = ({ user }) => {
  const { userState, userDispatch } = useContext(UserContext);

  const { data } = useQuery(
    ["me"],
    () => fetcher(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`),
    {
      initialData: user,
      onSuccess: (data: User) => {
        // console.log("Logged in user: ", data);
        userDispatch({ type: "SET_USER", payload: data });
      },
    }
  );

  if (!user) {
    return <div>Error while trying to fetch user...</div>;
  }

  return (
    <div>
      <Head>
        <title>Chinwag | Chat</title>
        <meta
          name="description"
          content="Text, Phone, Video with anyone, anywhere."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Chat />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await fetcher(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`,
    context.req.headers
  );

  return { props: { user: data } };
};

export default ChatPage;