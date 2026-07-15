"use client";

import { useEffect } from "react";
import { syncNativeStatusBar } from "../../lib/capacitor/native";

function themeFromDom(): "light" | "dark" {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

/** Keeps Capacitor StatusBar in sync with data-theme (incl. login / bootstrap). */
export default function NativeShell() {
  useEffect(() => {
    void syncNativeStatusBar(themeFromDom());

    const observer = new MutationObserver(() => {
      void syncNativeStatusBar(themeFromDom());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
