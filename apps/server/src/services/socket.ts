import { Socket, type Server } from "socket.io";
import dockerService from "./docker";
import { time } from "console";

class SocketService {
  private io: Server | null;
  private connections: Map<
    string,
    {
      socket: Socket;
      containerId: string | null;
      connectedAt: Date;
      outputBuffer?: string;
    }
  >;

  constructor() {
    this.io = null;
    this.connections = new Map();
  }

  private processTerminalData(socketId: string, rawData: string) {
    const connection = this.connections.get(socketId);
    if (!connection) return;

    if (!connection.outputBuffer) {
      connection.outputBuffer = "";
    }

    connection.outputBuffer += rawData;

    const lines = connection.outputBuffer.split("\n");
    const filteredLines = lines.filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed &&
        !trimmed.startsWith("./") &&
        !trimmed.startsWith("$ ") &&
        !trimmed.startsWith("# ") &&
        !trimmed.match(/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+:/)
      );
    });

    const finalOutput = filteredLines.map((line) => {
      return line.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
    });

    if (finalOutput.length > 0) {
      const actualOutput = finalOutput.join("\n");
      if (!actualOutput.includes("/app #")) {
        connection.socket.emit("terminal:output", finalOutput);
      }
    }

    const lastNewlineIndex = connection.outputBuffer.lastIndexOf("\n");
    if (lastNewlineIndex !== -1) {
      connection.outputBuffer = connection.outputBuffer.substring(
        lastNewlineIndex + 1,
      );
    }
  }

  private setupPtyConnection(socketId: string, containerId: string) {
    const connection = this.connections.get(socketId);
    if (!connection) return;

    const ptyProcess = dockerService.ptyProcesses.get(containerId);
    if (!ptyProcess) {
      console.log(`DOCKER: No pty process found for container: ${containerId}`);
      return;
    }

    const dataListener = (data: any) => {
      const dataStr = data.toString();

      const timeout = setTimeout(() => {
        this.processTerminalData(socketId, dataStr);
      }, 600);

      return () => clearTimeout(timeout);
    };

    ptyProcess.onData(dataListener);

    console.log(
      `SOCKET: Pty connection established for container: ${containerId}`,
    );
  }

  public init(io: Server) {
    this.io = io;

    io.on("connection", (socket: Socket) => {
      console.log("SOCKET: Client connected:", socket.id);

      this.connections.set(socket.id, {
        socket,
        containerId: null,
        connectedAt: new Date(),
      });

      socket.on(
        "set-container-id",
        ({ containerId }: { containerId: string }) => {
          console.log(containerId);
          const connection = this.connections.get(socket.id);
          
          if (connection) {
            this.connections.set(socket.id, {
              ...connection,
              containerId,
            });

            this.setupPtyConnection(socket.id, containerId);
          }
        },
      );

      socket.on("terminal:input", ({ command }: { command: string }) => {
        const ptyProcess = dockerService.ptyProcesses.get(
          this.connections.get(socket.id)?.containerId ?? "",
        );

        if (ptyProcess) {
          ptyProcess.write(`${command}\n`);
        }
      });

      socket.on("disconnect", async () => {
        console.log("SOCKET: Client disconnected:", socket.id);
        this.connections.delete(socket.id);
      });
    });
  }
}

const socketService = new SocketService();
export default socketService;
