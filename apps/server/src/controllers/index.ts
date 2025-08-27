import type { Response, Request } from "express";

import dockerService from "@/services/docker";

const startSession = async (req: Request, res: Response) => {
  try {
    const { lang }: { lang: string } = req.body;
    if (!lang) throw new Error("No Language provided");

    const session = await dockerService.createSession(lang);

    res.status(201).json({ session });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const createFile = async (req: Request, res: Response) => {
  try {
    const {
      filename,
      code,
      sessionId,
    }: { filename: string; code: string; sessionId: string } = req.body;

    if (!sessionId) throw new Error("No Session Id Provided");
    if (!filename) throw new Error("No Filename Provided");
    if (!code) throw new Error("No Code Provided");

    await dockerService.createFile(sessionId, filename, code);

    const command = getRunCommand(filename);

    res.status(200).json({
      command,
    });

  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

const getRunCommand = (filename: string) => {
  let command: string;

  switch (filename.split(".").at(-1)) {
    case "js":
      command = `node ${filename}`;
      break;

    case "rs":
      command = `rustc --error-format=short ${filename} && ./${filename.split(".")[0]}`;
      break;

    case "py":
      command = `python ${filename}`;
      break;

    case "ts":
      command = `tsc ${filename} && node ${filename.replace(".ts", ".js")}`;
      break;

    case "js":
      command = `node ${filename}`;
      break;

    case "java":
      command = `javac ${filename} && java ${filename.replace(".java", "")}`;
      break;

    case "rb":
      command = `ruby ${filename}`;
      break;

    case "go":
      command = `go run ${filename}`;
      break;

    case "c":
      command = `gcc -o ${filename.split(".")[0]}.out ${filename} && ./${filename.split(".")[0]}.out`;
      break;

    case "cpp":
      command = `g++ -o ${filename.split(".")[0]} ${filename} && ./${filename.split(".")[0]}`;
      break;

    default:
      command = "";
  }

  return command;
};

const stopSession = async (req: Request, res: Response) => {
  try {
    const { sessionId }: { sessionId: string } = req.body;

    if (!sessionId) throw new Error("No Session Id provided");

    const { sessionStopped, error } =
      await dockerService.stopSession(sessionId);

    if (error) {
      throw error;
    }

    res.status(200).json({ sessionStopped });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export { startSession, createFile, stopSession };
