"use client";

import { FormEvent, useState } from "react";

type Interest = {
  id: string;
  opportunity_id: string;
  full_name: string;
  email: string;
  phone: string;
  indicative_amount_band: string;
  status: string;
  created_at: string;
};

const MODULES = [
  ["Properties", "Draft, diligence, approved"], ["SPVs", "Structure and ownership"], ["Investors", "Profiles and suitability"], ["KYC", "Identity and screening"],
  ["Interest slots", "Non-binding demand"], ["Funding", "Disabled pre-approval"], ["Purchases", "Legal completion"], ["Rental", "Tenancy operations"],
  ["Expenses", "Invoice trail"], ["Distributions", "Approval and statements"], ["Valuations", "Independent evidence"], ["Documents", "Version and access"],
  ["Exits", "Sale and transfer"], ["Fees", "Full disclosure"], ["Compliance", "Audit and approvals"]
];

export default function InvestmentAdminConsole() {
  const [items, setItems] = useState<Interest[]>([]);
  const [message, setMessage] = useState("Enter the existing admin API key to load the server-side interest queue.");
  const [loading, setLoading] = useState(false);

  async function loadQueue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const key = String(new FormData(event.currentTarget).get("adminKey") || "").trim();
    if (!key) return;
    setLoading(true);
    setMessage("Loading protected queue...");
    try {
      const response = await fetch("/api/invest/admin", { headers: { "x-admin-api-key": key } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to load queue.");
      setItems(Array.isArray(payload.items) ? payload.items : []);
      setMessage(`${payload.count || 0} interest record${payload.count === 1 ? "" : "s"} loaded. The key remains only in this form and is not saved.`);
    } catch (error) {
      setItems([]);
      setMessage(error instanceof Error ? error.message : "Unable to load queue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inv-admin-wrap">
      <header className="inv-admin-top">
        <div><h1>Investment operations</h1><p>Internal pre-launch controls. Funding and distribution actions remain disabled.</p></div>
        <form className="inv-admin-key" onSubmit={loadQueue}>
          <input name="adminKey" type="password" placeholder="Admin API key" aria-label="Admin API key" autoComplete="off" />
          <button className="inv-button inv-button-dark" type="submit" disabled={loading}>{loading ? "Loading" : "Load queue"}</button>
        </form>
      </header>
      <section className="inv-admin-grid" aria-label="Investment operations metrics">
        <div className="inv-admin-card"><span>Interest records</span><strong>{items.length}</strong></div>
        <div className="inv-admin-card"><span>Live offers</span><strong>0</strong></div>
        <div className="inv-admin-card"><span>Funds accepted</span><strong>RM 0</strong></div>
        <div className="inv-admin-card"><span>Compliance state</span><strong>Pre-launch</strong></div>
      </section>
      <section className="inv-admin-modules" aria-label="Investment administration modules">
        {MODULES.map(([name, note]) => <div className="inv-admin-module" key={name}>{name}<small>{note}</small></div>)}
      </section>
      <section className="inv-admin-queue">
        <h2>Interest queue</h2>
        <p role="status">{message}</p>
        <div className="inv-portfolio-table-wrap">
          <table className="inv-portfolio-table">
            <thead><tr><th>Received</th><th>Name</th><th>Opportunity</th><th>Budget band</th><th>Contact</th><th>Status</th></tr></thead>
            <tbody>
              {items.length ? items.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.created_at).toLocaleDateString("en-MY")}</td>
                  <td>{item.full_name}</td>
                  <td>{item.opportunity_id}</td>
                  <td>{item.indicative_amount_band}</td>
                  <td>{item.email}<br />{item.phone}</td>
                  <td>{item.status}</td>
                </tr>
              )) : <tr><td colSpan={6}>No protected data is displayed until the admin key is validated.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
