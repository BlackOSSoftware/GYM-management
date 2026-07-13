"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
    </button>
  );
}
