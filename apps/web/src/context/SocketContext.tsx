import { createContext, useContext, type ReactNode, useRef, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  output: string[];
  setOutput: Dispatch<SetStateAction<string[]>>
}

const SocketContext = createContext<SocketContextType | null>(null);

const useSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  
  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_SERVER_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
    
    socketInstance.on("terminal:output", (terminalOutput) => {
      setOutput((prev) => [...prev, ...terminalOutput]);
    })

    setSocket(socketInstance);
    
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket,output, setOutput }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
