import Image from "next/image";
import styles from "./SidebarNav.module.css";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { User } from "../../../interfaces/User";
import { useUser } from "../../../context/user-context";
import { useAppContext } from "../../../context/global.context";
import { useSocket } from "../../../context/socket.context";
import { orderIds } from "../../../utils/orderIds";
import { UpdateUserAvatar } from "../../Modals/UserAvatar/UpdateUserAvatar/UpdateUserAvatar";
import { truncateString } from "../../../utils/string";
import { timeSince } from "../../../utils/dateTime";
import {
  currentUserQueryKey,
  useCurrentUser,
} from "../../../hooks/queries/useCurrentUser";
import { useUserDetails } from "../../../hooks/queries/useUserDetails";
import { useAllUserMessages } from "../../../hooks/queries/useAllUserMessages";
import { fetcher } from "../../../utils/fetcher";
import { Message, ThreadMessage } from "../../../interfaces/Message";

interface SideNavProps {
  user: User | null;
  onCreateMessage: () => void;
}

export const SideNav: React.FC<SideNavProps> = ({ user, onCreateMessage }) => {
  const [isActive, setIsActive] = useState(true);
  // const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isUpdateUserAvatarModalOpen, setIsUpdateUserAvatarModalOpen] =
    useState(false);
  const [threadMessages, setThreadMessages] = useState<
    Record<string, ThreadMessage>
  >({});
  const { userDispatch } = useUser();

  const {
    selectedUserId,
    setSelectedUserId,
    setRoomName,
    setCreateNewMessage,
  } = useAppContext();

  const socket = useSocket();
  const queryClient = useQueryClient();

  const { data: userData } = useCurrentUser({
    initialData: user,
    refetchOnWindowFocus: false,
  });

  const { data: userMessages, refetch: refetchMessages } = useAllUserMessages(
    userData?.id,
    {
      refetchOnWindowFocus: false,
      enabled: !!userData?.id,
    },
  );

  const { refetch: refetchUserDetails } = useUserDetails(selectedUserId, {
    refetchOnWindowFocus: false,
    enabled: false,
  });

  function handlePrivateMemberMsg(receiverId: number, senderId: number) {
    setCreateNewMessage(false);
    // Determine who the other user is
    if (userData?.id === receiverId) {
      setSelectedUserId(senderId);

      const roomId = orderIds(userData.id, senderId);

      setRoomName(roomId);
    } else if (userData?.id === senderId) {
      setSelectedUserId(receiverId);

      const roomId = orderIds(userData.id, receiverId);

      setRoomName(roomId);
    }
  }

  const handleLogoutUser = async () => {
    try {
      await fetcher(`/sessions`, {
        method: "DELETE",
      });

      await queryClient.cancelQueries({ queryKey: currentUserQueryKey });
      queryClient.setQueryData(currentUserQueryKey, null);
      userDispatch({ type: "REMOVE_USER" });
    } catch {
      toast.error("Could not sign out. Please try again.");
    }
  };

  const threads = { ...threadMessages };
  for (const message of userMessages ?? []) {
    const id = orderIds(message.senderId, message.receiverId);
    if (
      !threads[id] ||
      Date.parse(message.createdAt) >= Date.parse(threads[id].createdAt)
    ) {
      threads[id] = message;
    }
  }
  const sortedMessages = Object.values(threads).sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id - a.id,
  );

  useEffect(() => {
    if (selectedUserId) {
      refetchUserDetails();
      refetchMessages();
    }
  }, [selectedUserId, refetchUserDetails, refetchMessages]);

  useEffect(() => {
    if (userData) {
      userDispatch({ type: "SET_USER", payload: userData });
    }
  }, [userData, userDispatch]);

  useEffect(() => {
    const handleReceiveMessage = (newMessage: Message) => {
      if (!newMessage?.createdAt) return;

      const involved =
        newMessage.receiverId === userData?.id ||
        newMessage.senderId === userData?.id;
      if (!involved) return;

      const threadId = orderIds(newMessage.receiverId, newMessage.senderId);

      // Format into ThreadMessage shape
      const formatted: ThreadMessage = {
        id: newMessage.id,
        createdAt: newMessage.createdAt,
        updatedAt: newMessage.updatedAt,
        message: newMessage.message,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        sender: {
          id: newMessage.sender.id,
          firstName: newMessage.sender.firstName,
          lastName: newMessage.sender.lastName,
          username: newMessage.sender.username,
          avatar: newMessage.sender.profile?.avatar ?? null,
        },
        receiver: {
          id: newMessage.receiver.id,
          firstName: newMessage.receiver.firstName,
          lastName: newMessage.receiver.lastName,
          username: newMessage.receiver.username,
          avatar: newMessage.receiver.profile?.avatar ?? null,
        },
      };

      setThreadMessages((prev) => {
        const current = prev[threadId];
        if (
          !current ||
          new Date(formatted.createdAt) > new Date(current.createdAt)
        ) {
          return { ...prev, [threadId]: formatted };
        }
        return prev;
      });
    };

    if (socket && userData?.id) {
      socket.on("receive-message", handleReceiveMessage);
      return () => {
        socket.off("receive-message", handleReceiveMessage);
      };
    }
  }, [socket, userData?.id]);

  if (!userData) return null;

  return (
    <aside
      aria-label="Messages and profile"
      className="flex h-full min-h-0 w-full flex-col overflow-y-auto bg-white px-4 py-3 md:pl-6 md:pr-2"
    >
      <div className="flex min-h-full shrink-0 flex-col justify-between">
        <div className="flex flex-1 flex-col">
          <div className="hidden h-12 w-full shrink-0 flex-row items-center justify-between md:flex">
            <div className="ml-2 flex items-center">
              <div>
                <Image
                  alt="Logo"
                  src="/assets/images/logo.png"
                  height={30}
                  width={30}
                />
              </div>
              <div>
                <p className="ml-2 font-bold text-2xl">Chinwag</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Create message"
              onClick={onCreateMessage}
              className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-indigo-100 text-blue-500"
            >
              <svg height="23px" viewBox="0 0 24 24" className="fill-current">
                <path d="M6.3 12.3l10-10a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-10 10a1 1 0 0 1-.7.3H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 .3-.7zM8 16h2.59l9-9L17 4.41l-9 9V16zm10-2a1 1 0 0 1 2 0v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h6a1 1 0 0 1 0 2H4v14h14v-6z" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex w-full shrink-0 items-center gap-4 rounded-lg border border-gray-200 bg-indigo-100 px-4 py-4 md:flex-col md:gap-0 md:py-6">
            <div className="relative shrink-0">
              <Image
                src={
                  userData?.profile?.avatar ??
                  "/assets/images/default-avatar.jpg"
                }
                alt="Avatar"
                width={65}
                height={65}
                onClick={() => setIsUpdateUserAvatarModalOpen(true)}
                className={`${styles.avatar} relative size-12 cursor-pointer rounded-full md:size-[65px]`}
              />
              <div
                style={{ transform: "translate(50%, 0%)" }}
                className=" cursor-pointer top-2 right-2 absolute rounded-full"
              >
                <div
                  onClick={() => setIsUpdateUserAvatarModalOpen(true)}
                  aria-label="Update Profile Avatar"
                  role="button"
                  className="h-8 w-8 bg-gray-300 hover:bg-gray-400 flex justify-center rounded-full text-center items-center"
                >
                  <svg
                    version="1.1"
                    id="Capa_1"
                    className="block mb-0.5"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    viewBox="0 0 487 487"
                    fill="#050505"
                    height={17}
                    width={17}
                    xmlSpace="preserve"
                  >
                    <g>
                      <g>
                        <path
                          d="M308.1,277.95c0,35.7-28.9,64.6-64.6,64.6s-64.6-28.9-64.6-64.6s28.9-64.6,64.6-64.6S308.1,242.25,308.1,277.95z
			 M440.3,116.05c25.8,0,46.7,20.9,46.7,46.7v122.4v103.8c0,27.5-22.3,49.8-49.8,49.8H49.8c-27.5,0-49.8-22.3-49.8-49.8v-103.9
			v-122.3l0,0c0-25.8,20.9-46.7,46.7-46.7h93.4l4.4-18.6c6.7-28.8,32.4-49.2,62-49.2h74.1c29.6,0,55.3,20.4,62,49.2l4.3,18.6H440.3z
			 M97.4,183.45c0-12.9-10.5-23.4-23.4-23.4c-13,0-23.5,10.5-23.5,23.4s10.5,23.4,23.4,23.4C86.9,206.95,97.4,196.45,97.4,183.45z
			 M358.7,277.95c0-63.6-51.6-115.2-115.2-115.2s-115.2,51.6-115.2,115.2s51.6,115.2,115.2,115.2S358.7,341.55,358.7,277.95z"
                        />
                      </g>
                    </g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                    <g></g>
                  </svg>
                </div>
              </div>
            </div>
            {isUpdateUserAvatarModalOpen && (
              <UpdateUserAvatar
                open={isUpdateUserAvatarModalOpen}
                onClose={() => setIsUpdateUserAvatarModalOpen(false)}
                selector="updateUserAvatarModal"
              />
            )}
            <div className="min-w-0 flex-1 md:mt-2 md:w-full md:flex-none md:text-center">
              <div className="truncate text-sm font-semibold">
                {userData.firstName} {userData.lastName}
              </div>
              <div className="truncate text-xs text-gray-500">
                {userData.username}
              </div>
              <div className="mt-2.5 flex items-center md:justify-center">
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="toggle"
                    checked={isActive}
                    onChange={() => setIsActive(!isActive)}
                    id="toggle"
                    className={`${styles.toggleCheckbox} absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer`}
                  />
                  <label
                    htmlFor="toggle"
                    className={`${styles.toggleLabel} block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer`}
                  ></label>
                </div>
                {isActive ? (
                  <label htmlFor="toggle" className="text-xs text-gray-700">
                    Active
                  </label>
                ) : (
                  <label htmlFor="toggle" className="text-xs text-gray-700">
                    Busy
                  </label>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-1 flex-col">
            <div className="mb-3 flex flex-row items-center justify-between">
              <h2
                id="chat-list-heading"
                tabIndex={-1}
                className="font-bold focus:outline-none"
              >
                Messages
              </h2>
              <span className="flex items-center justify-center text-sm bg-gray-300 h-5 w-5 rounded-full">
                {sortedMessages?.length ?? 0}
              </span>
            </div>
            {Array.isArray(sortedMessages) && sortedMessages.length > 0 ? (
              <ul
                aria-labelledby="chat-list-heading"
                className="max-h-96 overflow-y-auto overflow-x-hidden"
              >
                {sortedMessages?.map((message) => (
                  <li key={message.id} className="flex flex-col space-y-1">
                    <button
                      type="button"
                      aria-current={
                        selectedUserId ===
                        (message.receiverId === userData.id
                          ? message.senderId
                          : message.receiverId)
                          ? "true"
                          : undefined
                      }
                      onClick={() =>
                        handlePrivateMemberMsg(
                          message.receiverId,
                          message.senderId,
                        )
                      }
                      className="flex w-full cursor-pointer flex-row items-center rounded-xl p-2 hover:bg-gray-100 aria-[current=true]:bg-indigo-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-green"
                    >
                      <div className="flex shrink-0 items-center justify-center px-1">
                        {message.receiverId === userData.id ? (
                          <Image
                            alt="Message sender Avatar"
                            className="rounded-full"
                            src={
                              message.sender.avatar ??
                              "/assets/images/default-avatar.jpg"
                            }
                            height={40}
                            width={40}
                          />
                        ) : (
                          <Image
                            alt="Message receiver avatar"
                            className="rounded-full"
                            src={
                              message.receiver.avatar ??
                              "/assets/images/default-avatar.jpg"
                            }
                            height={40}
                            width={40}
                          />
                        )}
                      </div>
                      <div className="ml-2 flex min-w-0 flex-1 flex-col items-start px-1">
                        {message.receiverId === userData.id ? (
                          <div className="flex w-full min-w-0 items-center justify-center">
                            <div className="min-w-0 flex-1 flex-col items-center justify-between space-x-1">
                              <p className="truncate text-left text-sm font-semibold">
                                {message.sender.firstName}{" "}
                                {message.sender.lastName}
                              </p>
                              <p className="truncate text-left text-sm">
                                {truncateString(message.message, 23)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between space-x-1">
                              <p className="shrink-0 text-right text-xs">
                                {timeSince(
                                  new Date(Date.parse(message.createdAt)),
                                )}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex w-full min-w-0 items-center justify-center">
                            <div className="min-w-0 flex-1 flex-col items-center justify-between space-x-1">
                              <p className="truncate text-left text-sm font-semibold">
                                {message.receiver.firstName}{" "}
                                {message.receiver.lastName}
                              </p>
                              <p className="truncate text-left text-sm">
                                {truncateString(message.message, 23)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between space-x-1">
                              <p className="shrink-0 text-right text-xs">
                                {timeSince(
                                  new Date(Date.parse(message.createdAt)),
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-1">
                <p className="mb-3 text-sm text-gray-500">
                  Your conversations will appear here.
                </p>
                <button
                  type="button"
                  onClick={onCreateMessage}
                  className="min-h-11 w-full cursor-pointer rounded bg-brand-green-strong px-4 py-2 text-white hover:bg-brand-green-strong-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
                >
                  Create message
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="shrink-0 pt-4">
          <button
            onClick={() => handleLogoutUser()}
            className="flex min-h-11 w-full cursor-pointer items-center justify-center rounded bg-gray-200 px-4 py-2 font-bold text-gray-800 hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};
