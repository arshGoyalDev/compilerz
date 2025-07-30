import { Router } from "express";

import { compileAndRun, startContainer, stopContainer } from "@/controllers";

const routes: Router = Router();

routes.post("/start-container", startContainer);
routes.post("/stop-container", stopContainer);
routes.post("/compile-and-run", compileAndRun);

export default routes;