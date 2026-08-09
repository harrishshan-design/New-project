import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2, ChevronRight, FileClock, FileText, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import InterestForm from "../../InterestForm";
import InvestFooter from "../../InvestFooter";
import InvestNav from "../../InvestNav";
import InvestmentCalculator from "../../InvestmentCalculator";
import RiskNotice from "../../RiskNotice";
import { formatRinggit, getOpportunity, opportunities } from "../../invest-data";

export function generateStaticParams() {
  return opportunities.map((opportunity) => ({ id: opportunity.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const opportunity = getOpportunity(id);
  if (!opportunity) return { title: "Opportunity not found | RealityGenius" };
  return { title: `${opportunity.name} Investment Preview | RealityGenius`, description: opportunity.summary, alternates: { canonical: `/invest/property/${id}` } };
}

export default async function InvestmentPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = getOpportunity(id);
  if (!opportunity) notFound();

  return (
    <div className="inv-site">
      <InvestNav />
      <RiskNotice />
      <main>
        <section className="inv-detail-hero">
          <div className="inv-container">
            <nav className="inv-breadcrumbs" aria-label="Breadcrumb"><a href="/invest">Invest</a><ChevronRight size={13} /><a href="/invest/properties">Properties</a><ChevronRight size={13} /><span>{opportunity.name}</span></nav>
            <div className="inv-detail-title"><div><span className="inv-eyebrow">{opportunity.sourceListing ? "Existing listing · illustrative investment model" : "Illustrative opportunity preview"}</span><h1>{opportunity.name}</h1><p><MapPin size={14} aria-hidden="true" /> {opportunity.location}</p></div><span className="inv-badge inv-badge-risk">{opportunity.risk} risk</span></div>
            <div className="inv-detail-gallery">
              {opportunity.gallery.map((image, index) => <img key={image} src={image} alt={`${opportunity.name} listing view ${index + 1}`} />)}
            </div>
          </div>
        </section>

        <section className="inv-section">
          <div className="inv-container inv-detail-layout">
            <div>
              <section className="inv-panel">
                <h2>Property summary</h2><p>{opportunity.summary}</p><p>{opportunity.thesis}</p>
                {opportunity.sourceListing && (
                  <div className="inv-education-strip" style={{ margin: "22px 0" }}>
                    <FileText size={20} aria-hidden="true" />
                    <p><strong>Source listing #{opportunity.sourceListing.id}:</strong> Updated {opportunity.sourceListing.updatedAt}. {opportunity.sourceListing.reviewScope} <a href={opportunity.sourceListing.href}>View the live buyer listing</a>.</p>
                  </div>
                )}
                <div className="inv-summary-grid">
                  <div className="inv-summary-item"><span>{opportunity.sourceListing ? "Current asking price" : "Indicative value"}</span><strong>{formatRinggit(opportunity.propertyValue)}</strong></div>
                  <div className="inv-summary-item"><span>Interest from</span><strong>{formatRinggit(opportunity.minimumInvestment)}</strong></div>
                  <div className="inv-summary-item"><span>Property type</span><strong>{opportunity.propertyType}</strong></div>
                  <div className="inv-summary-item"><span>Tenure</span><strong>{opportunity.tenure}</strong></div>
                  <div className="inv-summary-item"><span>Built-up</span><strong>{opportunity.builtUp}</strong></div>
                  <div className="inv-summary-item"><span>Target hold</span><strong>{opportunity.targetHoldYears} years</strong></div>
                </div>
                <h3>Five-slot ownership concept</h3>
                <p>A future approved structure may divide the economic interest into five indicative allocations. The display below records demand only; it does not assign equity, shares, title or beneficial ownership.</p>
                <div className="inv-slot-grid">{Array.from({ length: opportunity.slots }, (_, index) => <div className={`inv-slot ${index < opportunity.slotsFilled ? "is-filled" : ""}`} key={index}>Slot {index + 1}<br />{index < opportunity.slotsFilled ? "Interest" : "Open"}</div>)}</div>
              </section>

              <InvestmentCalculator opportunity={opportunity} />

              <section className="inv-panel">
                <h2>Fees and operating assumptions</h2>
                <ul className="inv-fee-list">
                  <li><strong>Illustrative annual property costs</strong><span>{formatRinggit(opportunity.annualCosts)} total, allocated proportionately</span></li>
                  <li><strong>Acquisition and legal costs</strong><span>To be quoted and disclosed before any future offer</span></li>
                  <li><strong>Platform or administration fee</strong><span>Not set; no fee is being charged in this preview</span></li>
                  <li><strong>Tax</strong><span>Depends on final structure and investor circumstances; obtain professional advice</span></li>
                </ul>
              </section>

              <section className="inv-panel">
                <h2>Secure document room preview</h2><p>Documents remain unavailable until verified, approved and version-controlled. Placeholders show the evidence a future investor should expect before deciding.</p>
                <ul className="inv-document-list">
                  <li><div><FileClock size={17} /><strong>Independent valuation</strong></div><span>Pending source and date</span></li>
                  <li><div><FileClock size={17} /><strong>Title and ownership review</strong></div><span>Pending legal review</span></li>
                  <li><div><FileClock size={17} /><strong>Building inspection</strong></div><span>Pending appointment</span></li>
                  <li><div><FileText size={17} /><strong>Illustrative financial model</strong></div><span>Preview assumptions shown above</span></li>
                  <li><div><FileClock size={17} /><strong>Risk and fee disclosure</strong></div><span>Drafting required before launch</span></li>
                </ul>
              </section>

              <section className="inv-panel">
                <h2>How the SPV concept may work</h2><p>A special-purpose vehicle (SPV) is a separate legal entity that may hold one property. In a future approved structure, investors might own documented interests in that entity rather than their name appearing directly on the property title. The final rights, voting, distributions, liabilities, tax treatment and exit process would depend entirely on the executed legal documents. No SPV or investor ownership is created by this page.</p>
              </section>

              <section className="inv-panel" id="risk-disclosure">
                <h2>Key risks</h2>
                <ul className="inv-risk-list">
                  {[
                    "Capital loss: the property or ownership interest may be worth less than the amount invested.",
                    "Liquidity: an interest may be difficult or impossible to sell when you want to exit.",
                    "Rental uncertainty: vacancy, tenant default and lower market rent can reduce or eliminate distributions.",
                    "Cost overruns: repairs, service charges, insurance, tax and legal costs may exceed the model.",
                    "Structure and regulatory risk: the final model may require changes or may not receive approval."
                  ].map((risk) => <li key={risk}><AlertTriangle size={17} aria-hidden="true" /><span>{risk}</span></li>)}
                </ul>
              </section>
            </div>
            <aside className="inv-detail-aside">
              <InterestForm opportunity={opportunity} />
              <div className="inv-panel"><h3 style={{ marginTop: 0 }}>Current status</h3><p><CheckCircle2 size={15} aria-hidden="true" /> {opportunity.sourceListing ? "Existing sale listing used as a research sample" : "Research preview published"}</p><p><FileClock size={15} aria-hidden="true" /> Owner consent, legal, regulatory and investment due diligence pending</p></div>
            </aside>
          </div>
        </section>
      </main>
      <InvestFooter />
    </div>
  );
}
