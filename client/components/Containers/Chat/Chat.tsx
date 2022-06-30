import useWebsocket from "../../../hooks/useWebSocket";
import { useQuery, useQueryClient } from "react-query";
import { useContext, useEffect, useRef, useState } from "react";
import { User } from "../../../interfaces/User";
import Picker from "emoji-picker-react";
import { UserContext } from "../../../contexts/user-context";
import { fetchAllFriends } from "../../../apiCalls/fetchAllFriends";
import { fetchAllMessagesWithUser } from "../../../apiCalls/fetchAllMessagesWithUser";
import { MessageList } from "../../Messsage/MessageList";
import { Message, UniqueMessage } from "../../../interfaces/Message";
import { fetchUserDetails } from "../../../apiCalls/fetchUserDetails";
import { getAllUserMessages } from "../../../apiCalls/fetchAllMessagesForSpecificUser";
import { SideNav } from "../../Chat/SideNav/SideNav";

interface ChatProps {}

export const Chat: React.FC<ChatProps> = ({}) => {
  const { userState, userDispatch } = useContext(UserContext);
  const [selectedUserId, setSelectedUserId] = useState<undefined | number>(
    undefined
  );
  const [newMessage, setNewMessage] = useState<string>("");
  const [showEmojis, setShowEmojis] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState();
  const scrollRef = useRef<any>();
  const emojiRef = useRef<any>();
  const {
    isLoading: isFriendsLoading,
    isError: isFriendsError,
    data: friends,
    error: friendsError,
  } = useQuery(
    ["userFriends", userState.user.id as unknown as number],
    () => fetchAllFriends(userState.user.id as unknown as number),
    { refetchOnWindowFocus: false }
  );

  const {
    isLoading: isUserMessagesLoading,
    isError: isUserMessagesError,
    data: userMessages,
    error: userMessagesError,
  } = useQuery(
    ["allUserMessages", userState.user.id as unknown as number],
    () => getAllUserMessages(userState.user.id as unknown as number),
    { refetchOnWindowFocus: false }
  );

  const {
    isLoading: isuserDetailsLoading,
    isError: isuserDetailsError,
    data: userDetails,
    refetch: refetchUserDetails,
    error: userDetailsError,
  } = useQuery(
    ["userDetails", selectedUserId],
    () => fetchUserDetails(selectedUserId as number),
    { refetchOnWindowFocus: false, enabled: false }
  );

  const {
    isLoading: isAllMessagesWithSpecificUserLoading,
    isError: isAllMessagesWithSpecificUserError,
    data: allMessagesWithSpecificUserData,
    refetch,
    error: allMessagesWithSpecificUserError,
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

  const handleShowEmojis = () => {
    emojiRef.current.focus();
    setShowEmojis(!showEmojis);
  };

  const handleSendMessage = async () => {
    // mutateAsync();
    await socket.send(
      JSON.stringify({
        type: "message",
        senderId: userState.user.id,
        receiverId: selectedUserId,
        message: newMessage,
      })
    );
    setNewMessage("");
  };

  const onEmojiClick = (event: any, { emoji }: any) => {
    emojiRef.current.focus();
    const start = newMessage.substring(0, emojiRef.current.selectionStart);
    const end = newMessage.substring(emojiRef.current.selectionStart);

    const text = start + emoji + end;
    setNewMessage(text);
    emojiRef.current.selectionEnd = start.length + emoji.length;
    setCursorPosition(start.length + emoji.length);
    // setChosenEmoji(emojiObject);
  };

  const handleKeyPress = (ev: React.KeyboardEvent) => {
    if (ev.key === "Enter") {
      if (newMessage === "") {
        console.log("Please enter a message");
      } else {
        handleSendMessage();
      }
    }
  };

  useEffect(() => {
    // console.log(selectedUserId)
    if (selectedUserId) {
      // refetch();
      refetchUserDetails();
      fetchAllMessagesWithUser(
        selectedUserId,
        userState.user.id as unknown as number
      ).then((json) => setMessages(json));
      // console.log("Messages: ", messages);
    }
  }, [selectedUserId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessagesWithSpecificUserData, messages]);

  // useEffect(() => {
  //   emojiRef.current.selectionEnd = cursorPosition;
  // }, [cursorPosition]);
  return reconnecting ? (
    <div>reconnecting!</div>
  ) : (
    <main>
      <div className="flex h-screen antialiased text-gray-800">
        <div className="flex flex-row h-full w-full overflow-x-hidden">
          <aside className="flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0">
            <div className="flex flex-row items-center justify-between h-12 w-full">
              <div className="ml-2 font-bold text-2xl">Chinwag</div>
              <div
                onClick={handleOpenMessageModal}
                className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-8 w-8"
              >
                <svg height="27px" viewBox="0 0 24 24" className="fill-current">
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
              <div className="flex flex-row items-center justify-between text-sm">
                <span className="font-bold">Messages</span>
                <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">
                  {userMessages?.length}
                </span>
              </div>
              <div className="flex flex-col space-y-1 mt-4 -mx-2 h-full overflow-y-auto">
                {userMessages?.map((message: UniqueMessage) => (
                  <button
                    key={message.id}
                    className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2"
                  >
                    <div className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full">
                      H
                    </div>
                    <div className="ml-2 text-sm font-semibold">
                      {message.receiverId ===
                      (userState.user.id as unknown as number) ? (
                        <div>
                          {message.sender_firstName} {message.sender_lastName}
                        </div>
                      ) : (
                        <div>
                          {message.receiver_firstName}{" "}
                          {message.receiver_lastName}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex flex-row items-center justify-between text-sm mt-6">
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
              <div className="mb-3 flex flex-row items-center justify-between text-sm mt-6">
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
                        {friend.firstName.charAt(0).toUpperCase()}
                        {friend.lastName.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-2 text-sm font-semibold">
                        {friend.firstName} {friend.lastName}
                      </div>
                    </button>
                  </div>
                ))}
            </div>
          </aside>
          {messages ? (
            <div className="flex flex-col flex-auto h-full pl-6">
              <div className="flex flex-col flex-auto flex-shrink-0  bg-gray-100 h-full p-3">
                <div className="flex flex-col flex-auto flex-shrink-0 border-b bg-gray-100 ">
                  <div className="flex justify-between ml-3 rounded-lg">
                    <div className="flex flex-row items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                        {userDetails?.firstName.charAt(0).toUpperCase()}
                        {userDetails?.lastName.charAt(0).toUpperCase()}
                      </div>
                      <div className="relative ml-1 py-2 px-4">
                        <div className="font-bold">
                          {userDetails?.firstName} {userDetails?.lastName}
                        </div>
                        <div className="text-sm">@{userDetails?.username}</div>
                      </div>
                    </div>
                    <div className="flex mr-4 mt-2">
                      <a href="#" className="block rounded-full w-10 h-10 p-2">
                        <svg
                          viewBox="0 0 20 20"
                          className="w-full h-full fill-current text-blue-500"
                        >
                          <path d="M11.1735916,16.8264084 C7.57463481,15.3079672 4.69203285,12.4253652 3.17359164,8.82640836 L5.29408795,6.70591205 C5.68612671,6.31387329 6,5.55641359 6,5.00922203 L6,0.990777969 C6,0.45097518 5.55237094,3.33066907e-16 5.00019251,3.33066907e-16 L1.65110039,3.33066907e-16 L1.00214643,8.96910337e-16 C0.448676237,1.13735153e-15 -1.05725384e-09,0.445916468 -7.33736e-10,1.00108627 C-7.33736e-10,1.00108627 -3.44283713e-14,1.97634814 -3.44283713e-14,3 C-3.44283713e-14,12.3888407 7.61115925,20 17,20 C18.0236519,20 18.9989137,20 18.9989137,20 C19.5517984,20 20,19.5565264 20,18.9978536 L20,18.3488996 L20,14.9998075 C20,14.4476291 19.5490248,14 19.009222,14 L14.990778,14 C14.4435864,14 13.6861267,14.3138733 13.2940879,14.7059121 L11.1735916,16.8264084 Z" />
                        </svg>
                      </a>
                      <a
                        href="#"
                        className="block rounded-full w-10 h-10 p-2 ml-1"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          className="w-full h-full fill-current text-blue-500"
                        >
                          <path d="M0,3.99406028 C0,2.8927712 0.894513756,2 1.99406028,2 L14.0059397,2 C15.1072288,2 16,2.89451376 16,3.99406028 L16,16.0059397 C16,17.1072288 15.1054862,18 14.0059397,18 L1.99406028,18 C0.892771196,18 0,17.1054862 0,16.0059397 L0,3.99406028 Z M8,14 C10.209139,14 12,12.209139 12,10 C12,7.790861 10.209139,6 8,6 C5.790861,6 4,7.790861 4,10 C4,12.209139 5.790861,14 8,14 Z M8,12 C9.1045695,12 10,11.1045695 10,10 C10,8.8954305 9.1045695,8 8,8 C6.8954305,8 6,8.8954305 6,10 C6,11.1045695 6.8954305,12 8,12 Z M16,7 L20,3 L20,17 L16,13 L16,7 Z" />
                        </svg>
                      </a>
                      <a
                        href="#"
                        className="block rounded-full w-10 h-10 p-2 ml-1"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          className="w-full h-full fill-current text-blue-500"
                        >
                          <path d="M2.92893219,17.0710678 C6.83417511,20.9763107 13.1658249,20.9763107 17.0710678,17.0710678 C20.9763107,13.1658249 20.9763107,6.83417511 17.0710678,2.92893219 C13.1658249,-0.976310729 6.83417511,-0.976310729 2.92893219,2.92893219 C-0.976310729,6.83417511 -0.976310729,13.1658249 2.92893219,17.0710678 Z M9,11 L9,10.5 L9,9 L11,9 L11,15 L9,15 L9,11 Z M9,5 L11,5 L11,7 L9,7 L9,5 Z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col h-full overflow-x-auto my-4">
                  <div className="flex flex-col h-full">
                    <div className="grid grid-cols-12 gap-y-2">
                      {messages?.map((message: Message) =>
                        message.senderId ===
                        (userState.user.id as unknown as number) ? (
                          <div
                            ref={scrollRef}
                            key={message.id}
                            className="col-start-1 col-end-8 p-3 rounded-lg"
                          >
                            <div
                              key={message.id}
                              className="flex flex-row items-center"
                            >
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                                {message.sender.firstName
                                  .charAt(0)
                                  .toUpperCase()}
                                {message.sender.lastName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div className="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl">
                                <div>{message.message}</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            ref={scrollRef}
                            key={message.id}
                            className="col-start-6 col-end-13 p-3 rounded-lg"
                          >
                            <div className="flex items-center justify-start flex-row-reverse">
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                                {message.receiver.firstName
                                  .charAt(0)
                                  .toUpperCase()}
                                {message.receiver.lastName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
                                <div>{message.message}</div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
                  <div>
                    <button className="flex items-center justify-center text-gray-400 hover:text-gray-600">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <div className="flex-grow ml-4">
                    <div className="relative w-full">
                      <input
                        ref={emojiRef}
                        name="newMessage"
                        value={newMessage}
                        onKeyPress={handleKeyPress}
                        onChange={(event) => {
                          setNewMessage(event.target.value);
                        }}
                        type="text"
                        className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
                      />

                      <button
                        onClick={handleShowEmojis}
                        className="absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600"
                      >
                        {showEmojis ? (
                          <div className="overflow-y-auto absolute bottom-14">
                            <Picker onEmojiClick={onEmojiClick} />
                          </div>
                        ) : null}
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={handleSendMessage}
                      className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
                    >
                      <span>Send</span>
                      <span className="ml-2">
                        <svg
                          className="w-4 h-4 transform rotate-45 -mt-px"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          ></path>
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
  );
};
