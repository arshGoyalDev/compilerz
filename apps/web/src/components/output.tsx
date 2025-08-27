import { useSocket } from "@/context";
import {
  useEffect,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from "react";

const Output = () => {
  const socket = useSocket();
  const [command, setCommand] = useState("");
  const [finalOutput, setFinalOutput] = useState<string[]>([])

  useEffect(() => {
    if (socket?.output) {
      setFinalOutput(socket.output);
    }
  }, [socket]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      socket?.socket?.emit("terminal:input", { value: `${command}\r` });
      setCommand("");
    }
  };

  return (
    <div className="flex flex-col overflow-auto bg-neutral-100 dark:bg-neutral-900 border-t-2 border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center h-12 border-b-2 justify-between border-neutral-200 dark:border-neutral-800">
        <div className="px-5">Output</div>
        <button
          onClick={() => {
            setFinalOutput([]);
            socket?.setOutput([]);
          }}
          className="cursor-pointer bg-neutral-950 dark:bg-white py-1 h-fit px-4 text-white dark:text-black mr-2"
        >
          Clear
        </button>
      </div>
      <div className="bg-neutral-50 overflow-y-auto flex-1 dark:bg-neutral-950 py-3 px-4">
        {finalOutput.map((line, index) => {
          return index === finalOutput.length - 1 && socket?.execRunning ? (
            <div key={index} className="flex w-full gap-2">
              <div className="text-nowrap">{line}</div>
              <input
                autoFocus
                type="text"
                className="w-full focus:outline-0 outline-0"
                onKeyDown={handleKeyDown}
                value={command}
                onChange={(e) => setCommand(e.target.value)}
              />
            </div>
          ) : (
            <div key={index}> {line}</div>
          );
        })}
      </div>
    </div>
  );
};

export default Output;
