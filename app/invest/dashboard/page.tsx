import { Info } from "lucide-react";
import InvestFooter from "../InvestFooter";
import InvestNav from "../InvestNav";
import RiskNotice from "../RiskNotice";
import { formatRinggit } from "../invest-data";

const demoHoldings = [
  { property: "Double-Storey House, Taman Kim Chuan", invested: 50000, current: 52100, distribution: 1520, next: "Illustrative Q4", exit: "5-year review" },
  { property: "Subang Family Courtyard", invested: 25000, current: 25350, distribution: 630, next: "Illustrative Q4", exit: "5-year review" }
];

export default function InvestmentDashboardPreviewPage() {
  return (
    <div className="inv-site">
      <InvestNav />
      <RiskNotice />
      <main>
        <header className="inv-page-header"><div className="inv-container"><span className="inv-eyebrow">Portfolio product preview</span><h1>Your property portfolio, clearly explained. <span className="inv-demo-label">Demo data</span></h1><p>This dashboard demonstrates the reporting experience planned for a future approved product. It is not connected to real holdings, transactions or distributions.</p></div></header>
        <section className="inv-section">
          <div className="inv-container">
            <div className="inv-education-strip"><Info size={20} /><p>Every number below is synthetic demo data. RealityGenius currently holds no property or money on behalf of this example investor.</p></div>
            <div className="inv-dashboard-grid">
              <div className="inv-dashboard-metric"><span>Total invested</span><strong>{formatRinggit(75000)}</strong></div>
              <div className="inv-dashboard-metric"><span>Illustrative current value</span><strong>{formatRinggit(77450)}</strong></div>
              <div className="inv-dashboard-metric"><span>Illustrative distributions</span><strong>{formatRinggit(2150)}</strong></div>
              <div className="inv-dashboard-metric"><span>Weighted occupancy</span><strong>91%</strong></div>
              <div className="inv-dashboard-metric"><span>Next reporting date</span><strong>30 Sep</strong></div>
              <div className="inv-dashboard-metric"><span>Documents ready</span><strong>0 / 8</strong></div>
              <div className="inv-dashboard-metric"><span>Exit requests</span><strong>None</strong></div>
              <div className="inv-dashboard-metric"><span>Cash accepted</span><strong>RM 0</strong></div>
            </div>
            <div className="inv-portfolio-table-wrap">
              <table className="inv-portfolio-table"><thead><tr><th>Property</th><th>Amount</th><th>Current value</th><th>Distributions</th><th>Next report</th><th>Exit window</th></tr></thead><tbody>{demoHoldings.map((holding) => <tr key={holding.property}><td><strong>{holding.property}</strong></td><td>{formatRinggit(holding.invested)}</td><td>{formatRinggit(holding.current)}</td><td>{formatRinggit(holding.distribution)}</td><td>{holding.next}</td><td>{holding.exit}</td></tr>)}</tbody></table>
            </div>
          </div>
        </section>
      </main>
      <InvestFooter />
    </div>
  );
}
