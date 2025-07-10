import Editor from "@/components/editor";
import Output from "@/components/output";
import SideMenu from "@/components/sidemenu";

import {
  createFileRoute,
  useParams,
} from "@tanstack/react-router";

const CompilerPage = () => {
  const { lang } = useParams({ strict: false });

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

  return (
    <main className="h-screen grid grid-cols-[auto_1fr]">
      <SideMenu />
      <div className="grid h-screen md:grid-cols-2">
      {currentLang && (
        <Editor
          filename={`main.${currentLang?.fileExtension}`}
          codeExample={currentLang?.codeExample}
        />
      )}
      <Output />
      </div>
    </main>
  );
};

const Route = createFileRoute("/compiler/$lang")({
  component: CompilerPage,
});

export { Route };
