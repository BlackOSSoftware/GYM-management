"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { exitNativeApp, isNativeApp } from "../lib/capacitor/native";

type Options = {
  /** Highest priority: close sheet / modal / sidebar */
  onCloseOverlay?: () => boolean;
  /** If true, back exits the app (e.g. dashboard or login root) */
  isRoot?: boolean;
  /** Navigate to parent (usually dashboard) when not root */
  onGoBack?: () => void;
};

/**
 * Android hardware/gesture back for Capacitor WebView.
 * Order: close overlay → go to parent → exit app on root.
 */
export function useCapacitorBack({ onCloseOverlay, isRoot, onGoBack }: Options) {
  useEffect(() => {
    if (!isNativeApp()) return;

    const handle = App.addListener("backButton", () => {
      if (onCloseOverlay?.()) return;
      if (!isRoot && onGoBack) {
        onGoBack();
        return;
      }
      void exitNativeApp();
    });

    return () => {
      void handle.then((listener) => listener.remove());
    };
  }, [onCloseOverlay, isRoot, onGoBack]);
}
