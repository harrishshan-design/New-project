"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import "./landing.css";

const STATS = [
  { num: "Browse", label: "No account needed to search" },
  { num: "QC", label: "Review status shown on listings" },
  { num: "REN", label: "Agent ID state shown when supplied" },
  { num: "Source", label: "Evidence labelled by type and date" }
];

const BENEFITS = [
  { no: "01", title: "Verification you can inspect", body: "See listing QC, source, last review date and REN status separately. Admin review is never presented as legal or ownership verification." },
  { no: "02", title: "Affordability before pressure", body: "Check estimated instalment and DSR before sharing your details. Assumptions stay visible and bank approval is never implied." },
  { no: "03", title: "Evidence before an offer", body: "Compare asking price per square foot and view transaction evidence only when a named source and date are available." }
];

const HOMES = [
  { src: "https://www.pexels.com/download/video/34593442/", title: "Skyline Residence", area: "Mont Kiara, KL", spec: "3 bed · 2,150 sq ft", match: "94%", price: "RM 2.4M" },
  { src: "https://www.pexels.com/download/video/18293320/", title: "Twin Towers View Suites", area: "KLCC, KL", spec: "2 bed · 1,180 sq ft", match: "91%", price: "RM 1.68M" },
  { src: "https://www.pexels.com/download/video/7578546/", title: "Garden Family Home", area: "Petaling Jaya", spec: "4 bed · 2,800 sq ft", match: "89%", price: "RM 1.35M" },
  { src: "https://www.pexels.com/download/video/31617692/", title: "Putrajaya Lake Suites", area: "Putrajaya", spec: "3 bed · 1,540 sq ft", match: "87%", price: "RM 980K" }
];

const TOOLS = [
  { no: "T-01", title: "Search without login", body: "Browse available Klang Valley inventory, open details and contact the listing representative without creating an account." },
  { no: "T-02", title: "REN and QC states", body: "Agent ID supplied, REN verified and listing QC are separate labels, each with a clear meaning." },
  { no: "T-03", title: "Free DSR estimate", body: "Compare income, commitments and the estimated instalment before arranging a viewing." },
  { no: "T-04", title: "Is this price fair?", body: "Compare asking price per square foot with current asking-price evidence. Transaction data appears only with a source and date." },
  { no: "T-05", title: "Private deal checklist", body: "Keep questions, documents and offer steps together. Payments and legal signing stay with named licensed stakeholders." },
  { no: "T-06", title: "Agent closing workspace", body: "Agents get listing QC, content, Telegram import, lead follow-up and viewing tools in one focused workspace." }
];

const PERKS = [
  { title: "Free AI match", body: "Search around your budget and lifestyle." },
  { title: "Saved shortlist", body: "Keep serious options together." },
  { title: "Property alerts", body: "Return when a relevant home appears." },
  { title: "DSR + price context", body: "Estimate before you arrange a viewing." }
];

const STEPS = [
  { no: "01", title: "Tell us what you need", body: "Budget, location, property type and must-haves — in plain language." },
  { no: "02", title: "Compare evidence and affordability", body: "Review QC status, REN state, asking-price context and your estimated DSR." },
  { no: "03", title: "Contact or save", body: "Open details and contact the representative without an account. Sign in only for cross-device saving and alerts." }
];

const FAQS = [
  { q: "Can I explore without an account?", a: "Yes. Search, open details, use affordability tools and contact the listing representative without an account. Login is optional for cross-device saves and alerts." },
  { q: "What does verified mean here?", a: "We show separate states for admin listing QC, agent identity supplied and REN verification. QC checks listing completeness; it is not proof of ownership, legal title or guaranteed availability." },
  { q: "Is the price report a valuation?", a: "No. It is an asking-price comparison unless a named transaction source and date are shown. It does not replace a registered valuer, bank valuation or legal due diligence." },
  { q: "Are auction bids automatic purchases?", a: "No. A winning bid means you submitted the highest offer. Final purchase is still subject to owner approval, booking fee, loan eligibility, agreement terms and legal documentation." },
  { q: "Does RealityGenius hold booking fees?", a: "Not in the current buyer preview. Never transfer money based only on a screen status. Confirm the named stakeholder, account holder, written terms and receipt before paying." }
];

type AffordabilityInputs = {
  price: string;
  income: string;
  commitments: string;
  deposit: string;
  size: string;
  nearbyPsf: string;
};

const DEFAULT_AFFORDABILITY: AffordabilityInputs = {
  price: "650000",
  income: "9000",
  commitments: "1200",
  deposit: "10",
  size: "1000",
  nearbyPsf: "650"
};

const RINGGIT = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  maximumFractionDigits: 0
});

