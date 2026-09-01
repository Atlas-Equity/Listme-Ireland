"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 transition-all dark:text-gray-400 dark:hover:text-primary dark:hover:bg-zinc-800 rounded-md flex items-center justify-center relative w-10 h-10 overflow-hidden focus:outline-none"
      aria-label="Toggle theme"
    >
      <Sun className="absolute w-[1.3rem] h-[1.3rem] transition-all duration-500 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute w-[1.3rem] h-[1.3rem] transition-all duration-500 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
    </button>
  );
}
