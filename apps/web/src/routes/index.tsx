import { createFileRoute, Link } from "@tanstack/react-router";

const HomeComponent = () => {
  const links = [
    { to: "/c", label: "C" },
    { to: "/python", label: "Python" },
    { to: "/rust", label: "Rust" },
    { to: "/java", label: "Java" },
    { to: "/js", label: "JavaScript" },
    { to: "/ts", label: "TypeScript" },
  ];

  return (
    <div className="px-5 py-2">
      <h1 className="font-medium text-4xl">Compilers</h1>

      <div className="flex flex-col gap-2 mt-5">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="py-2 w-full max-w-[240px] px-4 text-lg rounded-md border-2 border-neutral-900 bg-neutral-900/40"
          >
            {link.label} <span className="text-neutral-500">Compiler</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const Route = createFileRoute("/")({
  component: HomeComponent,
});

export { Route };
