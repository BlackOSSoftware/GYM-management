"use client";

import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const saved = (localStorage.getItem("gym-theme") as ThemeMode) || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const next: ThemeMode = current === "light" ? "dark" : "light";
      localStorage.setItem("gym-theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  };

  return { theme, toggleTheme };
}
