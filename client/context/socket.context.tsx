import React, { useContext, useEffect, useState, createContext } from "react";
import io from "socket.io-client";

const SocketContext = createContext<any>(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({children}: {
  children: React.ReactNode;
}) {
  const [socket, setSocket] = useState<any>();

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string);

    setSocket(newSocket);

    return () => newSocket.close() as any;
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
