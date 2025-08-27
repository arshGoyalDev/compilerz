import Docker from "dockerode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import tar from "tar-fs";
import Stream from "stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DockerService {
  public docker: Docker;
  public sessions: Map<
    string,
    {
      container: Docker.Container;
      lang: string;
      createdAt: Date;
    }
  >;
  private tempDir: string;

  constructor() {
    this.docker = new Docker();
    this.sessions = new Map();
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

  public async createSession(
    lang: string,
  ): Promise<{ sessionId: string; lang: string }> {
    try {
      const sessionId = uuidv4();

      const containerMap = new Map<string, string>([
        ["python", "python:3.11-alpine"],
        ["ts", "node-ts:24-alpine"],
        ["js", "node:24-alpine"],
        ["java", "alpine/java:21-jdk"],
        ["go", "golang:1.19-alpine"],
        ["rust", "rust:1.88-alpine"],
        ["ruby", "ruby:3.1-alpine"],
        ["c", "gcc:alpine"],
        ["cpp", "gcc:alpine"],
      ]);

      const imageName = containerMap.get(lang);

      await this.checkForImage(imageName ?? "");

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
        name: `compilerz-${sessionId}`,
        HostConfig: {
          AutoRemove: true,
          Memory: 512 * 1024 * 1024,
          CpuQuota: 50000,
          CpuShares: 512,
          NetworkMode: "none",
          ReadonlyRootfs: false,
          Tmpfs: {
            "/tmp": "rw,size=100m",
          },
          SecurityOpt: ["no-new-privileges"],
          CapDrop: ["ALL"],
          CapAdd: ["CHOWN", "SETGID", "SETUID"],
        },
      });

      await container.start();

      this.sessions.set(sessionId, {
        container,
        lang,
        createdAt: new Date(),
      });

      console.log(`DOCKER: Session created: ${sessionId}`);
      return { sessionId, lang };
    } catch (error) {
      throw error;
    }
  }

  private async checkForImage(imageName: string): Promise<void> {
    try {
      const images = await this.docker.listImages();

      const imageExists = images.some(
        (img) => img.RepoTags && img.RepoTags.includes(imageName),
      );

      if (imageExists) return;

      const buildImage =
        imageName === "gcc:alpine" || imageName === "node-ts:24-alpine";

      const projectRoot = path.resolve(__dirname, "../");

      let stream: NodeJS.ReadableStream | null = null;

      if (imageName === "gcc:alpine" || imageName === "node-ts:24-alpine") {
        console.log(`DOCKER: Building Image: ${imageName}`);

        const dockerfilePath = `dockerfile/${imageName === "gcc:alpine" ? "gcc" : "ts"}.Dockerfile`;

        stream = await this.docker.buildImage(
          {
            context: projectRoot,
            src: [dockerfilePath],
          },
          {
            t: imageName,
            dockerfile: dockerfilePath,
          },
        );
      }

      if (!buildImage) {
        console.log(`DOCKER: Pulling Image: ${imageName}`);
        stream = await this.docker.pull(imageName);
      }

      if (stream) {
        await new Promise((resolve, reject) => {
          this.docker.modem.followProgress(
            stream,
            (error, res) => {
              if (error) {
                if (buildImage)
                  console.error(
                    "DOCKER: Image Build failed:",
                    error,
                    imageName,
                  );
                else
                  console.error("DOCKER: Image Pull failed:", error, imageName);
                reject(error);
              } else {
                if (buildImage)
                  console.log(
                    `DOCKER: Image builded Successfully: ${imageName}`,
                  );
                else
                  console.log(
                    `DOCKER: Image pulled Successfully: ${imageName}`,
                  );

                resolve(res);
              }
            },
            (event) => {
              if (event.stream) {
                process.stdout.write(event.stream);
              }
            },
          );
        });
      }
    } catch (error) {
      console.log(`DOCKER: Failed to pull image ${imageName}: ${error}`);
      throw error;
    }
  }

  public async createFile(
    sessionId: string,
    filename: string,
    content: string,
  ) {
    try {
      const session = this.sessions.get(sessionId);

      if (!session) {
        throw new Error("DOCKER: Session not found");
      }

      const { container } = session;

      console.log(this.tempDir, filename);

      const tarPath = path.join(this.tempDir, `${sessionId}-${filename}.tar`);
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

  private async executeCommand(sessionId: string, command: string) {
    try {
      const session = this.sessions.get(sessionId);

      if (!session) {
        throw new Error("DOCKER: Session not found");
      }

      const { container } = session;

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

  public async stopSession(sessionId: string) {
    try {
      const session = this.sessions.get(sessionId);

      if (!session) throw new Error(`DOCKER: Session not found: ${sessionId}`);

      await session.container.stop();

      this.sessions.delete(sessionId);

      console.log(`DOCKER: Session stopped and removed: ${sessionId}`);

      return { sessionStopped: true };
    } catch (error) {
      return { sessionStopped: false, error: error as Error };
    }
  }
}

const dockerService = new DockerService();
export default dockerService;
