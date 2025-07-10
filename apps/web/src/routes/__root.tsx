import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";

import "../index.css";

import { SocketProvider, ThemeProvider } from "@/context";

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "Compilerz",
      },
      {
        name: "Compilerz",
        content:
          "Compilerz is a online compiler with support for multiple languages",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  const isFetching = useRouterState({
    select: (s) => s.isLoading,
  });

  return (
    <ThemeProvider>
      <SocketProvider>
        <HeadContent />
        <div className="flex flex-col h-svh overflow-hidden">
          {isFetching ? <div>Hello, Loader</div> : <Outlet />}
        </div>
      </SocketProvider>
    </ThemeProvider>
  );
}
