import { Info } from "lucide-react";
import InvestFooter from "../InvestFooter";
import InvestNav from "../InvestNav";
import OpportunityCard from "../OpportunityCard";
import RiskNotice from "../RiskNotice";
import { opportunities } from "../invest-data";

export default function InvestmentPropertiesPage() {
  return (
    <div className="inv-site">
      <InvestNav />
      <RiskNotice />
      <main>
        <header className="inv-page-header">
          <div className="inv-container"><span className="inv-eyebrow">Curated property research</span><h1>Explore investment opportunity previews.</h1><p>Compare indicative property values, rental scenarios, holding periods, operating costs and risk labels before registering non-binding interest.</p><div className="inv-filter-row" aria-label="Opportunity status"><span className="inv-filter-pill is-active">All previews</span><span className="inv-filter-pill">Open for interest</span><span className="inv-filter-pill">Coming soon</span><span className="inv-filter-pill">Waitlist</span></div></div>
        </header>
        <section className="inv-section">
          <div className="inv-container">
            <div className="inv-education-strip"><Info size={20} aria-hidden="true" /><p><strong>Illustrative inventory:</strong> images, prices, slots and projected figures below demonstrate the proposed product experience. RealityGenius is not currently accepting investment money or reserving ownership.</p></div>
            <div className="inv-opportunity-grid">{opportunities.map((opportunity) => <OpportunityCard opportunity={opportunity} key={opportunity.id} />)}</div>
          </div>
        </section>
      </main>
      <InvestFooter />
    </div>
  );
}
