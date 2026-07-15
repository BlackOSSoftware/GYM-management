import type { NextConfig } from "next";

/**
 * Live web app (also loaded by Capacitor Android/iOS via server.url):
 * https://gym-management-swart-rho.vercel.app
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow Capacitor WebView / mobile app origins when calling this deployment
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Gym-App",
            value: "capacitor-ready"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
