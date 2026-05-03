"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  FileText,
  Handshake,
  Home,
  LogIn,
  Loader2,
  MapPinned,
  RotateCcw,
  Sparkles,
  UploadCloud
} from "lucide-react";
import { api } from "@/lib/api";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";
import { ModulePanel } from "@/components/ModulePanel";

type Tab = "vault" | "itinerary" | "cobroke" | "cheatsheet" | "referral";

const inputClass = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60";
const ghostClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]";

export default function HomePage() {
  const [active, setActive] = useState<Tab>("vault");
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("agent@realtygenius.my");
  const [password, setPassword] = useState("ChangeMe123!");

  const tabs = useMemo(() => [
    { id: "vault" as const, label: "Document Vault", icon: FileText },
    { id: "itinerary" as const, label: "Itinerary", icon: MapPinned },
    { id: "cobroke" as const, label: "Co-Broke", icon: Handshake },
    { id: "cheatsheet" as const, label: "Cheat Sheet", icon: Sparkles },
    { id: "referral" as const, label: "Referral", icon: RotateCcw }
  ], []);

  async function run<T>(label: string, action: () => Promise<T>) {
    setLoading(label);
    setResult(null);
    try {
      setResult(await action() as Record<string, unknown>);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Request failed" });
    } finally {
      setLoading(null);
    }
  }

  function saveToken() {
    window.localStorage.setItem("rg_token", token);
    setResult({ tokenSaved: true });
  }

  async function login() {
    await run("login", async () => {
      const response = await api<{ token: string; user: Record<string, unknown> }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      window.localStorage.setItem("rg_token", response.token);
      setToken(response.token);
      return response;
    });
  }

  return (
    <main className="min-h-screen p-4 text-white md:p-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="grid gap-5 rounded-3xl border border-white/10 bg-[#0f1b2b]/90 p-6 shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
                <Home size={14} /> RealtyGenius Malaysia
              </div>
              <a className={ghostClass} href="/login"><LogIn size={16} /> Role login</a>
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              The AI operating system property agents actually need every day.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
              Qualify buyers, plan viewings, unlock co-broke matches, prepare sharper property answers, and keep clients returning for years.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard label="Loan readiness" value="DSR AI" detail="OCR documents, extract income, and flag bankability before wasted viewings." />
            <MetricCard label="Tour ops" value="5 stops" detail="Route optimized viewing plans with landlord confirmation drafts." />
            <MetricCard label="Deal matching" value="50/50" detail="Silent co-broke invitations backed by private buyer-listing fit." />
            <MetricCard label="Retention" value="5 years" detail="Valuation reports and anniversary messages that keep agents remembered." />
          </div>
        </header>

        <section className="grid gap-4 rounded-2xl border border-white/10 bg-[#0f1b2b]/80 p-4 shadow-2xl lg:grid-cols-[290px_1fr]">
          <aside className="grid content-start gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="grid gap-3">
                <Field label="Email">
                  <input className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} />
                </Field>
                <Field label="Password">
                  <input className={inputClass} value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
                </Field>
                <button className={buttonClass} type="button" disabled={!!loading} onClick={login}>
                  {loading === "login" && <Loader2 className="animate-spin" size={16} />} Login
                </button>
              </div>
              <div className="my-4 h-px bg-white/10" />
              <Field label="JWT token">
                <textarea className={`${inputClass} min-h-24 resize-none`} value={token} onChange={(event) => setToken(event.target.value)} placeholder="Paste token from /api/auth/login" />
              </Field>
              <button className={`${ghostClass} mt-3 w-full`} type="button" onClick={saveToken}>
                <BadgeCheck size={16} /> Save token
              </button>
            </div>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-black transition ${active === tab.id ? "bg-cyan-300 text-slate-950" : "bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"}`}
                  type="button"
                  onClick={() => setActive(tab.id)}
                >
                  <Icon size={18} /> {tab.label}
                </button>
              );
            })}
          </aside>

          <div className="grid gap-4">
            {active === "vault" && <DocumentVault run={run} loading={loading} />}
            {active === "itinerary" && <ItineraryBuilder run={run} loading={loading} />}
            {active === "cobroke" && <CoBroke run={run} loading={loading} />}
            {active === "cheatsheet" && <CheatSheet run={run} loading={loading} />}
            {active === "referral" && <Referral run={run} loading={loading} />}
            <InventorySeeder run={run} loading={loading} />

            <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">API response</p>
              <pre className="max-h-96 overflow-auto rounded-xl bg-slate-950/70 p-4 text-xs leading-6 text-cyan-50">{JSON.stringify(result || { ready: true }, null, 2)}</pre>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function InventorySeeder({ run, loading }: PanelProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Inventory prerequisite</p>
          <h3 className="mt-1 text-lg font-black">Create a sample Bangsar listing with transaction comps</h3>
        </div>
        <button className={ghostClass} disabled={!!loading} onClick={() => run("seed-property", () => api("/properties", {
          method: "POST",
          body: JSON.stringify({
            title: "Bangsar South Residence",
            address: "Bangsar South, Kuala Lumpur",
            area: "Bangsar",
            askingPrice: 1200000,
            bedrooms: 3,
            bathrooms: 2,
            builtUpSqft: 1033,
            maintenanceFee: 0.38,
            developer: "UOA Group",
            imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
            transactions: [
              { transactedPrice: 1160000, transactedAt: "2026-01-12", unitSizeSqft: 1033 },
              { transactedPrice: 1190000, transactedAt: "2025-11-18", unitSizeSqft: 1033 },
              { transactedPrice: 1125000, transactedAt: "2025-09-08", unitSizeSqft: 1012 }
            ]
          })
        }))}>
          Create sample listing
        </button>
      </div>
    </section>
  );
}

function DocumentVault({ run, loading }: PanelProps) {
  const [buyerId, setBuyerId] = useState("");
  const [vaultId, setVaultId] = useState("");

  return (
    <ModulePanel eyebrow="AI Document Vault + DSR" title="Stop chasing PDFs on WhatsApp" icon={<UploadCloud size={22} />}>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Buyer ID"><input className={inputClass} value={buyerId} onChange={(e) => setBuyerId(e.target.value)} placeholder="UUID" /></Field>
        <Field label="Vault ID"><input className={inputClass} value={vaultId} onChange={(e) => setVaultId(e.target.value)} placeholder="UUID after vault creation" /></Field>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className={buttonClass} disabled={!!loading} onClick={() => run("create-buyer", () => api("/documents/buyers", {
          method: "POST",
          body: JSON.stringify({ name: "Aina Rahman", phone: "+60123456789", email: "aina@example.com", preferredArea: "Bangsar", budgetMin: 900000, budgetMax: 1300000 })
        }))}>
          {loading === "create-buyer" && <Loader2 className="animate-spin" size={16} />} Create buyer
        </button>
        <button className={buttonClass} disabled={!buyerId || !!loading} onClick={() => run("create-vault", () => api("/documents/vaults", { method: "POST", body: JSON.stringify({ buyerId }) }))}>
          Create magic link
        </button>
        <button className={buttonClass} disabled={!buyerId || !vaultId || !!loading} onClick={() => run("presign", () => api("/documents/presign", {
          method: "POST",
          body: JSON.stringify({ buyerId, vaultId, type: "payslip", fileName: "payslip.pdf", contentType: "application/pdf" })
        }))}>
          Presign upload
        </button>
        <button className={ghostClass} disabled={!buyerId || !!loading} onClick={() => run("dsr", () => api("/documents/dsr", {
          method: "POST",
          body: JSON.stringify({ buyerId, grossMonthlyIncome: 12000, existingMonthlyDebt: 1800, proposedInstallment: 4200 })
        }))}>
          Calculate DSR
        </button>
      </div>
    </ModulePanel>
  );
}

function ItineraryBuilder({ run, loading }: PanelProps) {
  const [buyerId, setBuyerId] = useState("");
  const [propertyIds, setPropertyIds] = useState("");
  return (
    <ModulePanel eyebrow="Smart Itinerary Builder" title="Plan Saturday viewings without traffic chaos" icon={<CalendarDays size={22} />}>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Buyer ID"><input className={inputClass} value={buyerId} onChange={(e) => setBuyerId(e.target.value)} /></Field>
        <Field label="Property IDs"><textarea className={`${inputClass} min-h-24`} value={propertyIds} onChange={(e) => setPropertyIds(e.target.value)} placeholder="Comma-separated UUIDs" /></Field>
      </div>
      <button className={`${buttonClass} mt-4`} disabled={!buyerId || !propertyIds || !!loading} onClick={() => run("itinerary", () => api("/itineraries", {
        method: "POST",
        body: JSON.stringify({
          buyerId,
          title: "Bangsar Condo Sprint",
          viewingDate: "2026-05-09",
          startAt: "2026-05-09T10:00:00+08:00",
          propertyIds: propertyIds.split(",").map((id) => id.trim()).filter(Boolean)
        })
      }))}>
        Build optimized route
      </button>
    </ModulePanel>
  );
}

function CoBroke({ run, loading }: PanelProps) {
  const [propertyId, setPropertyId] = useState("");
  return (
    <ModulePanel eyebrow="Silent Co-Broke Matchmaker" title="Find verified buyer-listing matches privately" icon={<Handshake size={22} />}>
      <Field label="Listing property ID"><input className={inputClass} value={propertyId} onChange={(e) => setPropertyId(e.target.value)} /></Field>
      <button className={`${buttonClass} mt-4`} disabled={!propertyId || !!loading} onClick={() => run("cobroke", () => api("/cobroke/scan", { method: "POST", body: JSON.stringify({ propertyId }) }))}>
        Scan co-broke matches
      </button>
    </ModulePanel>
  );
}

function CheatSheet({ run, loading }: PanelProps) {
  const [propertyId, setPropertyId] = useState("");
  const [buyerId, setBuyerId] = useState("");
  return (
    <ModulePanel eyebrow="AI Viewing Cheat Sheet" title="Look prepared when clients ask tough questions" icon={<Sparkles size={22} />}>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Property ID"><input className={inputClass} value={propertyId} onChange={(e) => setPropertyId(e.target.value)} /></Field>
        <Field label="Buyer ID optional"><input className={inputClass} value={buyerId} onChange={(e) => setBuyerId(e.target.value)} /></Field>
      </div>
      <button className={`${buttonClass} mt-4`} disabled={!propertyId || !!loading} onClick={() => run("cheatsheet", () => api("/cheatsheets", { method: "POST", body: JSON.stringify({ propertyId, buyerId: buyerId || undefined }) }))}>
        Prepare viewing brief
      </button>
    </ModulePanel>
  );
}

function Referral({ run, loading }: PanelProps) {
  const [campaignId, setCampaignId] = useState("");
  return (
    <ModulePanel eyebrow="Referral Autopilot" title="Never lose the client after key handover" icon={<RotateCcw size={22} />}>
      <Field label="Campaign ID"><input className={inputClass} value={campaignId} onChange={(e) => setCampaignId(e.target.value)} /></Field>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className={ghostClass} disabled={!!loading} onClick={() => run("due-referrals", () => api("/referrals/due"))}>Load due campaigns</button>
        <button className={buttonClass} disabled={!campaignId || !!loading} onClick={() => run("draft-referral", () => api(`/referrals/${campaignId}/draft`, { method: "POST" }))}>Draft valuation message</button>
        <button className={buttonClass} disabled={!campaignId || !!loading} onClick={() => run("send-referral", () => api(`/referrals/${campaignId}/send`, { method: "POST" }))}>Send follow-up</button>
      </div>
    </ModulePanel>
  );
}

type PanelProps = {
  loading: string | null;
  run: <T>(label: string, action: () => Promise<T>) => Promise<void>;
};
