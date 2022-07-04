import { createContext, useContext, useState } from "react";

// @TODO: Need to type the props
type GlobalUIProps = {
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
