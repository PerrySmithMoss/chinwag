import { useState, useEffect, useRef } from "react";
import { Message } from "../interfaces/Message";

export default function useWebsocket({
  url,
  onConnected
}: {
  url: string;
  onConnected: any;
}) {
  const [messages, setMessages] = useState<[] | Message[] | undefined>(
    undefined
  );
  const [reconnecting, setReconnecting] = useState(false);
  const socket = useRef<any>(null);
  const [activeConnection, setActiveConnection] = useState(false);

  useEffect(() => {
    // console.log(userId);
    // console.log("running socket hook");
    if (activeConnection === false) {
      socket.current = new WebSocket(url);

      socket.current.onopen = () => {
        // console.log("connected");
        onConnected(socket.current);
      };

      socket.current.onclose = () => {
        console.log("closed");
        if (socket.current) {
          if (reconnecting) return;
          setReconnecting(true);
          setTimeout(() => setReconnecting(false), 2000);
        }
      };

      socket.current.onmessage = (e: any) => {
        const data = JSON.parse(e.data);
        setMessages((prev: Message[] | undefined | []) => {
          if (prev) {
            // console.log("message received ", data);
            return [...prev, data];
          }
        });
      };

      setActiveConnection(true);

      return () => {
        socket.current.close();
        socket.current = null;
      };
    }
  }, [reconnecting, url]);

  function readyState() {
    switch (socket.current.readyState) {
      case 0:
        return "CONNECTING";
      case 1:
        return "OPEN";
      case 2:
        return "CLOSING";
      case 3:
        return "CLOSED";
      default:
        return;
    }
  }

  return {
    socket: socket.current,
    readyState: readyState,
    reconnecting,
    messages,
    setMessages,
  };
}
