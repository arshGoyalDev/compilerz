import { createContext, useContext, type ReactNode, useRef, useEffect, useState } from "react";

import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

const useSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }: { children: ReactNode }) => {
  // const socket = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_SERVER_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
    
    socketInstance.on("connect", () => {
      console.log("dkjdk")
    });
    
    socketInstance.on('execution-complete', ({ success, output, exitCode }: { success: boolean; output: string; exitCode: string}) => {
      console.log(`Output`, output);
    })
    
    socketInstance.on("execution-error", (data) => {
      console.log("Error:" ,data);
    })

    setSocket(socketInstance);
    
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
