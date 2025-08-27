import {
  createContext,
  useContext,
  type ReactNode,
  useRef,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  output: string[];
  setOutput: Dispatch<SetStateAction<string[]>>;
  execRunning: boolean;
  setExecRunning: Dispatch<SetStateAction<boolean>>;
}

const SocketContext = createContext<SocketContextType | null>(null);

const useSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [execRunning, setExecRunning] = useState(false);

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_SERVER_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketInstance.on("terminal:output", ({ chunk }: { chunk: string }) => {
      const array = chunk.split("\r\n");
      if (array.at(-1) === '') array.pop();
      setOutput((prev) => [...prev, ...array]);
    });

    socketInstance.on("execution:completed", ({ execComplete }) => {
      console.log(`Execution Completed: ${execComplete}`);
      setExecRunning(false);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{ socket, output, setOutput, execRunning, setExecRunning }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
