import express from "express";
import cors from "cors";
import "dotenv/config";

import routes from "./routers";

import { Server as SocketServer } from 'socket.io';
import socketService from "./services/socket";

import dockerService from "./services/docker";

const app = express();

app.use(
  cors({
    origin: process.env.ORIGIN,
    methods: ["GET", "POST"],
  })
);

app.use(express.json())

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.use('/api', routes);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

dockerService.init();

const io = new SocketServer(server, {
  cors: {
    origin: process.env.ORIGIN || "http://localhost:3001",
    methods: ["GET", "POST"],
  },
})

socketService.init(io);
