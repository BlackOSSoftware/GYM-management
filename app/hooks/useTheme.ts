"use client";

import { useCallback, useEffect, useState } from "react";
import { syncNativeStatusBar } from "../lib/capacitor/native";

export type ThemeMode = "light" | "dark";

function readStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem("gym-theme");
    return saved === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
  void syncNativeStatusBar(mode);
  try {
    localStorage.setItem("gym-theme", mode);
  } catch {
    /* ignore quota / private mode */
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const saved = readStoredTheme();
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: ThemeMode = current === "light" ? "dark" : "light";
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
