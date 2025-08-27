import { Router } from "express";

import { createFile, startSession, stopSession } from "@/controllers";

const routes: Router = Router();

routes.post("/start-session", startSession);
routes.post("/stop-session", stopSession);
routes.post("/create-file", createFile);

export default routes;