"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, ShieldAlert, UsersRound } from "lucide-react";
import { api } from "@/lib/api";
import { MetricCard } from "@/components/MetricCard";

type Overview = {
  users: Array<{ role: string; status: string; count: number }>;
  properties: Array<{ verification_source: string; count: number; avg_confidence: string }>;
  leads: Array<{ status: string; count: number }>;
  bookings: Array<{ status: string; count: number }>;
  commissions: Array<{ status: string; gross: string | null; platform: string | null }>;
  negotiations: Array<{ status: string; count: number }>;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  agency_name: string | null;
  ren_id: string | null;
};

type PropertyRow = {
  id: string;
  title: string;
  area: string;
  asking_price: string;
  confidence_score: number;
  verification_source: string;
  agent_name: string;
};

const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60";
const ghostClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]";

export default function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [hasToken, setHasToken] = useState(true);

  const totals = useMemo(() => {
    const userCount = overview?.users.reduce((sum, row) => sum + row.count, 0) || 0;
    const listingCount = overview?.properties.reduce((sum, row) => sum + row.count, 0) || 0;
    const bookingCount = overview?.bookings.reduce((sum, row) => sum + row.count, 0) || 0;
    const platformRevenue = overview?.commissions.reduce((sum, row) => sum + Number(row.platform || 0), 0) || 0;
    return { userCount, listingCount, bookingCount, platformRevenue };
  }, [overview]);

  const run = useCallback(async function run<T>(label: string, action: () => Promise<T>) {
    setLoading(label);
    setError("");
    try {
      return await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      return null;
    } finally {
      setLoading(null);
    }
  }, []);

  const load = useCallback(async function load() {
    await run("load", async () => {
      const [nextOverview, nextUsers, nextProperties] = await Promise.all([
        api<Overview>("/admin/overview"),
        api<UserRow[]>("/admin/users?limit=30"),
        api<PropertyRow[]>("/admin/properties")
      ]);
      setOverview(nextOverview);
      setUsers(nextUsers);
      setProperties(nextProperties.slice(0, 30));
    });
  }, [run]);

  useEffect(() => {
    const token = window.localStorage.getItem("rg_token");
    setHasToken(Boolean(token));
    if (token) void load();
  }, [load]);

  async function suspendUser(userId: string) {
    await run("suspend", () => api(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "suspended" })
    }));
    await load();
  }

  if (!hasToken) {
    return (
      <main className="min-h-screen p-6 text-white">
        <section className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#0f1b2b]/90 p-6">
          <h1 className="text-3xl font-black">Admin login required</h1>
          <a className={`${buttonClass} mt-5`} href="/login">Go to login</a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 text-white md:p-8">
      <div className="mx-auto grid max-w-7xl gap-5">
        <header className="grid gap-4 rounded-3xl border border-white/10 bg-[#0f1b2b]/90 p-5 shadow-2xl lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">Gatekeeper dashboard</p>
            <h1 className="mt-2 text-4xl font-black">Trust, supply, and money control.</h1>
          </div>
          <button className={`${buttonClass} self-start`} type="button" disabled={!!loading} onClick={load}>
            {loading === "load" ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />} Refresh
          </button>
        </header>

        {error && <p className="rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>}

        <section className="grid gap-3 md:grid-cols-4">
          <MetricCard label="Users" value={String(totals.userCount)} detail="Buyer, agent, admin, and master accounts." />
          <MetricCard label="Listings" value={String(totals.listingCount)} detail="Every listing carries confidence and freshness state." />
          <MetricCard label="Bookings" value={String(totals.bookingCount)} detail="Tracked in-platform viewing requests." />
          <MetricCard label="Platform RM" value={totals.platformRevenue.toLocaleString("en-MY")} detail="Commission, escrow, SaaS, and bank referral ledger." />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-[#0f1b2b]/80 p-4">
            <div className="mb-4 flex items-center gap-2">
              <UsersRound size={18} />
              <h2 className="text-lg font-black">Users</h2>
            </div>
            <div className="grid gap-2">
              {users.map((user) => (
                <div key={user.id} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 md:grid-cols-[1fr_auto]">
                  <div>
                    <strong className="block">{user.name}</strong>
                    <p className="text-sm text-slate-300">{user.email}</p>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-cyan-100/60">{user.role} · {user.status}</p>
                  </div>
                  <button className={ghostClass} type="button" disabled={!!loading || user.status === "suspended"} onClick={() => suspendUser(user.id)}>
                    <ShieldAlert size={16} /> Suspend
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0f1b2b]/80 p-4">
            <h2 className="text-lg font-black">Listing trust desk</h2>
            <div className="mt-4 grid gap-2">
              {properties.map((property) => (
                <div key={property.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <strong>{property.title}</strong>
                    <span className="text-sm font-black text-cyan-100">{property.confidence_score}%</span>
                  </div>
                  <p className="text-sm text-slate-300">{property.area} · RM {Number(property.asking_price).toLocaleString("en-MY")}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{property.verification_source} · {property.agent_name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
