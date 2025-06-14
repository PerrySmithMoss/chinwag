import React, { useContext, useEffect, useState, createContext } from "react";
import io, { Socket } from "socket.io-client";

type SocketProps = {
  socket: Socket | undefined;
  setSocket: React.Dispatch<React.SetStateAction<Socket | undefined>>;
};

const SocketContext = createContext<SocketProps>({
  socket: undefined,
  setSocket: () => {},
});

export function SocketProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: number;
}) {
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string);
    setSocket(newSocket);

    if (userId) {
      newSocket.on("connect", () => {
        newSocket.emit("join-user-room", userId);
      });
    }

    return () => {
      newSocket.close();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
