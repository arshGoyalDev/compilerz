import { Socket, type Server } from "socket.io";
import dockerService from "./docker";

class SocketService {
  private io: Server | null;
  private connections: Map<
    string,
    {
      socket: Socket;
      containerId: string | null;
      connectedAt: Date;
      dataListener?: (data: any) => void;
      outputBuffer?: string; // Buffer to accumulate output
    }
  >;

  constructor() {
    this.io = null;
    this.connections = new Map();
  }
  
  private processTerminalData(socketId: string, rawData: string) {
    const connection = this.connections.get(socketId);
    if (!connection) return;

    // Initialize buffer if not exists
    if (!connection.outputBuffer) {
      connection.outputBuffer = '';
    }

    // Accumulate data
    connection.outputBuffer += rawData;

    // Method 1: Filter out command echoes and shell prompts
    const lines = connection.outputBuffer.split('\n');
    const filteredLines = lines.filter(line => {
      const trimmed = line.trim();
      // Skip empty lines, command echoes, and common shell prompts
      return trimmed &&
        !trimmed.startsWith('./') &&
        !trimmed.startsWith('$ ') &&
        !trimmed.startsWith('# ') &&
        !trimmed.match(/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+:/); // Skip user@host: prompts
    });

    if (filteredLines.length > 0) {
      const actualOutput = filteredLines.join('\n');
      console.log('Actual program output:', actualOutput);
      connection.socket.emit('program-output', actualOutput);
    }

    // Keep last incomplete line in buffer
    const lastNewlineIndex = connection.outputBuffer.lastIndexOf('\n');
    if (lastNewlineIndex !== -1) {
      connection.outputBuffer = connection.outputBuffer.substring(lastNewlineIndex + 1);
    }
  }


  private setupPtyConnection(socketId: string, containerId: string) {
    const connection = this.connections.get(socketId);
    if (!connection) return;

    const ptyProcess = dockerService.ptyProcesses.get(containerId);
    if (!ptyProcess) {
      console.log(`No pty process found for container: ${containerId}`);
      return;
    }

    // Remove existing listener if any
    if (connection.dataListener) {
      // Assuming there's a way to remove listeners - this depends on your pty implementation
      // ptyProcess.offData(connection.dataListener);
    }

    // Create new data listener
    // const dataListener = (data: any) => {
    //   console.log('Received data from pty:', data);
    //   connection.socket.emit('terminal-data', data);
    // };

    // // Set up the data listener
    // ptyProcess.onData(dataListener);
    
    
    const dataListener = (data: any) => {
      const dataStr = data.toString();
      console.log('Raw pty data:', JSON.stringify(dataStr)); // See exact data
      
      // Process the data to extract actual output
      this.processTerminalData(socketId, dataStr);
      
      // Also emit raw data for debugging
      connection.socket.emit('terminal-raw', dataStr);
    };

    ptyProcess.onData(dataListener);

    // Update connection with the listener reference
    this.connections.set(socketId, {
      ...connection,
      dataListener
    });

    console.log(`Pty connection established for container: ${containerId}`);
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
          const connection = this.connections.get(socket.id);
          if (connection) {
            this.connections.set(socket.id, {
              ...connection,
              containerId,
            });
            
            // NOW set up the pty connection after containerId is available
            this.setupPtyConnection(socket.id, containerId);
          }
          
          console.log('Updated connection:', this.connections.get(socket.id));
        },
      );

      socket.on("disconnect", async () => {
        console.log("SOCKET: Client disconnected:", socket.id);
        
        const connection = this.connections.get(socket.id);
        if (connection?.dataListener && connection.containerId) {
          const ptyProcess = dockerService.ptyProcesses.get(connection.containerId);
          // Clean up listener if your pty implementation supports it
          // ptyProcess?.offData(connection.dataListener);
        }
        
        this.connections.delete(socket.id);
      });
    });
  }
}

const socketService = new SocketService();
export default socketService;