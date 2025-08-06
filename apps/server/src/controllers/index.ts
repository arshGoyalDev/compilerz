import type { Response, Request } from "express";

import dockerService from "@/services/docker";

const startContainer = async (req: Request, res: Response) => {
  try {
    const { lang }: { lang: string } = req.body;
    if (!lang) throw new Error("No Language provided");

    const containerInfo = await dockerService.createContainer(lang);

    res.status(201).json({ containerInfo });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const compileAndRun = async (req: Request, res: Response) => {
  try {
    const {
      filename,
      code,
      containerId,
    }: { filename: string; code: string; containerId: string } = req.body;

    if (!containerId) throw new Error("No Container Id Provided");
    if (!filename) throw new Error("No Filename Provided");
    if (!code) throw new Error("No Code Provided");

    await dockerService.compileAndRun(containerId, filename, code);

    const ptyProcess = dockerService.ptyProcesses.get(containerId);

    const command = getRunCommand(filename);

    console.log(command);

    ptyProcess?.write(`${command}\n`);

    res.status(200).json({ success: true });
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
      command = `gcc -o ${filename.split(".")[0]} ${filename} && ./${filename.split(".")[0]}`;
      break;

    case "cpp":
      command = `g++ -o ${filename.split(".")[0]} ${filename} && ./${filename.split(".")[0]}`;
      break;

    default:
      command = "";
  }

  return command;
};

const stopContainer = async (req: Request, res: Response) => {
  try {
    const { containerId }: { containerId: string } = req.body;

    if (!containerId) throw new Error("No Container Id provided");

    const { containerStopped, error } =
      await dockerService.stopContainer(containerId);

    if (error) {
      throw error;
    }

    res.status(200).json({ containerStopped });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export { startContainer, compileAndRun, stopContainer };
