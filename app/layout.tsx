import type { Metadata } from "next";
import "./globals.css";
import "./polish.css";
import "./theme.css";

export const metadata: Metadata = {
  title: "Gym Management",
  description: "Complete gym management software"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('gym-theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
