import express from "express";

import cors from "cors";

import "dotenv/config";

import {Server as SocketServer} from 'socket.io';
import { setupSocket } from "./services/socket";


const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  })
);

app.use(express.json())

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const io = new SocketServer(server, {
  cors: {
    origin: process.env.ORIGIN || "http://localhost:3001",
    methods: ["GET", "POST"],
  },
})

setupSocket(io);