import type { NextPage } from "next";
import Head from "next/head";
import { Chat } from "../components/Containers/Chat/Chat";
import { ChatV2 } from "../components/Containers/Chat/ChatV2";

const ChatPage: NextPage = () => {
  return (
    <div className="">
      <Head>
        <title>Chinwag | Chat</title>
        <meta
          name="description"
          content="Text, Phone, Video with anyone, anywhere."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ChatV2 />
    </div>
  );
};

export default ChatPage;
