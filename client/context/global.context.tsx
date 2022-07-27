import { createContext, useContext, useState } from "react";
import { Message } from "../interfaces/Message";

// @TODO: Need to type the props
type GlobalUIProps = {
  messages: any;
  setMessages: React.Dispatch<React.SetStateAction<any>>;
  members: any;
  setMembers: React.Dispatch<React.SetStateAction<any>>;
  selectedUserId: number | undefined;
  setSelectedUserId: React.Dispatch<React.SetStateAction<number | undefined>>;
  createNewMessage: boolean;
  setCreateNewMessage: React.Dispatch<React.SetStateAction<boolean>>;
  isRecipientSearchResultsOpen: boolean;
  setIsRecipientSearchResultsOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
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
  createNewMessage: false,
  setCreateNewMessage: () => {},
  isRecipientSearchResultsOpen: false,
  setIsRecipientSearchResultsOpen: () => {},
  roomName: undefined,
  setRoomName: () => {},
});

export const AppContextProvider = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<any>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    undefined
  );
  const [createNewMessage, setCreateNewMessage] = useState<boolean>(false);
  const [isRecipientSearchResultsOpen, setIsRecipientSearchResultsOpen] =
    useState<boolean>(false);
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
        createNewMessage,
        setCreateNewMessage,
        isRecipientSearchResultsOpen,
        setIsRecipientSearchResultsOpen,
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
