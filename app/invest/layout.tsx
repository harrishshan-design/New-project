import type { Metadata } from "next";
import "./invest.css";

export const metadata: Metadata = {
  title: "Property Investment Preview | RealityGenius Malaysia",
  description: "Explore illustrative Malaysian property investment scenarios, transparent assumptions and a no-payment interest waitlist.",
  alternates: { canonical: "/invest" },
  robots: { index: true, follow: true }
};

export default function InvestLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
