import React, { useContext, useEffect, useState, createContext } from "react";
import io from "socket.io-client";

const SocketContext = createContext<any>(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({id,children}: {
  id: string;
  children: React.ReactNode;
}) {
  const [socket, setSocket] = useState<any>();

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
      query: { id },
    });

    setSocket(newSocket);

    return () => newSocket.close() as any;
  }, [id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