function numericValue(value: string) {
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function calculateAffordability(inputs: AffordabilityInputs) {
  const price = numericValue(inputs.price);
  const income = numericValue(inputs.income);
  const commitments = numericValue(inputs.commitments);
  const depositPercent = Math.min(numericValue(inputs.deposit), 100);
  const size = numericValue(inputs.size);
  const nearbyPsf = numericValue(inputs.nearbyPsf);
  const annualRate = 0.042;
  const loanYears = 35;
  const monthlyRate = annualRate / 12;
  const paymentCount = loanYears * 12;
  const paymentFactor = monthlyRate * Math.pow(1 + monthlyRate, paymentCount) / (Math.pow(1 + monthlyRate, paymentCount) - 1);
  const loanAmount = price * (1 - depositPercent / 100);
  const mortgage = loanAmount > 0 ? loanAmount * paymentFactor : 0;
  const maintenance = size * 0.35;
  const ownershipReserve = price * 0.002 / 12;
  const monthlyCost = mortgage + maintenance + ownershipReserve;
  const dsr = income > 0 ? (commitments + mortgage) / income * 100 : 0;
  const fairMid = size * nearbyPsf;
  const fairLow = fairMid * 0.95;
  const fairHigh = fairMid * 1.05;
  const dsrLabel = !income ? "Add monthly income" : dsr <= 60 ? "Comfortable range" : dsr <= 70 ? "Near the benchmark" : "Above the benchmark";
  const priceLabel = !fairMid
    ? "Add size and nearby RM/psf"
    : price < fairLow
      ? "Below nearby asking context"
      : price > fairHigh
        ? "Above nearby asking context"
        : "Within nearby asking context";

  return {
    price,
    depositPercent,
    size,
    nearbyPsf,
    mortgage,
    maintenance,
    ownershipReserve,
    monthlyCost,
    dsr,
    hasIncome: income > 0,
    dsrLabel,
    fairLow,
    fairHigh,
    priceLabel
  };
}

export default function Home() {
  const navRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const stripWrapRef = useRef<HTMLDivElement>(null);
  const stripTrackRef = useRef<HTMLDivElement>(null);
  const stripBarRef = useRef<HTMLDivElement>(null);
  const [affordabilityInputs, setAffordabilityInputs] = useState(DEFAULT_AFFORDABILITY);
  const affordability = useMemo(() => calculateAffordability(affordabilityInputs), [affordabilityInputs]);
  const whatsappHref = useMemo(() => {
    const message = [
      "Hi RealityGenius, I used the public affordability check.",
      `Target home price: ${RINGGIT.format(affordability.price)}`,
      `Estimated monthly ownership cost: ${RINGGIT.format(affordability.monthlyCost)}`,
      "Please help me find a suitable home and connect me with the listing representative."
    ].join("\n");
    return `https://wa.me/60189676625?text=${encodeURIComponent(message)}`;
  }, [affordability]);

  const updateAffordability = (field: keyof AffordabilityInputs, value: string) => {
    setAffordabilityInputs((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motion: string = "subtle";
    let raf = 0;
    let io: IntersectionObserver | undefined;
    let io2: IntersectionObserver | undefined;
    let ioVid: IntersectionObserver | undefined;
    let stripScrub = true;

    if (!reduced && motion !== "off") {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
      const toObserve: HTMLElement[] = [];
      els.forEach((el) => {
        if (el.getBoundingClientRect().top > innerHeight * 0.92) {
          const i = parseInt(el.getAttribute("data-reveal") || "0", 10) || 0;
          el.classList.add("rg-reveal");
          el.style.transitionDelay = (i % 6) * 70 + "ms";
          toObserve.push(el);
        }
      });
      io = new IntersectionObserver(
        (ents) => {
          ents.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      toObserve.forEach((el) => io?.observe(el));
    }

    if (!reduced && motion !== "off") {
      const lines = Array.from(document.querySelectorAll<HTMLElement>("[data-line]"));
      lines.forEach((el) => el.classList.add("rg-line"));
      const counts = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
      io2 = new IntersectionObserver(
        (ents) => {
          ents.forEach((e) => {
            if (!e.isIntersecting) return;
            io2?.unobserve(e.target);
            const el = e.target as HTMLElement;
            if (el.hasAttribute("data-line")) {
              el.classList.add("is-visible");
              return;
            }
            const raw = el.getAttribute("data-count") || "";
            const m = raw.match(/^(\d+)(.*)$/);
            if (!m) return;
            const target = parseInt(m[1], 10);
            const suffix = m[2];
            const t0 = performance.now();
            const step = (now: number) => {
              const t = Math.min((now - t0) / 1400, 1);
              const v = Math.round(target * (1 - Math.pow(1 - t, 3)));
              el.textContent = v + suffix;
              if (t < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          });
        },
        { threshold: 0.4 }
      );
      lines.forEach((el) => io2?.observe(el));
      counts.forEach((el) => io2?.observe(el));
    }

    const vids = Array.from(document.querySelectorAll<HTMLVideoElement>(".rg-vid-el"));
    vids.forEach((v) => {
      v.muted = true;
      v.setAttribute("muted", "");
    });
    ioVid = new IntersectionObserver(
      (ents) => {
        ents.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) {
            v.muted = true;
            v.play().catch(() => {});
          } else v.pause();
        });
      },
      { threshold: 0.05 }
    );
    vids.forEach((v) => ioVid?.observe(v));

    const plx = Array.from(document.querySelectorAll<HTMLElement>("[data-plx]"));

    if ((reduced || motion === "off") && stripWrapRef.current && stripTrackRef.current) {
      stripWrapRef.current.style.height = "auto";
      const inner = stripTrackRef.current.parentElement;
      if (inner) {
        inner.style.position = "static";
        inner.style.height = "auto";
        inner.style.padding = "80px 0";
      }
      stripTrackRef.current.style.overflowX = "auto";
      stripTrackRef.current.style.width = "auto";
      stripScrub = false;
    }

    const mult = motion === "cinematic" ? 1 : motion === "subtle" ? 0.45 : 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const y = (document.scrollingElement || document.documentElement).scrollTop;
      if (navRef.current) {
        const on = y > 40;
        navRef.current.style.background = on ? "color-mix(in srgb, var(--color-bg) 84%, transparent)" : "transparent";
        navRef.current.style.backdropFilter = on ? "blur(10px)" : "none";
        navRef.current.style.borderBottomColor = on ? "var(--color-divider)" : "transparent";
      }
      if (reduced || !mult) return;
      const vh = innerHeight;
      const t = Math.min(Math.max(y / (vh * 0.85), 0), 1);
      if (heroContentRef.current) {
        heroContentRef.current.style.opacity = String(Math.max(1 - t * 1.15, 0));
        heroContentRef.current.style.transform = "translateY(" + (y * 0.22 * mult).toFixed(1) + "px)";
      }
      if (heroCardRef.current) {
        heroCardRef.current.style.opacity = String(Math.max(1 - t * 1.05, 0));
        heroCardRef.current.style.transform = "translateY(" + (y * 0.1 * mult).toFixed(1) + "px)";
      }
      if (cueRef.current) cueRef.current.style.opacity = String(Math.max(1 - y / 180, 0));
      if (stripScrub && stripWrapRef.current && stripTrackRef.current) {
        const r = stripWrapRef.current.getBoundingClientRect();
        const total = r.height - vh;
        if (total > 0) {
          const pr = Math.min(Math.max(-r.top / total, 0), 1);
          const shift = Math.max(stripTrackRef.current.scrollWidth - innerWidth, 0);
          stripTrackRef.current.style.transform = "translate3d(" + (-pr * shift).toFixed(1) + "px,0,0)";
          if (stripBarRef.current) stripBarRef.current.style.transform = "scaleX(" + pr.toFixed(3) + ")";
        }
      }
      for (const el of plx) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        const sp = parseFloat(el.getAttribute("data-plx") || "0.12");
        el.style.transform = "translateY(" + ((r.top + r.height / 2 - vh / 2) * sp).toFixed(1) + "px)";
      }
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      io2?.disconnect();
      ioVid?.disconnect();
    };
  }, []);

  return (
    <div className="rg-landing" style={{ position: "relative", minHeight: "100vh" }}>
      <Script src="/js/rg-skyline.js" strategy="afterInteractive" />

      {/* @ts-expect-error -- rg-skyline is a vanilla custom element, not a typed React component */}
      <rg-skyline density="1" motion="subtle" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />

      <nav
        ref={navRef}
        className="rg-nav"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 28,
          padding: "14px clamp(20px,5vw,72px)",
          background: "transparent",
          borderBottom: "1px solid transparent",
          transition: "background .4s ease, border-color .4s ease, backdrop-filter .4s ease"
        }}
      >
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19, letterSpacing: ".04em", textTransform: "uppercase", marginRight: "auto" }}>
          Reality<span style={{ color: "var(--color-accent-300)" }}>Genius</span>
        </span>
        <div className="rg-nav-links" style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <a href="/user.html" style={{ color: "inherit", textDecoration: "none", fontSize: 14 }}>Buy</a>
          <a href="/user.html?purpose=rent" style={{ color: "inherit", textDecoration: "none", fontSize: 14 }}>Rent</a>
          <a href="/invest" style={{ color: "inherit", textDecoration: "none", fontSize: 14 }}>Invest</a>
          <a href="/agents.html" style={{ color: "inherit", textDecoration: "none", fontSize: 14 }}>Agents</a>
          <a href="/user.html#ai-search" style={{ color: "inherit", textDecoration: "none", fontSize: 14 }}>AI Search</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a className="rg-btn rg-btn-primary rg-nav-explore" href="/user.html" style={{ textDecoration: "none" }}>Explore homes</a>
          <a className="rg-btn rg-btn-secondary" href="/login.html?role=user" style={{ textDecoration: "none" }}>Login</a>
        </div>
      </nav>

      <div className="rg-hero-stage" style={{ position: "relative", zIndex: 1, height: "190vh" }}>
        <div
          className="rg-hero-sticky"
          style={{ position: "sticky", top: 0, height: "100vh", display: "flex", alignItems: "center", padding: "76px clamp(20px,5vw,72px) 88px", boxSizing: "border-box" }}
        >
          <div className="rg-hero-grid" style={{ maxWidth: 1240, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "minmax(0,5fr) minmax(480px,5fr)", gap: 48, alignItems: "center" }}>
            <div ref={heroContentRef} className="rg-hero-copy" style={{ willChange: "transform,opacity" }}>
              <span style={{ display: "block", fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-accent-300)", marginBottom: 12 }}>
                Free buyer check - no login required
              </span>
              <hr style={{ height: 1, border: 0, margin: "0 0 24px", background: "var(--color-divider)", maxWidth: 420 }} />
              <h1 className="rg-hero-h1" aria-label="Can I afford this home?" style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(52px,7.6vw,108px)", lineHeight: 1.02, letterSpacing: ".01em", textTransform: "uppercase", margin: "0 0 0 -0.05em" }}>
                <span style={{ display: "block", overflow: "hidden" }}>
                  <span className="rg-rise-a" style={{ display: "block", animation: "rg-rise .9s cubic-bezier(.22,1,.36,1) both .15s" }}>Can I afford</span>
                </span>
                <span style={{ display: "block", overflow: "hidden" }}>
                  <span className="rg-rise-a" style={{ display: "block", color: "var(--color-accent-300)", animation: "rg-rise .9s cubic-bezier(.22,1,.36,1) both .32s" }}>this home?</span>
                </span>
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.55, maxWidth: "56ch", margin: "26px 0 0", color: "color-mix(in srgb, var(--color-text) 82%, transparent)" }}>
                Estimate your DSR, monthly ownership cost and a nearby asking-price range before speaking to an agent. Your figures stay in this browser.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
                <a className="rg-btn rg-btn-primary" href="#affordability-tool" style={{ textDecoration: "none", fontSize: 15 }}>Check affordability</a>
                <a className="rg-btn rg-btn-secondary" href="/user.html#explore" style={{ textDecoration: "none", fontSize: 15 }}>Browse homes</a>
              </div>
              <div className="rg-hero-trust" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 26 }}>
                <span>No account</span>
                <span>Transparent assumptions</span>
                <span>Not a loan approval</span>
              </div>
            </div>
            <div ref={heroCardRef} className="rg-hero-card" style={{ alignSelf: "center", willChange: "transform,opacity" }}>
              <section id="affordability-tool" className="rg-blueprint rg-affordability-card" aria-labelledby="affordability-title">
                <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
                <header className="rg-affordability-head">
                  <div>
                    <span>Public affordability check</span>
                    <h2 id="affordability-title">Run your numbers</h2>
                  </div>
                  <span className="rg-tag rg-tag-accent">Free</span>
                </header>

                <div className="rg-affordability-fields">
                  <label>
                    <span>Home price (RM)</span>
                    <input data-testid="affordability-price" type="number" min="0" step="1000" inputMode="numeric" value={affordabilityInputs.price} onChange={(event) => updateAffordability("price", event.target.value)} />
                  </label>
                  <label>
                    <span>Net income / month</span>
                    <input data-testid="affordability-income" type="number" min="0" step="100" inputMode="numeric" value={affordabilityInputs.income} onChange={(event) => updateAffordability("income", event.target.value)} />
                  </label>
                  <label>
                    <span>Monthly commitments</span>
                    <input data-testid="affordability-commitments" type="number" min="0" step="100" inputMode="numeric" value={affordabilityInputs.commitments} onChange={(event) => updateAffordability("commitments", event.target.value)} />
                  </label>
                  <label>
                    <span>Cash deposit (%)</span>
                    <input data-testid="affordability-deposit" type="number" min="0" max="100" step="1" inputMode="decimal" value={affordabilityInputs.deposit} onChange={(event) => updateAffordability("deposit", event.target.value)} />
                  </label>
                  <label>
                    <span>Home size (sq ft)</span>
                    <input data-testid="affordability-size" type="number" min="0" step="10" inputMode="numeric" value={affordabilityInputs.size} onChange={(event) => updateAffordability("size", event.target.value)} />
                  </label>
                  <label>
                    <span>Nearby asking RM/psf</span>
                    <input data-testid="affordability-psf" type="number" min="0" step="10" inputMode="numeric" value={affordabilityInputs.nearbyPsf} onChange={(event) => updateAffordability("nearbyPsf", event.target.value)} />
                  </label>
                </div>

                <div className="rg-affordability-results" aria-live="polite">
                  <article>
                    <span>Estimated DSR</span>
                    <strong data-testid="affordability-dsr">{affordability.hasIncome ? `${affordability.dsr.toFixed(1)}%` : "--"}</strong>
                    <small>{affordability.dsrLabel}</small>
                  </article>
                  <article>
                    <span>Monthly cost</span>
                    <strong data-testid="affordability-monthly">{RINGGIT.format(affordability.monthlyCost)}</strong>
                    <small>{RINGGIT.format(affordability.mortgage)} mortgage + upkeep</small>
                  </article>
                  <article className="rg-fair-result">
                    <span>Fair-price range*</span>
                    <strong data-testid="affordability-fair">{affordability.fairLow ? `${RINGGIT.format(affordability.fairLow)} - ${RINGGIT.format(affordability.fairHigh)}` : "Add market context"}</strong>
                    <small>{affordability.priceLabel}</small>
                  </article>
                </div>

                <div className="rg-affordability-footer">
                  <p>
                    DSR uses take-home income. Estimate assumes 4.2% interest, 35 years, RM0.35/sq ft upkeep, 0.2%/year ownership reserve and a 70% reference. Banks apply their own rules. Fair range uses home size x nearby asking RM/psf, +/-5%; it is not a valuation or loan approval.
                  </p>
                  <div className="rg-affordability-actions">
                    <a className="rg-whatsapp-button" data-testid="affordability-whatsapp" href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp enquiry</a>
                    <a href="/user.html#explore">Find nearby listings</a>
                  </div>
                  <small>Your income and commitments are not included in the WhatsApp message.</small>
                </div>
              </section>
            </div>
          </div>
          <div ref={cueRef} className="rg-cue-wrap" style={{ position: "absolute", left: "50%", bottom: 26, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>Scroll &mdash; fly through the skyline</span>
            <span style={{ display: "block", width: 1, height: 34, background: "var(--color-accent-300)", animation: "rg-cue 2.2s ease-in-out infinite" }} />
          </div>
        </div>
      </div>

      <main style={{ position: "relative", zIndex: 1 }}>
        <section style={{ background: "var(--color-accent-900)", borderTop: "1px solid var(--color-divider)", borderBottom: "1px solid var(--color-divider)", color: "#f2f2f3", padding: "64px clamp(20px,5vw,72px)" }}>
          <div className="rg-stats-grid" style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, auto)", justifyContent: "space-between", gap: 36 }}>
            {STATS.map((s, index) => (
              <div key={s.label} data-reveal={index}>
                <p data-count={s.num} style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(38px,3.8vw,58px)", lineHeight: 1.05, margin: "0 0 0 -0.03em", fontFeatureSettings: "'tnum' 1" }}>{s.num}</p>
                <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600, color: "color-mix(in srgb, #f2f2f3 58%, transparent)", margin: "10px 0 0" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="benefits" style={{ background: "color-mix(in srgb, var(--color-bg) 94%, transparent)", backdropFilter: "blur(6px)", padding: "96px clamp(20px,5vw,72px)" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto" }}>
            <div data-reveal={0}>
              <span style={{ display: "block", fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-accent-300)", marginBottom: 12 }}>Why buyers use RealityGenius</span>
              <hr data-line={1} style={{ height: 1, border: 0, margin: "0 0 28px", background: "var(--color-divider)" }} />
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(34px,3.6vw,52px)", lineHeight: 1.06, textTransform: "uppercase", letterSpacing: ".01em", margin: "0 0 12px" }}>Less searching. More confidence.</h2>
              <p style={{ fontSize: 16, lineHeight: 1.55, maxWidth: "62ch", margin: "0 0 48px", color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}>Understand the property, the fit and the next step &mdash; without wading through another endless directory.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "clamp(24px,3vw,48px)" }}>
              {BENEFITS.map((b, index) => (
                <div key={b.no} className="rg-blueprint" data-reveal={index} style={{ padding: 28 }}>
                  <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14, color: "var(--color-accent-300)", letterSpacing: ".1em" }}>{b.no}</span>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 23, textTransform: "uppercase", letterSpacing: ".02em", lineHeight: 1.15, margin: "14px 0 10px" }}>{b.title}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.55, margin: 0, color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}>{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={stripWrapRef} style={{ position: "relative", height: "340vh", background: "var(--color-accent-900)", borderTop: "1px solid var(--color-divider)", borderBottom: "1px solid var(--color-divider)", color: "#f2f2f3" }}>
          <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div ref={stripTrackRef} style={{ display: "flex", alignItems: "center", gap: "clamp(24px,3.5vw,64px)", width: "max-content", padding: "0 clamp(20px,5vw,72px)", willChange: "transform" }}>
              <div style={{ width: "min(38vw,480px)", flex: "none" }}>
                <span style={{ display: "block", fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-accent-300)", marginBottom: 12 }}>Featured homes</span>
                <hr style={{ height: 1, border: 0, margin: "0 0 24px", background: "color-mix(in srgb, #f2f2f3 22%, transparent)" }} />
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(38px,4vw,60px)", lineHeight: 1.04, textTransform: "uppercase", letterSpacing: ".01em", margin: "0 0 14px" }}>Homes worth stopping for.</h2>
                <p style={{ fontSize: 16, lineHeight: 1.55, margin: 0, maxWidth: "40ch", color: "color-mix(in srgb, #f2f2f3 68%, transparent)" }}>A visual preview of the browsing experience. Open the live inventory to see current availability, source and review status.</p>
                <p style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", margin: "26px 0 0", color: "color-mix(in srgb, #f2f2f3 45%, transparent)" }}>Keep scrolling &rarr;</p>
              </div>
              {HOMES.map((h) => (
                <figure key={h.title} className="rg-blueprint rg-vid" style={{ flex: "none", width: "min(58vw,780px)", margin: 0, borderColor: "color-mix(in srgb, #f2f2f3 25%, transparent)" }}>
                  <i className="corner tl" style={{ color: "color-mix(in srgb, #f2f2f3 55%, transparent)" }} />
                  <i className="corner tr" style={{ color: "color-mix(in srgb, #f2f2f3 55%, transparent)" }} />
                  <i className="corner bl" style={{ color: "color-mix(in srgb, #f2f2f3 55%, transparent)" }} />
                  <i className="corner br" style={{ color: "color-mix(in srgb, #f2f2f3 55%, transparent)" }} />
                  <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", background: "#152230" }}>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video className="rg-vid-el" src={h.src} loop playsInline preload="metadata" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    <div className="rg-vid-tint" style={{ position: "absolute", inset: 0, background: "var(--color-accent)", mixBlendMode: "color", pointerEvents: "none" }} />
                    <span className="rg-tag rg-tag-accent" style={{ position: "absolute", top: 14, left: 14 }}>Experience preview</span>
                    <span style={{ position: "absolute", top: 16, right: 14, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "color-mix(in srgb, #f2f2f3 80%, transparent)" }}>Sample media</span>
                  </div>
                  <figcaption style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, padding: "16px 18px", flexWrap: "wrap" }}>
                    <span>
                      <span style={{ display: "block", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 21, textTransform: "uppercase", letterSpacing: ".02em" }}>{h.title}</span>
                      <span style={{ display: "block", fontSize: 13, marginTop: 2, color: "color-mix(in srgb, #f2f2f3 60%, transparent)" }}>{h.area} &middot; {h.spec}</span>
                    </span>
                    <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 22, letterSpacing: ".02em", color: "var(--color-accent-300)" }}>{h.price}</span>
                  </figcaption>
                </figure>
              ))}
              <div style={{ flex: "none", width: "min(34vw,420px)", textAlign: "left" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(28px,2.8vw,40px)", lineHeight: 1.08, textTransform: "uppercase", letterSpacing: ".01em", margin: "0 0 18px" }}>See what is live,<br />and what was checked.</h3>
                <a className="rg-btn" href="/user.html#explore" style={{ textDecoration: "none", fontSize: 15, color: "var(--color-accent-900)", background: "#f2f2f3", borderColor: "#f2f2f3" }}>Open live inventory &rarr;</a>
              </div>
            </div>
            <div style={{ position: "absolute", left: "clamp(20px,5vw,72px)", right: "clamp(20px,5vw,72px)", bottom: 30 }}>
              <div style={{ height: 1, background: "color-mix(in srgb, #f2f2f3 20%, transparent)" }}>
                <div ref={stripBarRef} style={{ height: 1, background: "var(--color-accent-300)", transform: "scaleX(0)", transformOrigin: "left", willChange: "transform" }} />
              </div>
              <p style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", margin: "10px 0 0", color: "color-mix(in srgb, #f2f2f3 40%, transparent)" }}>Product preview only &middot; sample footage via Pexels &middot; not live inventory</p>
            </div>
          </div>
        </section>

        <div style={{ height: "70vh", display: "grid", placeItems: "center", position: "relative", overflow: "hidden" }}>
          <span data-plx="0.14" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(70px,11vw,170px)", letterSpacing: ".04em", textTransform: "uppercase", color: "color-mix(in srgb, var(--color-accent) 26%, transparent)", whiteSpace: "nowrap", willChange: "transform" }}>3&deg;09&prime;N &middot; 101&deg;43&prime;E</span>
          <span className="rg-tag rg-tag-outline" style={{ background: "var(--color-bg)", letterSpacing: ".12em", textTransform: "uppercase", padding: "6px 16px", position: "relative" }}>Kuala Lumpur &mdash; rendered live in 3D</span>
        </div>

        <section id="toolkit" style={{ background: "color-mix(in srgb, var(--color-bg) 94%, transparent)", backdropFilter: "blur(6px)", padding: "96px clamp(20px,5vw,72px)" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto" }}>
            <div data-reveal={0}>
              <span style={{ display: "block", fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-accent-300)", marginBottom: 12 }}>Buyer toolkit</span>
              <hr data-line={1} style={{ height: 1, border: 0, margin: "0 0 28px", background: "var(--color-divider)" }} />
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(34px,3.6vw,52px)", lineHeight: 1.06, textTransform: "uppercase", letterSpacing: ".01em", margin: "0 0 48px" }}>Useful AI at the moments that matter.</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "clamp(24px,3vw,44px)" }}>
              {TOOLS.map((t, index) => (
                <div key={t.no} className="rg-blueprint" data-reveal={index} style={{ padding: 26 }}>
                  <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
                  <span style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-accent-300)" }}>{t.no}</span>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 21, textTransform: "uppercase", letterSpacing: ".02em", lineHeight: 1.15, margin: "12px 0 8px" }}>{t.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, color: "color-mix(in srgb, var(--color-text) 75%, transparent)" }}>{t.body}</p>
                </div>
              ))}
            </div>

            <div className="rg-offer-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,6fr) minmax(0,5fr)", gap: "clamp(32px,5vw,88px)", alignItems: "center", marginTop: 110 }}>
              <div data-reveal={0}>
                <span style={{ display: "block", fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-accent-300)", marginBottom: 12 }}>Buyer launch offer</span>
                <hr style={{ height: 1, border: 0, margin: "0 0 24px", background: "var(--color-divider)" }} />
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(30px,3vw,44px)", lineHeight: 1.08, textTransform: "uppercase", letterSpacing: ".01em", margin: "0 0 12px" }}>Explore freely. Keep the good ones.</h2>
                <p style={{ fontSize: 16, lineHeight: 1.55, margin: "0 0 26px", maxWidth: "52ch", color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}>Your buyer account is free. Save favourites, get new-property alerts, keep your search preferences and request viewings directly.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 28px", marginBottom: 30 }}>
                  {PERKS.map((pk) => (
                    <div key={pk.title} style={{ borderLeft: "1px solid var(--color-divider)", paddingLeft: 14 }}>
                      <p style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, textTransform: "uppercase", letterSpacing: ".02em", margin: 0 }}>{pk.title}</p>
                      <p style={{ fontSize: 13, lineHeight: 1.5, margin: "4px 0 0", color: "color-mix(in srgb, var(--color-text) 68%, transparent)" }}>{pk.body}</p>
                    </div>
                  ))}
                </div>
                <a className="rg-btn rg-btn-primary" href="/login.html?role=user&mode=signup" style={{ textDecoration: "none", fontSize: 15 }}>Create free account</a>
              </div>
              <figure className="rg-blueprint" data-reveal={1} style={{ margin: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.pexels.com/photos/29185333/pexels-photo-29185333.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Property photo"
                  style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block" }}
                />
                <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
              </figure>
            </div>

            <div id="how" style={{ marginTop: 110 }}>
              <div data-reveal={0}>
                <span style={{ display: "block", fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-accent-300)", marginBottom: 12 }}>How it works</span>
                <hr data-line={1} style={{ height: 1, border: 0, margin: "0 0 28px", background: "var(--color-divider)" }} />
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(34px,3.6vw,52px)", lineHeight: 1.06, textTransform: "uppercase", letterSpacing: ".01em", margin: "0 0 48px" }}>From a simple request to a real viewing.</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "clamp(24px,3vw,48px)" }}>
                {STEPS.map((st, index) => (
                  <div key={st.no} data-reveal={index} style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 20 }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(40px,3.4vw,56px)", lineHeight: 1, color: "var(--color-accent-300)" }}>{st.no}</span>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 22, textTransform: "uppercase", letterSpacing: ".02em", margin: "16px 0 8px" }}>{st.title}</h3>
                    <p style={{ fontSize: 15, lineHeight: 1.55, margin: 0, color: "color-mix(in srgb, var(--color-text) 75%, transparent)" }}>{st.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rg-invest-showcase" aria-labelledby="rg-invest-title">
          <div className="rg-invest-inner">
            <div data-reveal={0}>
              <span className="rg-invest-eyebrow">New product preview</span>
              <h2 id="rg-invest-title">Invest in property differently.</h2>
              <p>Explore how shared ownership could make selected Malaysian property more accessible. Test rental, cost and value scenarios before registering non-binding interest.</p>
              <div className="rg-invest-actions">
                <a className="rg-invest-primary" href="/invest">Explore RealityGenius Invest</a>
                <a className="rg-invest-secondary" href="/invest#how-it-works">How it works</a>
              </div>
              <small>No payment or ownership is created. Pre-launch education and interest registration only.</small>
            </div>
            <article className="rg-invest-card" data-reveal={1}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://tjmvbgdgddscbilfkggu.supabase.co/storage/v1/object/public/property-media/telegram-imports/5430779409/293a5b10-31bf-41c6-aa5b-6c16445bc4af/892acb5dc8faa6ba.jpg" alt="Interior of the double-storey house in Taman Kim Chuan, Port Klang" loading="lazy" />
              <div>
                <span>Existing live listing · sample model</span>
                <h3>Double-Storey House, Taman Kim Chuan</h3>
                <p>Taman Kim Chuan, Port Klang</p>
                <dl>
                  <div><dt>Current asking price</dt><dd>RM 710K</dd></div>
                  <div><dt>Interest from</dt><dd>RM 10K</dd></div>
                  <div><dt>Modelled rental yield</dt><dd>4.2% p.a.</dd></div>
                  <div><dt>Interest indicated</dt><dd>0 / 5</dd></div>
                </dl>
                <a href="/invest/property/taman-kim-chuan-double-storey">Open sample model &rarr;</a>
              </div>
            </article>
          </div>
        </section>

        <div style={{ height: "60vh", display: "grid", placeItems: "center", position: "relative", overflow: "hidden" }}>
          <span data-plx="0.14" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(70px,12vw,190px)", letterSpacing: ".06em", textTransform: "uppercase", color: "color-mix(in srgb, var(--color-accent) 26%, transparent)", whiteSpace: "nowrap", willChange: "transform" }}>Evidence</span>
          <span className="rg-tag rg-tag-outline" style={{ background: "var(--color-bg)", letterSpacing: ".12em", textTransform: "uppercase", padding: "6px 16px", position: "relative" }}>QC, REN and source shown separately</span>
        </div>

        <section style={{ background: "color-mix(in srgb, var(--color-bg) 94%, transparent)", backdropFilter: "blur(6px)", padding: "96px clamp(20px,5vw,72px)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div data-reveal={0}>
              <span style={{ display: "block", fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-accent-300)", marginBottom: 12 }}>FAQ</span>
              <hr data-line={1} style={{ height: 1, border: 0, margin: "0 0 28px", background: "var(--color-divider)" }} />
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(30px,3vw,44px)", lineHeight: 1.08, textTransform: "uppercase", letterSpacing: ".01em", margin: "0 0 36px" }}>What buyers ask first.</h2>
            </div>
            <div data-reveal={1}>
              {FAQS.map((f) => (
                <details key={f.q} style={{ borderTop: "1px solid var(--color-divider)" }}>
                  <summary style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, cursor: "pointer", padding: "20px 4px", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19, letterSpacing: ".02em", textTransform: "uppercase" }}>
                    <span>{f.q}</span>
                    <span className="faq-x" style={{ color: "var(--color-accent-300)", fontSize: 22, lineHeight: 1, flex: "none" }}>+</span>
                  </summary>
                  <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, padding: "0 4px 22px", maxWidth: "64ch", color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}>{f.a}</p>
                </details>
              ))}
              <hr style={{ height: 1, border: 0, margin: 0, background: "var(--color-divider)" }} />
            </div>
          </div>
        </section>

        <section style={{ background: "var(--color-accent-900)", borderTop: "1px solid var(--color-divider)", borderBottom: "1px solid var(--color-divider)", color: "#f2f2f3", padding: "72px clamp(20px,5vw,72px)" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 36, flexWrap: "wrap" }}>
            <div data-reveal={0} style={{ maxWidth: "60ch" }}>
              <span style={{ display: "block", fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 600, color: "color-mix(in srgb, #f2f2f3 58%, transparent)", marginBottom: 10 }}>For property agents</span>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(26px,2.6vw,38px)", lineHeight: 1.1, textTransform: "uppercase", letterSpacing: ".01em", margin: "0 0 8px" }}>List, create content and manage leads faster.</h2>
              <p style={{ fontSize: 15, lineHeight: 1.55, margin: 0, color: "color-mix(in srgb, #f2f2f3 70%, transparent)" }}>Structured listing upload, AI content, Telegram import, QC feedback and buyer-lead follow-up &mdash; in a workspace of its own.</p>
            </div>
            <a className="rg-btn" data-reveal={1} href="/agents.html" style={{ textDecoration: "none", fontSize: 15, color: "#f2f2f3", borderColor: "color-mix(in srgb, #f2f2f3 45%, transparent)" }}>Explore Agent OS &rarr;</a>
          </div>
        </section>

        <section style={{ background: "color-mix(in srgb, var(--color-bg) 94%, transparent)", backdropFilter: "blur(6px)", padding: "120px clamp(20px,5vw,72px) 96px", textAlign: "center" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }} data-reveal={0}>
            <span style={{ display: "block", fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600, color: "var(--color-accent-300)", marginBottom: 16 }}>Your next step</span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(44px,5.6vw,84px)", lineHeight: 1.02, textTransform: "uppercase", letterSpacing: ".01em", margin: 0 }}>Find a home worth saving.</h2>
            <p style={{ fontSize: 16, lineHeight: 1.55, margin: "24px auto 34px", maxWidth: "54ch", color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}>Browse freely. When a home is worth keeping, log in or create a free account to save it, get alerts and request a viewing.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a className="rg-btn rg-btn-primary" href="/login.html?role=user" style={{ textDecoration: "none", fontSize: 16, padding: "14px 34px" }}>Login / Create free account</a>
              <a className="rg-btn rg-btn-secondary" href="/user.html" style={{ textDecoration: "none", fontSize: 16, padding: "14px 34px" }}>Explore homes</a>
            </div>
          </div>
        </section>

        <footer style={{ background: "var(--color-bg)", borderTop: "1px solid var(--color-divider)", padding: "36px clamp(20px,5vw,72px)" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap", fontSize: 13, color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--color-text)" }}>RealityGenius</span>
            <span>AI-powered Malaysian property discovery for buyers &mdash; with a dedicated workspace for agents.</span>
            <div style={{ display: "flex", gap: 18 }}>
              <a href="/privacy.html" style={{ color: "inherit" }}>Privacy</a>
              <a href="/terms.html" style={{ color: "inherit" }}>Terms</a>
              <a href="/invest" style={{ color: "inherit" }}>Invest</a>
              <a href="/agents.html" style={{ color: "inherit" }}>For agents</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
