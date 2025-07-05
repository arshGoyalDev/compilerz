import { useLocation } from "@tanstack/react-router";

const Header = () => {
  const location = useLocation();

  const links = [
    { to: "/c", label: "C" },
    { to: "/python", label: "Python" },
    { to: "/rust", label: "Rust" },
    { to: "/java", label: "Java" },
    { to: "/js", label: "JavaScript" },
    { to: "/ts", label: "TypeScript" },
  ];

  const currentLink = links.find(link => link.to === location.pathname);

  return (
    <div className="flex flex-row items-center justify-between px-5 py-4">
      <div>
        <h2 className="text-2xl font-medium tracking-wider mb-2">Compilerz</h2>
        {currentLink && (
          <div>
            <h3 className="text-lg font-extralight tracking-widest">Online {currentLink.label} Compiler</h3>

          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
