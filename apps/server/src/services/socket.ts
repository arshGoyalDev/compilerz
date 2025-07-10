import type { Server, Socket } from "socket.io";

const setupSocket = (io: Server) => {
  const disconnect = async (socket: Socket) => {
    console.log(`Socket disconnected: ${socket.id}`);
  };

  io.on("connection", async (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("disconnect", () => disconnect(socket));
  });
};

export { setupSocket };
