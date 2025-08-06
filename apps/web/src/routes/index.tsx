import { createFileRoute, Link } from "@tanstack/react-router";

const HomePage = () => {
  const links = [
    { to: "c", label: "C" },
    { to: "cpp", label: "C++" },
    { to: "python", label: "Python" },
    { to: "rust", label: "Rust" },
    { to: "js", label: "JavaScript" },
    { to: "ts", label: "TypeScript" },
    { to: "go", label: "Go" },
    { to: "java", label: "Java" },
    { to: "ruby", label: "Ruby" },
  ];

  return (
    <main className="flex flex-col items-center py-20">
      <h1 className="font-extralight text-5xl tracking-widest">Compilerz</h1>

      <div className="grid md:grid-cols-2 gap-4 mt-20">
        {links.map((link) => (
          <Link
            key={link.to}
            to={`/compiler/$lang`}
            params={{ lang: link.to }}
            className="w-[90vw] max-w-[300px] py-3 px-4 flex items-center gap-3 bg-neutral-100 dark:bg-neutral-900/40 border-2 border-neutral-300 dark:border-neutral-900 hover:border-neutral-700 transition-all"
          >
            <img src={`${link.to}.svg`} alt={link.label} className="w-6 h-6" />
            <span className="text-lg font-semibold">{link.label}</span>
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
