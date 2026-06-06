import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RealtyGenius",
  description: "AI operating system for Malaysian property agents"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
