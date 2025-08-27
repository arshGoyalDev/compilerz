import { Socket, type Server } from "socket.io";
import dockerService from "./docker";
import { time } from "console";
import Stream from "stream";

class SocketService {
  private io: Server | null;
  private connections: Map<
    string,
    {
      socket: Socket;
      sessionId: string | null;
      connectedAt: Date;
      stream: Stream.Duplex | null;
      outputBuffer?: string;
    }
  >;

  constructor() {
    this.io = null;
    this.connections = new Map();
  }

  public init(io: Server) {
    this.io = io;

    io.on("connection", (socket: Socket) => {
      console.log("SOCKET: Client connected:", socket.id);

      this.connections.set(socket.id, {
        socket,
        sessionId: null,
        connectedAt: new Date(),
        stream: null,
      });

      socket.on("set-session-id", ({ sessionId }: { sessionId: string }) => {
        console.log(sessionId);
        const connection = this.connections.get(socket.id);

        if (connection) {
          this.connections.set(socket.id, {
            ...connection,
            sessionId,
          });
        }
      });

      socket.on(
        "compile-and-run",
        async ({
          sessionId,
          command,
        }: {
          sessionId: string;
          command: string;
        }) => {
          const connection = this.connections.get(socket.id);
          const session = dockerService.sessions.get(
            connection?.sessionId || "",
          );

          if (!connection)
            return new Error(`No Connection Found: ${socket.id}`);
          if (!session) return new Error(`No Session Found: ${sessionId}`);

          const execInstance = await session.container.exec({
            Cmd: ["sh", "-c", command],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
          });

          const stream = await execInstance.start({
            Tty: true,
            stdin: true,
          });

          stream.setEncoding("utf8");

          if (connection)
            this.connections.set(socket.id, {
              ...connection,
              stream,
            });

          stream.on("data", (chunk) => {
            io.to(socket.id).emit("terminal:output", {
              chunk,
            });
            console.log("Output:", chunk);
          });

          stream.on("end", () => {
            io.to(socket.id).emit("execution:completed", {
              execComplete: true,
            });
            console.log("Execution Completed");
          });
        },
      );

      socket.on("terminal:input", ({ value }: { value: string }) => {
        const connection = this.connections.get(socket.id);

        if (!connection?.stream)
          return new Error(`No Stream Found: ${socket.id}`);

        const { stream } = connection;

        stream.write(value);
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
