import { createContext, useContext, useEffect, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { fetcher } from "../utils/fetcher";

const SocketContext = createContext<Socket | undefined>(undefined);

export function SocketProvider({ children }: React.PropsWithChildren) {
  const socket = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!url) return undefined;

    return io(url, {
      autoConnect: false,
      forceNew: true,
      auth: (callback) => {
        fetcher<{ ticket: string }>("/sessions/socket-ticket", { method: "POST" })
          .then(({ ticket }) => callback({ ticket }))
          .catch(() => callback({}));
      },
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    let retries = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const resetRetries = () => { retries = 0; };
    const retryRejectedConnection = () => {
      // Socket.IO handles transport failures itself, but not rejected handshakes.
      if (socket.active || retries >= 6) return;
      const delay = Math.min(5_000 * 2 ** retries++, 60_000);
      retryTimer = setTimeout(() => socket.connect(), delay);
    };

    socket.on("connect", resetRetries);
    socket.on("connect_error", retryRejectedConnection);
    socket.connect();
    return () => {
      clearTimeout(retryTimer);
      socket.off("connect", resetRetries);
      socket.off("connect_error", retryRejectedConnection);
      socket.disconnect();
    };
  }, [socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
