import type { Metadata, Viewport } from "next";
import Script from "next/script";
import NativeShell from "./components/capacitor/NativeShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gym Management",
  description: "Complete gym management software"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" }
  ]
};

/** Runs before paint so saved theme applies without a flash. */
const THEME_BOOTSTRAP = `(function(){try{var t=localStorage.getItem('gym-theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="gym-theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        <NativeShell />
        {children}
      </body>
    </html>
  );
}
