import { ArrowUpRight } from "lucide-react";

export default function InvestNav() {
  return (
    <header className="inv-nav-shell">
      <nav className="inv-nav" aria-label="Main navigation">
        <a className="inv-brand" href="/" aria-label="RealityGenius home">
          <span className="inv-brand-mark" aria-hidden="true">RG</span>
          <span>RealityGenius</span>
        </a>
        <div className="inv-nav-links">
          <a href="/user.html">Buy</a>
          <a href="/user.html?purpose=rent">Rent</a>
          <a className="is-active" href="/invest">Invest</a>
          <a href="/agents.html">Agents</a>
          <a href="/user.html#ai-search">AI Search</a>
        </div>
        <div className="inv-nav-actions">
          <a className="inv-link-button" href="/login.html?role=user">Log in</a>
          <a className="inv-button inv-button-dark inv-nav-cta" href="/invest/properties">
            Explore <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
        <details className="inv-mobile-menu">
          <summary aria-label="Open navigation"><span /><span /><span /></summary>
          <div>
            <a href="/user.html">Buy</a>
            <a href="/user.html?purpose=rent">Rent</a>
            <a href="/invest">Invest</a>
            <a href="/agents.html">Agents</a>
            <a href="/user.html#ai-search">AI Search</a>
            <a href="/login.html?role=user">Log in</a>
          </div>
        </details>
      </nav>
    </header>
  );
}
