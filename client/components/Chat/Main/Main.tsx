import { useQuery } from "react-query";
import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";

import dynamic from "next/dynamic";
const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });

import { UserContext } from "../../../context/user-context";
import {
  fetchAllMessagesWithUser,
  getAllUserMessages,
} from "../../../api/message";
import { Message } from "../../../interfaces/Message";
import { fetchUserDetails, fetchUsersByEmail } from "../../../api/user";
import { useAppContext } from "../../../context/global.context";
import { useSocket } from "../../../context/socket.context";
import { orderIds } from "../../../utils/orderIds";
import { io } from "socket.io-client";
import useDebounce from "../../../hooks/useDebounce";
import ClipLoader from "react-spinners/ClipLoader";
import { User } from "../../../interfaces/User";
import { formatDate } from "../../../utils/formatDate";

interface MainProps {
  user: User | null;
}

export const Main: React.FC<MainProps> = ({ user }) => {
  const { socket, setSocket } = useSocket();
  const { userState, userDispatch } = useContext(UserContext);
  const {
    setMessages,
    messages,
    selectedUserId,
    setSelectedUserId,
    roomName,
    setRoomName,
    createNewMessage,
    setCreateNewMessage,
    isRecipientSearchResultsOpen,
    setIsRecipientSearchResultsOpen,
  } = useAppContext();

  const [recipientInput, setRecipientInput] = useState<string>("");
  const debouncedSearchTerm = useDebounce(recipientInput, 1500);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [
    earlierMessagesPaginationHasMore,
    setEarlierMessagesPaginationHasMore,
  ] = useState(true);

  const [newMessage, setNewMessage] = useState<string>("");
  const [showEmojis, setShowEmojis] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState();

  const scrollRef = useRef<any>();
  const emojiRef = useRef<any>();

  const {
    isLoading: isuserDetailsLoading,
    isError: isuserDetailsError,
    data: userDetails,
    refetch: refetchUserDetails,
    error: userDetailsError,
  } = useQuery(
    ["userDetails", selectedUserId],
    () => fetchUserDetails(selectedUserId as number),
    { initialData: user, refetchOnWindowFocus: false, enabled: false }
  );

  const {
    isLoading: isUserMessagesLoading,
    isError: isUserMessagesError,
    refetch: refetchMessages,
    error: userMessagesError,
  } = useQuery(
    ["allUserMessages", userState.user.id],
    () => getAllUserMessages(userState.user.id),
    { refetchOnWindowFocus: false, enabled: false }
  );

  const {
    data: recipientSearchResults,
    refetch: refetchRecipientSearchResults,
    isError: recipientSearchResultsError,
    isFetching: isRecipientSearchResultsFetching,
  } = useQuery(
    ["recipientSearchResults"],
    () => fetchUsersByEmail(recipientInput),
    {
      enabled: false,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  const handleShowEmojis = () => {
    emojiRef.current.focus();
    setShowEmojis(!showEmojis);
  };

  const handleSendMessage = async () => {
    sendMessage(userState.user.id, selectedUserId as number, newMessage);
    setNewMessage("");
  };

  function joinRoom(room: any, selectedUserId: number) {
    if (!userState.user.id) {
      return alert("Please login");
    }

    socket.emit("join-room", room, selectedUserId, userState.user.id);

    // dispatch for notifications
    // dispatch(resetNotifications(room));
  }

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
        sendMessage(userState.user.id, selectedUserId as number, newMessage);
        setNewMessage("");
      }
    }
  };

  function sendMessage(senderId: number, receiverId: number, message: string) {
    socket.emit("send-message", roomName, senderId, receiverId, message);
  }

  const handleChangeRecipientInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRecipientInput(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      searchForUserByEmail();
    }
  };

  const handleCreateNewConversationWithUser = (userId: number) => {
    setSelectedUserId(userId);

    const roomId = orderIds(userState.user.id, userId);
    setRoomName(roomId);
    joinRoom(roomId, userId);

    setCreateNewMessage(false);
    setIsRecipientSearchResultsOpen(false);
  };

  const handleLoadEarlierMessages = async () => {
    const earlierMessagesRes = await fetchAllMessagesWithUser(
      selectedUserId as number,
      userState.user.id as number,
      messages[messages.length - 1].createdAt
    );

    if (earlierMessagesRes.length < 20) {
      setEarlierMessagesPaginationHasMore(false);
    }

    if (earlierMessagesRes.length > 0) {
      setMessages((prev: Message[]) => [...prev, ...earlierMessagesRes]);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      refetchUserDetails();
      fetchAllMessagesWithUser(selectedUserId, userState.user.id).then((json) =>
        setMessages(json)
      );
    }
  }, [selectedUserId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (socket === null) return;

    if (socket === undefined) {
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string);

      setSocket(newSocket);

      return () => newSocket.close() as any;
    }

    if (socket !== undefined) {
      socket.on("receive-message", (newMessage: any) => {
        // Re-fetch the user's messages in sidebar when a message has been sent or received
        refetchMessages();

        const { receiverId, senderId } = newMessage;

        // Only overwrite the messages state if the receiver has a chat open with the user sending the message
        if (orderIds(receiverId, senderId) === roomName) {
          setMessages((prevMessages: any) => [...prevMessages, newMessage]);
        }
      });

      return () => socket.off("receive-message");
    }
  }, [socket, roomName]);

  async function searchForUserByEmail() {
    await refetchRecipientSearchResults();

    setIsSearching(false);
  }

  useEffect(() => {
    if (debouncedSearchTerm.length === 0) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    searchForUserByEmail();
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (recipientInput.length === 0) {
      setIsSearching(false);

      return;
    }

    setIsSearching(true);
  }, [recipientInput]);

  // useEffect(() => {
  //   emojiRef.current.selectionEnd = cursorPosition;
  // }, [cursorPosition]);

  return (
    <>
      {selectedUserId !== undefined && createNewMessage === false ? (
        <div className="flex flex-col flex-auto h-full pl-6">
          <div className="flex flex-col flex-auto flex-shrink-0  bg-gray-100 h-full p-3">
            <div className="flex flex-col flex-auto flex-shrink-0 border-b bg-gray-100 ">
              <div className="flex justify-between ml-3 rounded-lg">
                <div className="flex flex-row items-center">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full flex-shrink-0">
                    <img
                      className="rounded-full"
                      alt="User Avatar"
                      src={userDetails?.profile?.avatar as string}
                      height={40}
                      width={40}
                    />
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
                  <a href="#" className="block rounded-full w-10 h-10 p-2 ml-1">
                    <svg
                      viewBox="0 0 20 20"
                      className="w-full h-full fill-current text-blue-500"
                    >
                      <path d="M0,3.99406028 C0,2.8927712 0.894513756,2 1.99406028,2 L14.0059397,2 C15.1072288,2 16,2.89451376 16,3.99406028 L16,16.0059397 C16,17.1072288 15.1054862,18 14.0059397,18 L1.99406028,18 C0.892771196,18 0,17.1054862 0,16.0059397 L0,3.99406028 Z M8,14 C10.209139,14 12,12.209139 12,10 C12,7.790861 10.209139,6 8,6 C5.790861,6 4,7.790861 4,10 C4,12.209139 5.790861,14 8,14 Z M8,12 C9.1045695,12 10,11.1045695 10,10 C10,8.8954305 9.1045695,8 8,8 C6.8954305,8 6,8.8954305 6,10 C6,11.1045695 6.8954305,12 8,12 Z M16,7 L20,3 L20,17 L16,13 L16,7 Z" />
                    </svg>
                  </a>
                  <a href="#" className="block rounded-full w-10 h-10 p-2 ml-1">
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
            <div className="h-full overflow-x-auto ">
              {earlierMessagesPaginationHasMore && messages.length >= 20 && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={handleLoadEarlierMessages}
                    className="ml-12 bg-gray-200 hover:bg-gray-300 text-grey-darkest font-bold py-2 px-4 rounded inline-flex items-center"
                  >
                    <span>Load older messages</span>
                  </button>
                </div>
              )}

              <div className="flex flex-col mb-4">
                <div className="flex flex-col h-full">
                  <div className="grid grid-cols-12 gap-y-2">
                    {messages
                      .slice()
                      .reverse()
                      .map((message: Message) => (
                        <div
                          ref={scrollRef}
                          key={message.id}
                          className={
                            message.receiverId === userState.user.id
                              ? `col-start-1 col-end-8 p-3 rounded-lg`
                              : `col-start-6 col-end-13 p-3 rounded-lg`
                          }
                        >
                          <div
                            className={`text-gray-400 text-sm pb-3 ${
                              message.receiverId === userState.user.id
                                ? ``
                                : `text-right`
                            }`}
                          >
                            {formatDate(
                              new Date(Date.parse(message.createdAt))
                            )}
                          </div>
                          <div
                            className={
                              message.receiverId === userState.user.id
                                ? `flex flex-row items-center`
                                : `flex items-center justify-start flex-row-reverse`
                            }
                          >
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                              <img
                                className="rounded-full"
                                alt="User Avatar"
                                src={message?.sender?.profile?.avatar as string}
                                height={40}
                                width={40}
                              />
                            </div>

                            <div
                              className={
                                message.receiverId === userState.user.id
                                  ? `relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl`
                                  : `relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl`
                              }
                            >
                              <div>{message.message}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
              {/* <div>
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
              </div> */}
              <div className="flex-grow ">
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
      ) : createNewMessage ? (
        <div className="flex flex-col flex-auto h-full pl-6">
          <div className="flex flex-col flex-auto flex-shrink-0  bg-gray-100 h-full p-3">
            <div className="flex flex-col flex-auto flex-shrink-0 border-b bg-gray-100 ">
              <div className="flex justify-between ml-3 pt-2 pb-4 rounded-lg">
                <div className="flex flex-row items-center">
                  <div>To:</div>
                  <div className=" relative flex items-center space-x-2">
                    <div className="relative">
                      <input
                        onKeyDown={handleKeyDown}
                        onChange={(e) => handleChangeRecipientInput(e)}
                        className="ml-2 w-96 p-1"
                        type="text"
                        name="recipientInput"
                        placeholder="Enter the user's full email"
                        id="recipientInput"
                      />
                      <div className="flex absolute inset-y-0 right-2 items-center pl-3 pointer-events-none">
                        {recipientInput.length > 0 &&
                        recipientSearchResultsError === false &&
                        isRecipientSearchResultsFetching === false &&
                        recipientSearchResults &&
                        Object.keys(recipientSearchResults).length > 0 ? (
                          // if input is > 0
                          // if isError !== false
                          // if isFetching !== true
                          // if recipientSearchResults
                          // recipientSearchResults.length > 0
                          // User found
                          // Show green
                          <svg
                            className="w-6 h-6"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 22 22"
                          >
                            <defs>
                              <linearGradient
                                gradientUnits="userSpaceOnUse"
                                y2="-2.623"
                                x2="0"
                                y1="986.67"
                                id="0"
                              >
                                <stop stop-color="#ffce3b" />
                                <stop offset="1" stop-color="#ffd762" />
                              </linearGradient>
                              <linearGradient
                                y2="-2.623"
                                x2="0"
                                y1="986.67"
                                gradientUnits="userSpaceOnUse"
                              >
                                <stop stop-color="#ffce3b" />
                                <stop offset="1" stop-color="#fef4ab" />
                              </linearGradient>
                            </defs>
                            <g
                              transform="matrix(1.99997 0 0 1.99997-10.994-2071.68)"
                              fill="#da4453"
                            >
                              <rect
                                y="1037.36"
                                x="7"
                                height="8"
                                width="8"
                                fill="#32c671"
                                rx="4"
                              />
                              <path
                                d="m123.86 12.966l-11.08-11.08c-1.52-1.521-3.368-2.281-5.54-2.281-2.173 0-4.02.76-5.541 2.281l-53.45 53.53-23.953-24.04c-1.521-1.521-3.368-2.281-5.54-2.281-2.173 0-4.02.76-5.541 2.281l-11.08 11.08c-1.521 1.521-2.281 3.368-2.281 5.541 0 2.172.76 4.02 2.281 5.54l29.493 29.493 11.08 11.08c1.52 1.521 3.367 2.281 5.54 2.281 2.172 0 4.02-.761 5.54-2.281l11.08-11.08 58.986-58.986c1.52-1.521 2.281-3.368 2.281-5.541.0001-2.172-.761-4.02-2.281-5.54"
                                fill="#fff"
                                transform="matrix(.0436 0 0 .0436 8.177 1039.72)"
                                stroke="none"
                                stroke-width="9.512"
                              />
                            </g>
                          </svg>
                        ) : recipientInput.length > 0 &&
                          recipientSearchResultsError &&
                          isRecipientSearchResultsFetching === false ? (
                          // if input is > 0
                          // if isError
                          // if !fetching
                          // User not found
                          // Show red
                          <svg
                            className="w-6 h-6"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            viewBox="0 0 22 22"
                          >
                            <defs>
                              <linearGradient
                                gradientUnits="userSpaceOnUse"
                                y2="-2.623"
                                x2="0"
                                y1="986.67"
                              >
                                <stop stop-color="#ffce3b" />
                                <stop offset="1" stop-color="#ffd762" />
                              </linearGradient>
                              <linearGradient
                                id="0"
                                gradientUnits="userSpaceOnUse"
                                y1="986.67"
                                x2="0"
                                y2="-2.623"
                              >
                                <stop stop-color="#ffce3b" />
                                <stop offset="1" stop-color="#fef4ab" />
                              </linearGradient>
                              <linearGradient
                                gradientUnits="userSpaceOnUse"
                                x2="1"
                                x1="0"
                                xlinkHref="#0"
                              />
                            </defs>
                            <g transform="matrix(2 0 0 2-11-2071.72)">
                              <path
                                transform="translate(7 1037.36)"
                                d="m4 0c-2.216 0-4 1.784-4 4 0 2.216 1.784 4 4 4 2.216 0 4-1.784 4-4 0-2.216-1.784-4-4-4"
                                fill="#da4453"
                              />
                              <path
                                d="m11.906 1041.46l.99-.99c.063-.062.094-.139.094-.229 0-.09-.031-.166-.094-.229l-.458-.458c-.063-.062-.139-.094-.229-.094-.09 0-.166.031-.229.094l-.99.99-.99-.99c-.063-.062-.139-.094-.229-.094-.09 0-.166.031-.229.094l-.458.458c-.063.063-.094.139-.094.229 0 .09.031.166.094.229l.99.99-.99.99c-.063.062-.094.139-.094.229 0 .09.031.166.094.229l.458.458c.063.063.139.094.229.094.09 0 .166-.031.229-.094l.99-.99.99.99c.063.063.139.094.229.094.09 0 .166-.031.229-.094l.458-.458c.063-.062.094-.139.094-.229 0-.09-.031-.166-.094-.229l-.99-.99"
                                fill="#fff"
                              />
                            </g>
                          </svg>
                        ) : null}
                      </div>
                    </div>
                    {isRecipientSearchResultsOpen && (
                      <div
                        id="tooltip-bottom"
                        role="tooltip"
                        className="tooltip top-9 left-0 w-96 h-96 bg-white absolute z-10 overflow-y-auto  border inline-block  shadow-md py-2 px-3 text-sm rounded-lg"
                      >
                        {isSearching ? (
                          <div className="flex justify-center flex-col items-center h-full">
                            <ClipLoader color={"#9B9B9B"} size={50} />
                          </div>
                        ) : debouncedSearchTerm.length > 0 &&
                          recipientSearchResultsError === false &&
                          recipientSearchResults &&
                          Object.keys(recipientSearchResults).length > 0 ? (
                          <div
                            onClick={() =>
                              handleCreateNewConversationWithUser(
                                recipientSearchResults.id
                              )
                            }
                            className="flex items-center space-x-1 cursor-pointer hover:bg-gray-200 rounded-md"
                          >
                            <div className="p-2  max-w-full">
                              <div className="relative w-9 h-9 overflow-hidden rounded-full">
                                <Image
                                  src={recipientSearchResults.profile.avatar}
                                  className=""
                                  height={36}
                                  width={36}
                                />
                              </div>
                            </div>
                            <div>
                              <p className="whitespace-nowrap  text-sMd text-black overflow-ellipsis">
                                {recipientSearchResults.firstName}{" "}
                                {recipientSearchResults.lastName}
                              </p>
                            </div>
                          </div>
                        ) : debouncedSearchTerm.length > 0 ? (
                          <div>
                            No user was found with the specified email. Be sure
                            to double check if the email you have entered is
                            correct.
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col h-full overflow-x-auto mb-4"></div>
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
    </>
  );
};
