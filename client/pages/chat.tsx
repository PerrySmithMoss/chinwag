import type { NextPage } from "next";
import Head from "next/head";
import { Chat } from "../components/Containers/Chat/Chat";

const ChatPage: NextPage = () => {
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

export default ChatPage;
