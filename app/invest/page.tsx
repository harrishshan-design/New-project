import { BarChart3, DoorOpen, FileCheck2, LockKeyhole, Scale, Search, ShieldCheck, Users, Wallet } from "lucide-react";
import InvestFooter from "./InvestFooter";
import InvestNav from "./InvestNav";
import OpportunityCard from "./OpportunityCard";
import RiskNotice from "./RiskNotice";
import { opportunities } from "./invest-data";

const steps = [
  { icon: Search, title: "Discover", body: "Browse curated Malaysian property concepts with location, tenure, operating and risk context." },
  { icon: BarChart3, title: "Analyse", body: "Compare rental, expense, occupancy and valuation scenarios before sharing any personal details." },
  { icon: Users, title: "Join", body: "Register non-binding interest in an indicative allocation. No payment or ownership is created." },
  { icon: Wallet, title: "Earn", body: "If a future structure is approved and launched, rental distributions would follow documented ownership and costs." },
  { icon: DoorOpen, title: "Exit", body: "A sale or transfer would follow the legal agreement, market conditions and available liquidity." }
];

const principles = [
  { icon: ShieldCheck, title: "No invented certainty", body: "Returns are presented as target or illustrative scenarios, never guaranteed outcomes." },
  { icon: FileCheck2, title: "Documents before decisions", body: "Future opportunities would require ownership, valuation, inspection, legal, fee and risk documents." },
  { icon: Scale, title: "Regulatory approval first", body: "Browse, simulate and register interest only until the appropriate Malaysian legal and regulatory path is confirmed." },
  { icon: LockKeyhole, title: "No money accepted", body: "The current experience has no checkout, deposit, reservation payment or wallet connection." }
];

export default function InvestLandingPage() {
  return (
    <div className="inv-site">
      <InvestNav />
      <RiskNotice />
      <main>
        <section className="inv-hero">
          <div className="inv-hero-content">
            <span className="inv-eyebrow">RealityGenius Invest preview</span>
            <h1>Own property from a fraction.</h1>
            <p className="inv-hero-lead">Explore how shared property ownership could make carefully selected Malaysian real estate more accessible, with transparent assumptions, operating costs and risks visible from the start.</p>
            <div className="inv-hero-actions">
              <a className="inv-button inv-button-dark" href="/invest/properties">Explore properties</a>
              <a className="inv-button inv-button-light" href="#how-it-works">How it works</a>
            </div>
            <div className="inv-hero-proof" aria-label="Product safeguards">
              <div><strong>RM10k</strong><span>Illustrative starting allocation</span></div>
              <div><strong>5 steps</strong><span>From research to a possible exit</span></div>
              <div><strong>RM0</strong><span>Accepted during this preview</span></div>
            </div>
          </div>
        </section>

        <section className="inv-section inv-section-white" id="how-it-works">
          <div className="inv-container">
            <header className="inv-section-head">
              <div><span className="inv-eyebrow">How it works</span><h2>A clearer route into property investing.</h2><p>Each step separates education, interest and ownership. The current platform stops at interest registration.</p></div>
            </header>
            <div className="inv-step-grid">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return <article className="inv-step" key={step.title}><span className="inv-step-icon"><Icon size={20} aria-hidden="true" /></span><small>0{index + 1}</small><h3>{step.title}</h3><p>{step.body}</p></article>;
              })}
            </div>
          </div>
        </section>

        <section className="inv-section">
          <div className="inv-container">
            <header className="inv-section-head">
              <div><span className="inv-eyebrow">Opportunity previews</span><h2>Start with the property, then test the numbers.</h2><p>These examples demonstrate the planned disclosure standard. They are not available investments and may never proceed.</p></div>
              <a className="inv-button inv-button-outline" href="/invest/properties">View all previews</a>
            </header>
            <div className="inv-opportunity-grid">
              {opportunities.map((opportunity) => <OpportunityCard opportunity={opportunity} key={opportunity.id} />)}
            </div>
          </div>
        </section>

        <section className="inv-section inv-section-green" id="risk-disclosure">
          <div className="inv-container inv-transparency-grid">
            <div><span className="inv-eyebrow">Trust before traction</span><h2>Built to show what could go wrong, too.</h2><p>Property can be illiquid. Rent can stop. Expenses can rise. Ownership structures, taxes and exit rights matter as much as the headline yield. Future product decisions will be gated by professional legal and regulatory advice.</p></div>
            <div className="inv-principle-list">
              {principles.map((principle) => { const Icon = principle.icon; return <article className="inv-principle" key={principle.title}><Icon size={22} aria-hidden="true" /><div><h3>{principle.title}</h3><p>{principle.body}</p></div></article>; })}
            </div>
          </div>
        </section>

        <section className="inv-cta-band">
          <div className="inv-container inv-cta-inner">
            <div><h2>Explore the model before sharing your interest.</h2><p>Open each property preview, change the assumptions and compare conservative, base and optimistic scenarios.</p></div>
            <div className="inv-section-actions"><a className="inv-button inv-button-dark" href="/invest/properties">Explore properties</a><a className="inv-button inv-button-outline" href="/invest/dashboard">View portfolio preview</a></div>
          </div>
        </section>
      </main>
      <InvestFooter />
    </div>
  );
}
