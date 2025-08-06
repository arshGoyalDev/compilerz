import { useSocket } from "@/context";
import React, { useEffect, type Dispatch, type SetStateAction } from "react";

const Output = ({
  finalOutput,
  setFinalOutput,
}: {
  finalOutput: string[];
  setFinalOutput: Dispatch<SetStateAction<string[]>>;
}) => {
  const socket = useSocket();

  useEffect(() => {
    if (socket?.output) {
      setFinalOutput(socket?.output);
    }
  }, [socket]);

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
          return line.includes("Program Successfully Completed") ? (
            <div key={index} className="flex items-center w-full gap-3">
              <div className="w-full rounded-full h-1 bg-neutral-200 dark:bg-neutral-800"></div>
              <div className="text-nowrap tracking-widest text-xl font-medium my-4 text-neutral-400 dark:text-neutral-700">
                {line}
              </div>
              <div className="w-full rounded-full h-1 bg-neutral-200 dark:bg-neutral-800"></div>
            </div>
          ) : (
            <div key={index}>{line}</div>
          );
        })}
      </div>
    </div>
  );
};

export default Output;
