import { io } from "socket.io-client";
import { createContext, useContext, useState } from "react";

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string);

// @TODO: Need to type the props
type GlobalUIProps = {
  socket: any | undefined;
  messages: any;
  setMessages: React.Dispatch<React.SetStateAction<any>>;
  members: any;
  setMembers: React.Dispatch<React.SetStateAction<any>>;
  selectedUserId: number | undefined;
  setSelectedUserId: React.Dispatch<React.SetStateAction<number | undefined>>;
  roomName: string | undefined;
  setRoomName: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const AppContext = createContext<GlobalUIProps>({
  socket: undefined,
  messages: [],
  setMessages: () => {},
  members: [],
  setMembers: () => {},
  selectedUserId: undefined,
  setSelectedUserId: () => {},
  roomName: undefined,
  setRoomName: () => {},
});

export const AppContextProvider = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  const [messages, setMessages] = useState<any>([]);
  const [members, setMembers] = useState<any>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    undefined
  );
  const [roomName, setRoomName] = useState<string | undefined>(undefined);
  return (
    <AppContext.Provider
      value={{
        socket: socket,
        messages,
        setMessages,
        members,
        setMembers,
        selectedUserId,
        setSelectedUserId,
        roomName,
        setRoomName,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Export useContext Hook.
export function useAppContext() {
  return useContext(AppContext);
}
