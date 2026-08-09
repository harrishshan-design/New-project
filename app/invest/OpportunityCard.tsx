import { ArrowUpRight, MapPin } from "lucide-react";
import { formatRinggit, type InvestmentOpportunity } from "./invest-data";

export default function OpportunityCard({ opportunity }: { opportunity: InvestmentOpportunity }) {
  const progress = Math.round((opportunity.slotsFilled / opportunity.slots) * 100);

  return (
    <article className="inv-property-card">
      <a className="inv-property-image" href={`/invest/property/${opportunity.id}`} aria-label={`View ${opportunity.name}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={opportunity.image} alt={`${opportunity.name} illustrative property`} loading="lazy" />
        <div className="inv-property-badges">
          <span className="inv-badge">{opportunity.status}</span>
          <span className="inv-badge inv-badge-risk">{opportunity.risk} risk</span>
        </div>
      </a>
      <div className="inv-property-body">
        <span className="inv-property-location"><MapPin size={13} aria-hidden="true" /> {opportunity.location}</span>
        <h2>{opportunity.name}</h2>
        <div className="inv-property-stats">
          <div><span>Indicative value</span><strong>{formatRinggit(opportunity.propertyValue)}</strong></div>
          <div><span>Interest from</span><strong>{formatRinggit(opportunity.minimumInvestment)}</strong></div>
          <div><span>Target hold</span><strong>{opportunity.targetHoldYears} years</strong></div>
          <div><span>Target rental yield</span><strong>{opportunity.targetRentalYield.toFixed(1)}% p.a.</strong></div>
        </div>
        <div className="inv-progress-track" aria-label={`${progress}% of interest slots indicated`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="inv-progress-label">
          <span>{opportunity.slotsFilled} of {opportunity.slots} interest slots indicated</span>
          <span>{progress}%</span>
        </div>
        <a className="inv-card-link" href={`/invest/property/${opportunity.id}`}>
          View opportunity <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
