import Docker from "dockerode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import tar from "tar-fs";
import type Stream from "stream";
import pty, { type IPty } from "node-pty";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DockerService {
  private docker: Docker;
  public containers: Map<
    string,
    {
      container: Docker.Container;
      lang: string;
      createdAt: Date;
    }
  >;
  public ptyProcesses: Map<string, IPty>;
  private tempDir: string;

  constructor() {
    this.docker = new Docker();
    this.containers = new Map();
    this.ptyProcesses = new Map();
    this.tempDir = path.join(__dirname, "../temp");
    this.ensureTempDir();
  }

  private ensureTempDir(): void {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  public async init(): Promise<void> {
    try {
      await this.docker.ping();
      console.log("DOCKER: Connection Success");
    } catch (error) {
      console.log("DOCKER: Connection Failed", error);
      throw error;
    }
  }

  public async createContainer(
    lang: string,
  ): Promise<{ containerId: string; lang: string }> {
    try {
      const containerId = uuidv4();

      const containerMap = new Map<string, string>([
        ["python", "python:3.11-alpine"],
        ["ts", "node-ts:24-alpine"],
        ['js', "node:24-alpine"],
        ["java", "alpine/java:21-jdk"],
        ["go", "golang:1.19-alpine"],
        ["rust", "rust:1.88-alpine"],
        ["ruby", "ruby:3.1-alpine"],
        ["c", "gcc:alpine"],
        ["cpp", "gcc:alpine"],
      ]);

      const imageName = containerMap.get(lang);

      await this.pullImage(imageName ?? "");

      const container = await this.docker.createContainer({
        Image: imageName,
        Cmd: ["tail", "-f", "/dev/null"],
        WorkingDir: "/app",
        AttachStdout: true,
        AttachStdin: true,
        AttachStderr: true,
        Tty: true,
        OpenStdin: true,
        StdinOnce: true,
        name: `compilerz-${containerId}`,
        HostConfig: {
          AutoRemove: true,
          Memory: 512 * 1024 * 1024,
          CpuQuota: 50000,
        },
      });

      await container.start();

      // Fix: Use the actual container name instead of 'container_name'
      const ptyProcess = pty.spawn(
        "docker",
        ["exec", "-it", `compilerz-${containerId}`, "/bin/sh"],
        {
          name: "xterm-color",
          cols: 80,
          rows: 24,
        },
      );

      this.ptyProcesses.set(containerId, ptyProcess);

      this.containers.set(containerId, {
        container,
        lang,
        createdAt: new Date(),
      });

      console.log(`DOCKER: Container created: ${containerId}`);
      return { containerId, lang };
    } catch (error) {
      throw error;
    }
  }

  private async pullImage(imageName: string): Promise<void> {
    try {
      const images = await this.docker.listImages();

      const imageExists = images.some(
        (img) => img.RepoTags && img.RepoTags.includes(imageName),
      );

      if (!imageExists) {
        console.log(`DOCKER: Pulling Image: ${imageName}`);

        await this.docker.pull(imageName);

        console.log(`DOCKER: Image Pulled Successfully: ${imageName}`);
      }
    } catch (error) {
      console.log(`DOCKER: Failed to pull image ${imageName}: ${error}`);
      throw error;
    }
  }

  private async createFile(
    containerId: string,
    filename: string,
    content: string,
  ) {
    try {
      const containerInfo = this.containers.get(containerId);

      if (!containerInfo) {
        throw new Error("DOCKER: Container not found");
      }

      const { container } = containerInfo;

      console.log(this.tempDir, filename);

      const tarPath = path.join(this.tempDir, `${containerId}-${filename}.tar`);
      const filePath = path.join(this.tempDir, filename);

      fs.writeFileSync(filePath, content);

      const tarStream = tar.pack(this.tempDir, {
        entries: [filename],
      });

      await container.putArchive(tarStream, { path: "/app" });

      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      throw error;
    }
  }

  private async executeCommand(containerId: string, command: string) {
    try {
      const containerInfo = this.containers.get(containerId);

      if (!containerInfo) {
        throw new Error("DOCKER: Container not found");
      }

      const { container } = containerInfo;

      const exec = await container.exec({
        Cmd: ["sh", "-c", command],
        AttachStdout: false,
        AttachStderr: false,
        AttachStdin: false,
        Tty: true,
      });

      await exec.start({ hijack: false, stdin: false });

      return exec.id;
    } catch (error) {
      console.log("DOCKER: command execution failed:", error);
      throw error;
    }
  }

  public async compileAndRun(
    containerId: string,
    filename: string,
    code: string,
  ) {
    try {
      const containerInfo = this.containers.get(containerId);

      if (!containerInfo) {
        return false;
      }

      const { lang } = containerInfo;

      // switch (lang.toLowerCase()) {
      //   case "python":
      return await this.createFile(containerId, filename, code);

      //   case "ts":
      //     return await this.createFile(containerId, filename, code);

      //   case "java":
      //     return await this.createFile(containerId, filename, code);

      //   case "go":
      //     return await this.createFile(containerId, filename, code);

      //   case "rust":
      //     return await this.createFile(containerId, filename, code);

      //   case "ruby":
      //     return await this.createFile(containerId, filename, code);

      //   case "c":
      //   case "cpp":
      //     return await this.createFile(containerId, filename, code);
      // }
    } catch (error) {
      console.log("DOCKER: Compile and run failed:", error);
      throw error;
    }
  }

  public async stopContainer(containerId: string) {
    try {
      const containerInfo = this.containers.get(containerId);

      if (!containerInfo)
        throw new Error(`DOCKER: container not found: ${containerId}`);

      await containerInfo.container.stop();

      this.containers.delete(containerId);

      console.log(`DOCKER: Container stopped and removed: ${containerId}`);

      return { containerStopped: true };
    } catch (error) {
      return { containerStopped: false, error: error as Error };
    }
  }
}

const dockerService = new DockerService();
export default dockerService;
