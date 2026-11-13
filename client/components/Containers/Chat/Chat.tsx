import { useEffect } from "react";
import Image from "next/image";
import { useAppContext } from "../../../context/global.context";
import { useUser } from "../../../context/user-context";
import { SideNav } from "../../Chat/SideNav/SideNav";
import { Main } from "../../Chat/Main/Main";
import { User } from "../../../interfaces/User";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCurrentUser } from "../../../hooks/queries/useCurrentUser";

interface ChatProps {
  user: User | null;
}

export const Chat: React.FC<ChatProps> = ({ user }) => {
  const { userDispatch } = useUser();
  const {
    selectedUserId,
    setSelectedUserId,
    createNewMessage,
    setCreateNewMessage,
    setRoomName,
    setIsRecipientSearchResultsOpen,
  } = useAppContext();
  const showConversation = selectedUserId !== undefined || createNewMessage;

  const showChats = () => {
    setSelectedUserId(undefined);
    setCreateNewMessage(false);
    setRoomName(undefined);
    setIsRecipientSearchResultsOpen(false);
    requestAnimationFrame(() =>
      document.getElementById("chat-list-heading")?.focus(),
    );
  };

  const createMessage = () => {
    setSelectedUserId(undefined);
    setCreateNewMessage(true);
    setRoomName(undefined);
    setIsRecipientSearchResultsOpen(false);
    requestAnimationFrame(() =>
      document.getElementById("recipientInput")?.focus(),
    );
  };

  const { data } = useCurrentUser({ initialData: user });

  useEffect(() => {
    if (data) {
      userDispatch({ type: "SET_USER", payload: data });
    }
  }, [data, userDispatch]);

  if (!data) return null;
  return (
    <main className="flex h-dvh flex-col antialiased text-gray-800">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-white px-4 py-2 md:hidden">
        <div className="flex items-center gap-2">
          <Image src="/assets/images/logo.png" alt="" width={28} height={28} />
          <span className="text-lg font-bold">Chinwag</span>
        </div>
        <nav aria-label="Chat navigation" className="flex items-center gap-2">
          <button
            type="button"
            onClick={showChats}
            aria-controls="chat-list"
            aria-pressed={!showConversation}
            className="min-h-11 cursor-pointer rounded-lg px-3 text-sm font-bold text-brand-green-strong hover:bg-indigo-50 aria-pressed:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
          >
            Chats
          </button>
          <button
            type="button"
            onClick={createMessage}
            aria-controls="conversation"
            aria-pressed={createNewMessage}
            className="min-h-11 cursor-pointer rounded-lg bg-brand-green-strong px-3 text-sm font-bold text-white hover:bg-brand-green-strong-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
          >
            New chat
          </button>
        </nav>
      </header>
      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 w-full">
          <div
            id="chat-list"
            className={`${showConversation ? "hidden" : "flex"} min-h-0 w-full shrink-0 md:flex md:w-64`}
          >
            <SideNav user={data} onCreateMessage={createMessage} />
          </div>
          <section
            id="conversation"
            aria-label="Conversation"
            className={`${showConversation ? "flex" : "hidden"} min-h-0 min-w-0 flex-1 flex-col md:flex`}
          >
            <Main
              key={
                createNewMessage ? "new-message" : (selectedUserId ?? "empty")
              }
              user={data}
              onCreateMessage={createMessage}
            />
          </section>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </div>
    </main>
  );
};
