import { useTheme } from "@/context";
import { Link, useLocation } from "@tanstack/react-router";

import { useState } from "react";

const SideMenu = () => {
  const location = useLocation();
  const { theme } = useTheme();

  const [menuCollapsed, setMenuCollapsed] = useState(true);

  const links = [
    { to: "c", label: "C" },
    { to: "cpp", label: "C++" },
    { to: "python", label: "Python" },
    { to: "rust", label: "Rust" },
    { to: "ts", label: "TypeScript" },
    { to: "js", label: "JavaScript" },
    { to: "go", label: "Go" },
    { to: "java", label: "Java" },
    { to: "ruby", label: "Ruby" },
  ];

  return (
    <div
      className={`${menuCollapsed ? "w-16 px-2" : "w-64 px-3"} flex flex-col justify-between py-4 bg-neutral-100 dark:bg-neutral-900/40 border-r-2 border-neutral-200 dark:border-neutral-900 transition-all`}
    >
      <div className="flex flex-col">
        <div
          className={`cursor-default flex items-center gap-3 px-2 ${menuCollapsed && "justify-center"}`}
        >
          <img
            src="/compilerz.svg"
            alt="compilerz"
            className={`w-6 h-6 ${theme !== "dark" && "invert-100"}`}
          />
          {!menuCollapsed && (
            <span className="font-extralight tracking-widest text-xl">
              Compilerz
            </span>
          )}
        </div>

        <div className="flex flex-col mt-6 gap-3">
          {links.map((link) => (
            <Link
              key={link.to}
              to={`/compiler/$lang`}
              params={{ lang: link.to }}
              className={`py-2 px-2 flex items-center ${menuCollapsed && "justify-center"}  ${location.pathname.split("/").at(-1) === link.to && "bg-neutral-200 dark:bg-white"} gap-3`}
            >
              <img
                src={`/${link.to}.svg`}
                alt={link.label}
                className="w-6 h-6"
              />
              {!menuCollapsed && (
                <span
                  className={`${location.pathname.split("/").at(-1) === link.to && "text-black"}`}
                >
                  {link.label}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
      <button
        onClick={() => {
          menuCollapsed ? setMenuCollapsed(false) : setMenuCollapsed(true);
        }}
        className={`cursor-pointer flex items-center gap-3 ${menuCollapsed && "justify-center"} px-2`}
      >
        <span
          className={`${theme === "dark" ? "stroke-white" : "stroke-black"} ${!menuCollapsed && "rotate-180"}`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.6801 14.62L14.2401 12.06L11.6801 9.5"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 12.0601H14.17"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 4C16.42 4 20 7 20 12C20 17 16.42 20 12 20"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {!menuCollapsed && <span>Collapse</span>}
      </button>
    </div>
  );
};

export default SideMenu;
