import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import { HomeIcon } from "../icons/HomeIcon";
import useWebsocket from "../hooks/useWebSocket";
import { useQuery, useQueryClient } from "react-query";
import { useContext, useEffect, useState } from "react";
import { User } from "../interfaces/User";
import { UserContext } from "../contexts/user-context";
import { fetchAllFriends } from "../apiCalls/fetchAllFriends";
import { fetchAllMessagesWithUser } from "../apiCalls/fetchAllMessagesWithUser";
import { MessageList } from "../components/Messsage/MessageList";
import { Message } from "../interfaces/Message";
// import { faComments } from "@fortawesome/free-regular-svg-icons";

const Chat: NextPage = () => {
  const { userState, userDispatch } = useContext(UserContext);
  const [selectedUserId, setSelectedUserId] = useState<undefined | number>(
    undefined
  );

  const {
    isLoading: isFriendsLoading,
    isError: isFriendsError,
    data: friends,
    error: friendsError,
  } = useQuery(
    ["userFriends", selectedUserId],
    () => fetchAllFriends(userState.user.id as unknown as number),
    { refetchOnWindowFocus: false }
  );

  const {
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    data: messagesData,
    refetch,
    error: messagesError,
  } = useQuery(
    ["userMessages", selectedUserId, userState.user.id],
    () =>
      fetchAllMessagesWithUser(
        selectedUserId as number,
        userState.user.id as unknown as number
      ),
    { refetchOnWindowFocus: false, enabled: false }
  );

  const handleOpenMessageModal = () => {};

  const { socket, reconnecting, messages, setMessages } = useWebsocket({
    url: "ws://127.0.0.1:7071",
    onConnected,
  });

  function onConnected(socket: any) {
    socket.send(
      JSON.stringify({
        type: "connect",
        userId: userState.user.id as unknown as number,
      })
    );
  }

  useEffect(() => {
    // console.log(selectedUserId)
    if (selectedUserId) {
      // refetch();

      fetchAllMessagesWithUser(selectedUserId, userState.user.id as unknown as number)
      .then((json) =>
        setMessages(json),
      );
      // setMessages(messagesData as Message[]);
      console.log("Messages: ", messages);
    }
  }, [selectedUserId]);

  return reconnecting ? (
    <div>reconnecting!</div>
  ) : (
    // return (
    <div className="">
      <Head>
        <title>Chinwag | Chat</title>
        <meta
          name="description"
          content="Text, Phone, Video with anyone, anywhere."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="flex h-screen antialiased text-gray-800">
          <div className="flex flex-row h-full w-full overflow-x-hidden">
            <div className="flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0">
              <div className="flex flex-row items-center justify-between h-12 w-full">
                <div className="ml-2 font-bold text-2xl">QuickChat</div>
                <div
                  onClick={handleOpenMessageModal}
                  className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-8 w-8"
                >
                  <svg
                    height="27px"
                    viewBox="0 0 24 24"
                    className="fill-current"
                  >
                    <path d="M6.3 12.3l10-10a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-10 10a1 1 0 0 1-.7.3H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 .3-.7zM8 16h2.59l9-9L17 4.41l-9 9V16zm10-2a1 1 0 0 1 2 0v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h6a1 1 0 0 1 0 2H4v14h14v-6z" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col items-center bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg">
                <div className="h-20 w-20 rounded-full border overflow-hidden">
                  <img
                    src="https://avatars3.githubusercontent.com/u/2763884?s=128"
                    alt="Avatar"
                    className="h-full w-full"
                  />
                </div>
                <div className="text-sm font-semibold mt-2">
                  {userState.user.firstName} {userState.user.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  {userState.user.username}
                </div>
                <div className="flex flex-row items-center mt-3">
                  <div className="flex flex-col justify-center h-4 w-8 bg-indigo-500 rounded-full">
                    <div className="h-3 w-3 bg-white rounded-full self-end mr-1"></div>
                  </div>
                  <div className="leading-none ml-1 text-xs">Active</div>
                </div>
              </div>
              <div className="flex flex-col mt-8">
                <div className="flex flex-row items-center justify-between text-xs">
                  <span className="font-bold">Active Conversations</span>
                  <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">
                    4
                  </span>
                </div>
                <div className="flex flex-col space-y-1 mt-4 -mx-2 h-48 overflow-y-auto">
                  <button className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
                    <div className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full">
                      H
                    </div>
                    <div className="ml-2 text-sm font-semibold">Henry Boyd</div>
                  </button>
                  <button className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
                    <div className="flex items-center justify-center h-8 w-8 bg-gray-200 rounded-full">
                      M
                    </div>
                    <div className="ml-2 text-sm font-semibold">
                      Marta Curtis
                    </div>
                    <div className="flex items-center justify-center ml-auto text-xs text-white bg-red-500 h-4 w-4 rounded leading-none">
                      2
                    </div>
                  </button>
                  <button className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
                    <div className="flex items-center justify-center h-8 w-8 bg-orange-200 rounded-full">
                      P
                    </div>
                    <div className="ml-2 text-sm font-semibold">
                      Philip Tucker
                    </div>
                  </button>
                  <button className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
                    <div className="flex items-center justify-center h-8 w-8 bg-pink-200 rounded-full">
                      C
                    </div>
                    <div className="ml-2 text-sm font-semibold">
                      Christine Reid
                    </div>
                  </button>
                  <button className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
                    <div className="flex items-center justify-center h-8 w-8 bg-purple-200 rounded-full">
                      J
                    </div>
                    <div className="ml-2 text-sm font-semibold">
                      Jerry Guzman
                    </div>
                  </button>
                </div>
                <div className="flex flex-row items-center justify-between text-xs mt-6">
                  <span className="font-bold">Archivied</span>
                  <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">
                    7
                  </span>
                </div>
                <div className="flex flex-col space-y-1 mt-4 -mx-2">
                  <button className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
                    <div className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full">
                      H
                    </div>
                    <div className="ml-2 text-sm font-semibold">Henry Boyd</div>
                  </button>
                </div>
                <div className="mb-3 flex flex-row items-center justify-between text-xs mt-6">
                  <span className="font-bold">Friends</span>
                  <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">
                    {friends?.length}
                  </span>
                </div>
                {friends &&
                  friends?.map((friend: User) => (
                    <div
                      key={friend.id}
                      className="flex flex-col space-y-1 -mx-2"
                    >
                      <button
                        onClick={() => setSelectedUserId(friend.id)}
                        className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2"
                      >
                        <div className="flex text-sm items-center justify-center h-8 w-8 bg-indigo-200 rounded-full">
                          {friend.firstName.charAt(0)}{friend.lastName.charAt(0)}
                        </div>
                        <div className="ml-2 text-sm font-semibold">
                          {friend.firstName} {friend.lastName}
                        </div>
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            {messages ? (
              <MessageList
                messagesData={messages}
                selectedUserId={selectedUserId as number | undefined}
                // socket={socket}
              />
            ) : (
              <div className="flex flex-col flex-auto h-full p-6">
                <div className="flex flex-col flex-auto flex-shrink-0  bg-gray-100 h-full p-4">
                  <div className="flex flex-col h-full overflow-x-auto mb-4">
                    <div className="flex flex-col h-full justify-center items-center">
                      <h2 className="text-2xl font-bold">
                        No message has been selected.
                      </h2>
                      <h2 className="text-xl">
                        Please open a chat to view the messages.
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
