import type { CapacitorConfig } from "@capacitor/cli";

const LIVE_URL = "https://gym-management-swart-rho.vercel.app";

const config: CapacitorConfig = {
  appId: "com.gymmanagement.app",
  appName: "Gym Management",
  webDir: "www",
  server: {
    url: LIVE_URL,
    cleartext: false,
    androidScheme: "https",
    allowNavigation: [
      "gym-management-swart-rho.vercel.app",
      "*.vercel.app"
    ]
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#0f172a"
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#0f172a",
      showSpinner: false
    },
    StatusBar: {
      // Light = dark icons for light theme (default app theme)
      style: "LIGHT",
      backgroundColor: "#f4f7fb"
    }
  }
};

export default config;
