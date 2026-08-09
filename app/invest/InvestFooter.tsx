export default function InvestFooter() {
  return (
    <footer className="inv-footer">
      <div className="inv-container inv-footer-grid">
        <div>
          <a className="inv-brand inv-brand-footer" href="/">
            <span className="inv-brand-mark" aria-hidden="true">RG</span>
            <span>RealityGenius</span>
          </a>
          <p>Property intelligence for Malaysian buyers, agents and future investors.</p>
        </div>
        <div>
          <strong>Explore</strong>
          <a href="/user.html">Buy property</a>
          <a href="/invest/properties">Investment previews</a>
          <a href="/agents.html">Agent workspace</a>
        </div>
        <div>
          <strong>Important</strong>
          <a href="/terms.html">Terms</a>
          <a href="/privacy.html">Privacy</a>
          <a href="https://www.sc.com.my/investor-alert-list" target="_blank" rel="noreferrer">SC Investor Alert</a>
        </div>
        <p className="inv-footer-legal">
          RealityGenius is not presented as a bank, fund manager, trustee or licensed investment platform. The investment area is a product concept for education, simulation and interest registration only. No funds are accepted.
        </p>
      </div>
    </footer>
  );
}
