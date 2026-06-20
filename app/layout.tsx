import type { Metadata } from "next";
import "./globals.css";
import "./polish.css";

export const metadata: Metadata = {
  title: "Gym Management",
  description: "Complete gym management software"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
