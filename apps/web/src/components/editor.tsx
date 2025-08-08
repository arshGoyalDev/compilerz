import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { useSocket, useTheme } from "@/context";

import { apiClient } from "@/lib/api-client";
import { COMPILE_AND_RUN_ROUTE } from "@/lib/constants";

import CodeMirror from "@uiw/react-codemirror";
import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";

import { cpp } from "@codemirror/lang-cpp";
import { javascript } from "@codemirror/lang-javascript";
import { go } from "@codemirror/lang-go";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { java } from "@codemirror/lang-java";

const darkTheme = createTheme({
  theme: "dark",
  settings: {
    background: "#0a0a0a", // neutral-950
    backgroundImage: "",
    foreground: "#d4d4d4", // neutral-300
    caret: "#f5f5f5", // neutral-100
    selection: "#52525226", // neutral-600 with transparency
    selectionMatch: "#52525226", // neutral-600 with transparency
    lineHighlight: "#1717171a", // neutral-900 with transparency
    gutterBackground: "#0a0a0a", // neutral-950
    gutterForeground: "#52525266", // neutral-600 with transparency
  },
  styles: [
    { tag: t.comment, color: "#737373" }, // neutral-500
    { tag: t.variableName, color: "#e5e5e5" }, // neutral-200
    { tag: [t.string, t.special(t.brace)], color: "#a3a3a3" }, // neutral-400
    { tag: t.number, color: "#d4d4d4" }, // neutral-300
    { tag: t.bool, color: "#d4d4d4" }, // neutral-300
    { tag: t.null, color: "#737373" }, // neutral-500
    { tag: t.keyword, color: "#f5f5f5" }, // neutral-100
    { tag: t.operator, color: "#a3a3a3" }, // neutral-400
    { tag: t.className, color: "#e5e5e5" }, // neutral-200
    { tag: t.definition(t.typeName), color: "#f5f5f5" }, // neutral-100
    { tag: t.typeName, color: "#d4d4d4" }, // neutral-300
    { tag: t.angleBracket, color: "#a3a3a3" }, // neutral-400
    { tag: t.tagName, color: "#e5e5e5" }, // neutral-200
    { tag: t.attributeName, color: "#a3a3a3" }, // neutral-400
  ],
});

const lightTheme = createTheme({
  theme: "light",
  settings: {
    background: "#fafafa", // neutral-50
    backgroundImage: "",
    foreground: "#404040", // neutral-700
    caret: "#171717", // neutral-900
    selection: "#a3a3a326", // neutral-400 with transparency
    selectionMatch: "#a3a3a326", // neutral-400 with transparency
    lineHighlight: "#f5f5f51a", // neutral-100 with transparency
    gutterBackground: "#fafafa", // neutral-50
    gutterForeground: "#a3a3a366", // neutral-400 with transparency
  },
  styles: [
    { tag: t.comment, color: "#737373" }, // neutral-500
    { tag: t.variableName, color: "#262626" }, // neutral-800
    { tag: [t.string, t.special(t.brace)], color: "#525252" }, // neutral-600
    { tag: t.number, color: "#404040" }, // neutral-700
    { tag: t.bool, color: "#404040" }, // neutral-700
    { tag: t.null, color: "#737373" }, // neutral-500
    { tag: t.keyword, color: "#171717" }, // neutral-900
    { tag: t.operator, color: "#525252" }, // neutral-600
    { tag: t.className, color: "#262626" }, // neutral-800
    { tag: t.definition(t.typeName), color: "#171717" }, // neutral-900
    { tag: t.typeName, color: "#404040" }, // neutral-700
    { tag: t.angleBracket, color: "#525252" }, // neutral-600
    { tag: t.tagName, color: "#262626" }, // neutral-800
    { tag: t.attributeName, color: "#525252" }, // neutral-600
  ],
});

const extensions = [cpp(), javascript(), java(), rust(), go(), python()];

const Editor = ({
  filename,
  codeExample,
  containerId,
  setFinalOutput,
}: {
  filename: string;
  codeExample: string;
  containerId: string | null;
  setFinalOutput: Dispatch<SetStateAction<string[]>>;
}) => {
  const { theme, setTheme } = useTheme();
  const socket = useSocket();

  const [code, setCode] = useState(codeExample);
  const [codeCopySuccess, setCodeCopySuccess] = useState(false);

  const handleChange = useCallback((val: string) => {
    setCode(val);
  }, []);

  const handleRunBtnClick = async () => {
    try {
      setFinalOutput([]);
      socket?.setOutput([]);

      await apiClient.post(COMPILE_AND_RUN_ROUTE, {
        containerId,
        code,
        filename,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);

    setCodeCopySuccess(true);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (codeCopySuccess) setCodeCopySuccess(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [codeCopySuccess]);

  return (
    <div className="flex flex-col bg-neutral-100 dark:bg-neutral-900 border-r-2 border-t-2 border-neutral-200 dark:border-neutral-800 overflow-auto">
      <div className="flex items-center">
        <div className="py-3 px-5 bg-neutral-50 dark:bg-neutral-950 border-r-2 border-neutral-200 dark:border-neutral-800">
          {filename}
        </div>
        <div className="flex justify-end gap-3 items-center w-full border-b-2 h-full border-neutral-200 dark:border-neutral-800">
          <button
            onClick={copyCode}
            className="p-2 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/70 rounded-sm transition-all "
          >
            <span className="stroke-black dark:stroke-white">
              {!codeCopySuccess ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 12.9V17.1C16 20.6 14.6 22 11.1 22H6.9C3.4 22 2 20.6 2 17.1V12.9C2 9.4 3.4 8 6.9 8H11.1C14.6 8 16 9.4 16 12.9Z"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 6.9V11.1C22 14.6 20.6 16 17.1 16H16V12.9C16 9.4 14.6 8 11.1 8H8V6.9C8 3.4 9.4 2 12.9 2H17.1C20.6 2 22 3.4 22 6.9Z"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22 11.1V6.9C22 3.4 20.6 2 17.1 2H12.9C9.4 2 8 3.4 8 6.9V8H11.1C14.6 8 16 9.4 16 12.9V16H17.1C20.6 16 22 14.6 22 11.1Z"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 17.1V12.9C16 9.4 14.6 8 11.1 8H6.9C3.4 8 2 9.4 2 12.9V17.1C2 20.6 3.4 22 6.9 22H11.1C14.6 22 16 20.6 16 17.1Z"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.08008 15L8.03008 16.95L11.9201 13.05"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          </button>
          <button
            onClick={handleRunBtnClick}
            className="cursor-pointer bg-neutral-950 dark:bg-white py-1 h-fit px-4 text-white dark:text-black mr-2"
          >
            Run
          </button>
        </div>
      </div>
      <div className="bg-neutral-50 dark:bg-neutral-950 flex-1 overflow-y-auto">
        <CodeMirror
          value={code}
          theme={theme === "dark" ? darkTheme : lightTheme}
          className="text-base"
          extensions={extensions}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default Editor;
