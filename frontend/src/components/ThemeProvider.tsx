"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  if (typeof window !== "undefined") {
    const origError = console.error;
    console.error = (...args: any[]) => {
      if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) return;
      origError.apply(console, args);
    };
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
