"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { syncNativeStatusBar } from "../../lib/capacitor/native";

function themeFromDom(): "light" | "dark" {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

/** Keeps Capacitor StatusBar in sync with data-theme (incl. login / bootstrap). */
export default function NativeShell() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    void (async () => {
      await syncNativeStatusBar(themeFromDom());
      try {
        await SplashScreen.hide({ fadeOutDuration: 250 });
      } catch {
        /* already hidden */
      }
    })();

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
