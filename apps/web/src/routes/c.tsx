import Editor from "@/components/Editor";
import Output from "@/components/Output";
import { createFileRoute } from "@tanstack/react-router";

const CCompiler = () => {
  const codeExample = `#include<stdio.h>
  
int main() {
  printf("Hello, World!\\n");

  return 0;
}
`;

  return (
    <div className="h-screen grid md:grid-cols-2">
      <Editor filename="main.c" codeExample={codeExample} />
      <Output />
    </div>
  );
};

const Route = createFileRoute("/c")({
  component: CCompiler,
});

export { Route };
