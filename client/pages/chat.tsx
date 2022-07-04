import type { NextPage } from "next";
import Head from "next/head";
import { Chat } from "../components/Containers/Chat/Chat";
import { SocketProvider } from "../context/socket.context";
import useLocalStorage from "../hooks/useLocalStorage";

const ChatPage: NextPage = () => {
  const [id, setId] = useLocalStorage('id')

  return (
    <SocketProvider id={id}>
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
    </SocketProvider>
  );
};

export default ChatPage;
