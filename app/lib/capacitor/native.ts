import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";

export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

/** Sync Android/iOS status bar with app light/dark theme. */
export async function syncNativeStatusBar(theme: "light" | "dark") {
  if (!isNativeApp()) return;
  try {
    // Keep system bar outside the WebView so time/signal stay visible
    await StatusBar.setOverlaysWebView({ overlay: false });
    if (theme === "light") {
      await StatusBar.setBackgroundColor({ color: "#f4f7fb" });
      // Style.Light = dark icons (for light backgrounds)
      await StatusBar.setStyle({ style: Style.Light });
    } else {
      await StatusBar.setBackgroundColor({ color: "#0f172a" });
      // Style.Dark = light icons (for dark backgrounds)
      await StatusBar.setStyle({ style: Style.Dark });
    }
  } catch {
    /* web / unsupported */
  }
}

export async function exitNativeApp() {
  if (!isNativeApp()) return;
  try {
    await App.exitApp();
  } catch {
    /* ignore */
  }
}
