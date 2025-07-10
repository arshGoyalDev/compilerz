import { RouterProvider, createRouter } from "@tanstack/react-router";

import ReactDOM from "react-dom/client";

import { routeTree } from "./routeTree.gen";


const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: () => <div>Hello, Loader</div>,
  context: {},
  });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
