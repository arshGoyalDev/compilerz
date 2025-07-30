import Editor from "@/components/editor";
import LoadingScreen from "@/components/loading-screen";
import Terminal from "@/components/terminal";
import SideMenu from "@/components/sidemenu";

import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { START_CONTAINER_ROUTE, STOP_CONTAINER_ROUTE } from "@/lib/constants";
import { useSocket } from "@/context";

const CompilerPage = () => {
  const { lang } = useParams({ strict: false });
  const socket = useSocket();
  const [containerId, setContainerId] = useState<string | null>(null);

  const [loadingCompiler, setLoadingCompiler] = useState(true);

  const langSpecific = [
    {
      lang: "c",
      fileExtension: "c",
      codeExample: `#include<stdio.h>

int main() {
  printf("Hello, World!\\n");

  return 0;
}`,
    },
    {
      lang: "cpp",
      fileExtension: "cpp",
      codeExample: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;

    return 0;
}`,
    },
    {
      lang: "rust",
      fileExtension: "rs",
      codeExample: `fn main() {
    println!("Hello, World!");
}`,
    },
    {
      lang: "js",
      fileExtension: "js",
      codeExample: `console.log("Hello, World!");`,
    },
    {
      lang: "ts",
      fileExtension: "ts",
      codeExample: `console.log("Hello, World!");`,
    },
    {
      lang: "go",
      fileExtension: "go",
      codeExample: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
    },
    {
      lang: "ruby",
      fileExtension: "rb",
      codeExample: `puts "Hello, World!"`,
    },
    {
      lang: "python",
      fileExtension: "py",
      codeExample: `print("Hello, World!")`,
    },
    {
      lang: "java",
      fileExtension: "java",
      codeExample: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    },
  ];

  const currentLang = langSpecific.find((item) => item.lang === lang);

  useEffect(() => {
    let cId: string;

    const startContainer = async () => {
      try {
        const response = await apiClient.post(START_CONTAINER_ROUTE, {
          lang: currentLang?.lang ?? "",
        });

        console.log(response);

        if (response.status === 201) {
          cId = response.data.containerInfo.containerId;
          setContainerId(cId);
          setLoadingCompiler(false);
        }

        socket?.socket?.emit("set-container-id", {
          containerId: cId,
        });
      } catch (error) {
        console.log(error);
      }
    };

    startContainer();

    return () => {
      const stopContainer = async () => {
        try {
          const response = await apiClient.post(STOP_CONTAINER_ROUTE, {
            containerId: cId,
          });

          if (response.status === 200) {
            setContainerId(null);
            setLoadingCompiler(false);

            socket?.socket?.emit("set-container-id", {
              containerId: null,
            });
          }
        } catch (error) {
          console.log(error);
        }
      };

      stopContainer();
    };
  }, []);

  useEffect(() => {
    console.log(containerId);
  }, [containerId]);

  return (
    <main className="h-screen grid grid-cols-[auto_1fr]">
      <SideMenu />

      <div className="relative grid h-screen md:grid-cols-2">
        {loadingCompiler ? (
          <LoadingScreen />
        ) : (
          <>
            {currentLang && (
              <Editor
                filename={`main.${currentLang?.fileExtension}`}
                codeExample={currentLang?.codeExample}
                containerId={containerId}
              />
            )}
            <Terminal />
          </>
        )}
      </div>
    </main>
  );
};

const Route = createFileRoute("/compiler/$lang")({
  component: CompilerPage,
});

export { Route };
