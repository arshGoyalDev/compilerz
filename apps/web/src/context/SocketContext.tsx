import { createContext, useContext, type ReactNode, useRef, useEffect } from "react";

import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
});

const useSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_SERVER_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.current.on("connect", () => {
      return true;
    });

    return () => {
      socket.current?.disconnect();
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socket.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
