const HOST = import.meta.env.VITE_SERVER_URL;

const START_CONTAINER_ROUTE = "api/start-container";
const STOP_CONTAINER_ROUTE = "api/stop-container";
const COMPILE_AND_RUN_ROUTE = "api/compile-and-run";

export {
  HOST,
  START_CONTAINER_ROUTE,
  STOP_CONTAINER_ROUTE,
  COMPILE_AND_RUN_ROUTE,
};
