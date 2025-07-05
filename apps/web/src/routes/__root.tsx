import Header from "@/components/header";
import Loader from "@/components/loader";

import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import "../index.css";

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
    <>
      <HeadContent />
      <div className="bg-neutral-950 text-white flex flex-col h-svh overflow-hidden">
        {isFetching ? <Loader /> : <Outlet />}
      </div>
      <TanStackRouterDevtools position="bottom-left" />
    </>
  );
}
