import React, { useContext, useEffect, useState, createContext } from "react";
import io from "socket.io-client";

type SocketProps = {
  socket: any;
  setSocket: React.Dispatch<React.SetStateAction<any>>;
};

const SocketContext = createContext<SocketProps>({
  socket: undefined,
  setSocket: () => {},
});


export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<any>();

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string);

    setSocket(newSocket);

    return () => newSocket.close() as any;
  }, []);

  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
