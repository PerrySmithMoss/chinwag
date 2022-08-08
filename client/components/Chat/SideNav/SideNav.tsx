import { useQuery } from "react-query";
import Image from "next/image";
import styles from "./SidebarNav.module.css";
import { useContext, useEffect, useState } from "react";
import { User } from "../../../interfaces/User";
import { UserContext } from "../../../context/user-context";
import { fetchUserDetails } from "../../../api/user";
import { getAllUserMessages } from "../../../api/message";
import { useAppContext } from "../../../context/global.context";
import { useSocket } from "../../../context/socket.context";
import { orderIds } from "../../../utils/orderIds";
import { UpdateUserAvatar } from "../../Modals/UserAvatar/UpdateUserAvatar/UpdateUserAvatar";
import fetcher from "../../../utils/fetcher";
import { truncateString } from "../../../utils/string";
import { timeSince } from "../../../utils/dateTime";

interface SideNavProps {
  user: User | null;
}

export const SideNav: React.FC<SideNavProps> = ({ user }) => {
  const { userState, userDispatch } = useContext(UserContext);

  const {
    selectedUserId,
    setSelectedUserId,
    setRoomName,
    setCreateNewMessage,
    setIsRecipientSearchResultsOpen,
  } = useAppContext();

  const { socket } = useSocket();

  const [isActive, setIsActive] = useState(true);

  const [isUpdateUserAvatarModalOpen, setIsUpdateUserAvatarModalOpen] =
    useState(false);

  const { refetch: refetchCurrentUser } = useQuery(
    ["me"],
    () => fetcher(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me/v2`),
    {
      initialData: user,
      onSuccess: (data: User) => {
        userDispatch({ type: "SET_USER", payload: data });
      },
    }
  );

  const {
    isLoading: isUserMessagesLoading,
    isError: isUserMessagesError,
    data: userMessages,
    refetch: refetchMessages,
    error: userMessagesError,
  } = useQuery(
    ["allUserMessages", userState.user.id],
    () => getAllUserMessages(userState.user.id),
    {
      refetchOnWindowFocus: false,
      enabled: !!userState.user.id,
      onSuccess: () => {
        setIsLoadingMessages(false);
      },
    }
  );
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

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

  const handleCreateNewMessage = () => {
    // Open new main component with blank details
    // User types in the email they would like to message
    // THEN
    // User clicks the user they would like to message
    // Request is sent to the server to fetch the selectedUserId details and message thread (if they have one already)
    // selectedUserId global state is then updated to the user Id they selected to message
    // User can now send message
    // User
    setCreateNewMessage(true);
    setIsRecipientSearchResultsOpen(true);
  };

  //   socket.off("notifications").on("notifications", (room) => {
  //     if (currentRoom !== room) dispatch(addNotifications(room));
  // });

  function joinRoom(room: any, selectedUserId: number) {
    if (!userState.user.id) {
      return alert("Please login");
    }

    socket.emit("join-room", room, selectedUserId, userState.user.id);

    // dispatch for notifications
    // dispatch(resetNotifications(room));
  }

  function handlePrivateMemberMsg(receiverId: number, senderId: number) {
    // Determine who the other user is
    if (userState.user.id === receiverId) {
      setSelectedUserId(senderId);

      const roomId = orderIds(userState.user.id, senderId);

      setRoomName(roomId);
      joinRoom(roomId, senderId);
    } else if (userState.user.id === senderId) {
      setSelectedUserId(receiverId);

      const roomId = orderIds(userState.user.id, receiverId);

      setRoomName(roomId);
      joinRoom(roomId, receiverId);
    }
  }

  const handleLogoutUser = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/sessions/`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.status === 204) {
        refetchCurrentUser();
      }
    } catch (err: any) {
      console.log("Login error: ", err);
      throw Error(err);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      refetchUserDetails();
      refetchMessages();
    }
  }, [selectedUserId]);

  return (
    <aside className="flex flex-col py-3 pl-6 pr-2 w-64 bg-white flex-shrink-0 h-full">
      <div className="flex flex-col justify-between flex-1">
        <div>
          <div className="flex flex-row items-center justify-between h-12 w-full">
            <div className="ml-2 font-bold text-2xl">Chinwag</div>
            <div
              onClick={handleCreateNewMessage}
              className="cursor-pointer flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-8 w-8"
            >
              <svg height="27px" viewBox="0 0 24 24" className="fill-current">
                <path d="M6.3 12.3l10-10a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-10 10a1 1 0 0 1-.7.3H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 .3-.7zM8 16h2.59l9-9L17 4.41l-9 9V16zm10-2a1 1 0 0 1 2 0v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h6a1 1 0 0 1 0 2H4v14h14v-6z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col items-center bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg">
            <div className="relative">
              <img
                src={userState?.user?.profile?.avatar}
                alt="Avatar"
                width={80}
                height={80}
                onClick={() => setIsUpdateUserAvatarModalOpen(true)}
                className={`${styles.avatar} h-20 w-20 rounded-full cursor-pointer relative`}
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
            <div className="text-sm font-semibold mt-2">
              {userState.user.firstName} {userState.user.lastName}
            </div>
            <div className="text-xs text-gray-500">
              {userState.user.username}
            </div>
            <div className="flex items-center mt-2.5">
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
          <div className="flex flex-col mt-8">
            <div className="mb-3 flex flex-row items-center justify-between">
              <span className="font-bold">Messages</span>
              <span className="flex items-center justify-center text-sm bg-gray-300 h-5 w-5 rounded-full">
                {userMessages?.length}
              </span>
            </div>
            {Array.isArray(userMessages) && userMessages.length > 0 ? (
              <div className="max-h-96 overflow-y-auto overflow-x-hidden">
                {userMessages?.map((message) => (
                  <div
                    key={message.id}
                    className="flex flex-col space-y-1 -mx-2"
                  >
                    <button
                      onClick={() =>
                        handlePrivateMemberMsg(
                          message.receiverId,
                          message.senderId
                        )
                      }
                      className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2"
                    >
                      <div className="flex items-center justify-center">
                        {message.receiverId === userState.user.id ? (
                          <Image
                            className="rounded-full"
                            src={message.sender_avatar}
                            height={40}
                            width={40}
                          />
                        ) : (
                          <Image
                            className="rounded-full"
                            src={message.receiver_avatar}
                            height={40}
                            width={40}
                          />
                        )}
                      </div>
                      <div className="ml-2 flex flex-col items-start">
                        {message.receiverId === userState.user.id ? (
                          <div>
                            <p className="text-sMd text-left font-semibold">
                              {message.sender_firstName}{" "}
                              {message.sender_lastName}
                            </p>
                            <div className="flex items-center space-x-2">
                              <p className="text-xsS text-left">
                                {truncateString(message.message, 23)}
                              </p>
                              <p className="text-xsS text-left">·</p>
                              <p className="text-xsS text-left">
                                {timeSince(
                                  new Date(Date.parse(message.createdAt))
                                )}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sMd font-semibold text-left">
                              {message.receiver_firstName}{" "}
                              {message.receiver_lastName}
                            </p>
                            <div className="flex items-center space-x-2">
                              <p className="text-xsS text-left">
                                {truncateString(message.message, 23)}
                              </p>
                              <p className="text-xsS text-left">·</p>
                              <p className="text-xsS text-left">
                                {timeSince(
                                  new Date(Date.parse(message.createdAt))
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-1">
                <button
                  onClick={handleCreateNewMessage}
                  className="bg-brand-green hover:bg-brand-green_hover text-white py-2 w-full rounded-full"
                >
                  Create message
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-auto">
          <button
            onClick={() => handleLogoutUser()}
            className="bg-gray-200 hover:bg-gray-300 text-grey-darkest font-bold py-2 px-4 rounded inline-flex items-center"
          >
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
