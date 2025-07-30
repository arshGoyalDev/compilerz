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

    ptyProcess?.write(`./${filename.split(".")[0]}\n`);

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
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
