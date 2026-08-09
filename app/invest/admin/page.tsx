import type { Metadata } from "next";
import InvestmentAdminConsole from "../InvestmentAdminConsole";

export const metadata: Metadata = { title: "Investment Operations | RealityGenius Admin", robots: { index: false, follow: false } };

export default function InvestmentAdminPage() {
  return <main className="inv-site inv-admin-shell"><InvestmentAdminConsole /></main>;
}
