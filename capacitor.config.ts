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
      launchShowDuration: 1800,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: "#0f172a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER",
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false
    },
    StatusBar: {
      overlaysWebView: false,
      style: "DARK",
      backgroundColor: "#161b22"
    }
  }
};

export default config;
