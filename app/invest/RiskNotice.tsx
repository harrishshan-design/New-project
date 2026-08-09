import { ShieldAlert } from "lucide-react";

export default function RiskNotice() {
  return (
    <aside className="inv-risk-notice" aria-label="Investment risk notice">
      <ShieldAlert size={17} aria-hidden="true" />
      <p>
        <strong>Pre-launch education only.</strong> This is not an offer, financial advice or a request for payment. Property values, rent and liquidity can fall. All figures are illustrative and any future opportunity would require legal, regulatory, KYC and due-diligence approval.
      </p>
      <a href="#risk-disclosure">Read risks</a>
    </aside>
  );
}
