import Head from "next/head";
import { SocketProvider } from "../../../context/socket.context";
import { User } from "../../../interfaces/User";
import { Chat } from "../../Containers/Chat/Chat";

export const ChatLayout: React.FC<{ user: User }> = ({ user }) => (
  <SocketProvider userId={user.id}>
    <div>
      <Head>
        <title>Chat | Chinwag</title>
        <meta
          name="description"
          content="Text, Phone, Video with anyone, anywhere."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Chat user={user} />
    </div>
  </SocketProvider>
);
