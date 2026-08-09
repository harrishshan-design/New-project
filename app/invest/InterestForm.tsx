"use client";

import { FormEvent, useMemo, useState } from "react";
import type { InvestmentOpportunity } from "./invest-data";

type SubmitState = { kind: "idle" | "loading" | "success" | "error"; message: string };

export default function InterestForm({ opportunity }: { opportunity: InvestmentOpportunity }) {
  const [state, setState] = useState<SubmitState>({ kind: "idle", message: "" });
  const whatsappHref = useMemo(() => {
    const message = `Hi RealityGenius, I want to learn more about the ${opportunity.name} investment preview. I understand this is not a live offer and no payment is being accepted.`;
    return `https://wa.me/60189676625?text=${encodeURIComponent(message)}`;
  }, [opportunity.name]);

  async function submitInterest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setState({ kind: "loading", message: "Registering your interest..." });

    try {
      const response = await fetch("/api/invest/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          amountBand: formData.get("amountBand"),
          interestType: "waitlist",
          consent: formData.get("consent") === "on",
          website: formData.get("website")
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Interest registration is temporarily unavailable.");
      setState({ kind: "success", message: "You are on the interest list. No slot or payment has been created. Our team will contact you only with the next approved information step." });
      form.reset();
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Unable to register right now." });
    }
  }

  return (
    <form className="inv-panel inv-interest-form" onSubmit={submitInterest} data-testid="investment-interest-form">
      <h2>Join the interest list</h2>
      <p>No payment, commitment or ownership is created. We will use these details only to discuss this product preview.</p>
      <label className="inv-field"><span>Full name</span><input name="fullName" autoComplete="name" minLength={2} maxLength={100} required /></label>
      <label className="inv-field"><span>Email address</span><input name="email" type="email" autoComplete="email" maxLength={180} required /></label>
      <label className="inv-field"><span>Phone number</span><input name="phone" type="tel" autoComplete="tel" inputMode="tel" minLength={8} maxLength={24} required /></label>
      <label className="inv-field">
        <span>Indicative budget band</span>
        <select name="amountBand" defaultValue="RM10,000 - RM25,000" required>
          <option>RM10,000 - RM25,000</option>
          <option>RM25,001 - RM50,000</option>
          <option>RM50,001 - RM100,000</option>
          <option>Above RM100,000</option>
          <option>Just exploring</option>
        </select>
      </label>
      <label className="inv-consent">
        <input name="consent" type="checkbox" required />
        <span>I understand this is a pre-launch product preview, not an investment offer. I consent to RealityGenius contacting me about research and future approved updates.</span>
      </label>
      <label aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <button className="inv-button inv-button-dark inv-button-full" type="submit" disabled={state.kind === "loading"}>
        {state.kind === "loading" ? "Submitting..." : "Express interest - no payment"}
      </button>
      <a className="inv-button inv-button-outline inv-button-full" href={whatsappHref} target="_blank" rel="noreferrer">Ask on WhatsApp</a>
      {state.kind !== "idle" && <p className={`inv-form-status ${state.kind === "error" ? "is-error" : ""}`} role="status">{state.message}</p>}
    </form>
  );
}
