import { useQuery } from "react-query";
import { useContext, useEffect, useRef, useState } from "react";
import { User } from "../../../interfaces/User";
import { UserContext } from "../../../context/user-context";
import { fetchAllFriends } from "../../../api/user";
import { fetchUserDetails } from "../../../api/user";
import { getAllUserMessages } from "../../../api/message";
import { useAppContext } from "../../../context/global.context";
import { useSocket } from "../../../context/socket.context";
import { orderIds } from "../../../utils/orderIds";
import { useRouter } from "next/router";

interface SideNavProps {
  user: User | null;
}

export const SideNav: React.FC<SideNavProps> = ({user}) => {
  const router = useRouter();
  const { userState, userDispatch } = useContext(UserContext);
  const { selectedUserId, setSelectedUserId, setRoomName } = useAppContext();
  const { socket } = useSocket();
  const {
    isLoading: isFriendsLoading,
    isError: isFriendsError,
    data: friends,
    refetch: refetchFriends,
    error: friendsError,
  } = useQuery(
    ["userFriends", userState.user.id as unknown as number],
    () => fetchAllFriends(userState.user.id as unknown as number),
    { refetchOnWindowFocus: false, enabled: false }
  );

  const {
    isLoading: isUserMessagesLoading,
    isError: isUserMessagesError,
    data: userMessages,
    refetch: refetchMessages,
    error: userMessagesError,
  } = useQuery(
    ["allUserMessages", userState.user.id as unknown as number],
    () => getAllUserMessages(userState.user.id as unknown as number),
    { refetchOnWindowFocus: false, enabled: false }
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

  const handleOpenMessageModal = () => {};

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

  function handlePrivateMemberMsg(member: any) {
    setSelectedUserId(member);
    const roomId = orderIds(userState.user.id as unknown as number, member);
    console.log("roomId: ", roomId);
    setRoomName(roomId);
    joinRoom(roomId, member);
  }

  const handleLogoutUser = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sessions/`, {
        method: "DELETE",
        credentials: "include"
      });
      if(res.status === 204) {
        router.push("/");
      }

    } catch (err: any) {
      console.log("Login error: ", err);
      throw Error(err);
    }
  }

  useEffect(() => {
    if (userState.user.id) {
      refetchFriends();
      refetchMessages();
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      refetchUserDetails();
    }
  }, [selectedUserId]);

  return (
    <aside className="flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0 h-full">
      <div className="flex flex-col justify-between flex-1">
        <div>
          <div className="flex flex-row items-center justify-between h-12 w-full">
            <div className="ml-2 font-bold text-2xl">QuickChat</div>
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
            <div className="flex flex-row items-center justify-between text-xs">
              <span className="font-bold">Messages</span>
              <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">
                {userMessages?.length}
              </span>
            </div>
            <div className="flex flex-col space-y-1 mt-4 -mx-2 h- overflow-y-auto">
              {userMessages?.map((message) => (
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
                        {message.receiver_firstName} {message.receiver_lastName}
                      </div>
                    )}
                  </div>
                </button>
              ))}
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
                <div key={friend.id} className="flex flex-col space-y-1 -mx-2">
                  <button
                    // onClick={() => setSelectedUserId(friend.id)}
                    onClick={() => handlePrivateMemberMsg(friend.id)}
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
        </div>
        <div className="mt-auto">
          <button onClick={() => handleLogoutUser()}>Logout</button>
        </div>
      </div>
    </aside>
  );
};
