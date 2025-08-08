import { createFileRoute, Link } from "@tanstack/react-router";

const HomePage = () => {
  const links = [
    { to: "c", label: "C", version: "gcc version 13.2.1" },
    { to: "cpp", label: "C++", version: "gcc version 13.2.1" },
    { to: "python", label: "Python", version: "python v3.11.13" },
    { to: "rust", label: "Rust", version: "rustc v1.70.0" },
    { to: "js", label: "JavaScript", version: "node v24.5.0" },
    { to: "ts", label: "TypeScript", version: "node v24.5.0 & tsc v5.9.2" },
    { to: "go", label: "Go", version: "go v1.19.13" },
    { to: "java", label: "Java", version: "javac 21.0.4" },
    { to: "ruby", label: "Ruby", version: "ruby 3.1.7p261" },
  ];

  return (
    <main className="flex flex-col items-center py-20 overflow-auto">
      <h1 className="font-extralight text-5xl tracking-widest">Compilerz</h1>

      <div className="grid lg:grid-cols-3 gap-4 mt-20">
        {links.map((link) => (
          <Link
            key={link.to}
            to={`/compiler/$lang`}
            params={{ lang: link.to }}
            className="group lang-card w-[90vw] max-w-[300px] bg-neutral-100 dark:bg-neutral-900/40 border-2  border-neutral-100 hover:border-neutral-300 dark:border-neutral-900 dark:hover:border-neutral-700 transition-all"
          >
            <div className="aspect-video grid place-content-center">
              <img
                src={`${link.to}.svg`}
                alt={link.label}
                className="w-20 h-20"
              />
            </div>
            {/* <div></div> */}
            <div className="flex flex-col items-center group-hover:bg-neutral-300 dark:group-hover:bg-neutral-700 transition-all py-2 bg-white dark:bg-neutral-950">
              <span className="text-lg font-semibold">
                
              {link.label}
              </span>
              <span className="text-md opacity-70">{ link.version}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
};

const Route = createFileRoute("/")({
  component: HomePage,
});

export { Route };
