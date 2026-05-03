"use client";

import { useCallback, useEffect, useState } from "react";
import { Bookmark, CalendarPlus, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";

type Property = {
  id: string;
  title: string;
  area: string;
  address: string;
  property_type: string;
  asking_price: string;
  image_url: string | null;
  agent_name: string;
  saved?: boolean;
  trustState?: { confidenceScore: number; freshnessStatus: string; visualState: string };
};

type Booking = {
  id: string;
  status: string;
  property_title: string;
  viewing_start_at: string | null;
  agent_name: string;
};

const inputClass = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60";
const ghostClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]";

export default function BuyerDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [area, setArea] = useState("Bangsar");
  const [budgetMax, setBudgetMax] = useState("1300000");
  const [recommendation, setRecommendation] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [hasToken, setHasToken] = useState(true);

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
      const query = new URLSearchParams({ area, budgetMax });
      const [nextProperties, nextBookings] = await Promise.all([
        api<Property[]>(`/buyer/properties?${query.toString()}`),
        api<Booking[]>("/buyer/bookings")
      ]);
      setProperties(nextProperties);
      setBookings(nextBookings);
    });
  }, [area, budgetMax, run]);

  useEffect(() => {
    const token = window.localStorage.getItem("rg_token");
    setHasToken(Boolean(token));
    if (token) void load();
  }, [load]);

  async function saveHome(propertyId: string) {
    await run("save", () => api("/buyer/saved-homes", { method: "POST", body: JSON.stringify({ propertyId }) }));
    await load();
  }

  async function bookViewing(propertyId: string) {
    const viewingStartAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    viewingStartAt.setHours(11, 0, 0, 0);
    await run("book", () => api("/buyer/bookings", {
      method: "POST",
      body: JSON.stringify({ propertyId, viewingStartAt: viewingStartAt.toISOString(), buyerNote: "Preferred viewing slot from buyer dashboard." })
    }));
    await load();
  }

  async function recommend() {
    await run("recommend", async () => {
      const output = await api<Record<string, unknown>>("/ai/buyer-recommendation", {
        method: "POST",
        body: JSON.stringify({ area, budgetMax: Number(budgetMax), limit: 5 })
      });
      setRecommendation(output);
    });
  }

  if (!hasToken) {
    return (
      <main className="min-h-screen p-6 text-white">
        <section className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#0f1b2b]/90 p-6">
          <h1 className="text-3xl font-black">Buyer login required</h1>
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
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">Buyer workspace</p>
            <h1 className="mt-2 text-4xl font-black">Search, save, book, negotiate.</h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard label="Matches" value={String(properties.length)} detail="Fresh listings filtered by your area and budget." />
            <MetricCard label="Viewings" value={String(bookings.length)} detail="All bookings stay inside the deal timeline." />
          </div>
        </header>

        <section className="grid gap-3 rounded-2xl border border-white/10 bg-[#0f1b2b]/80 p-4 md:grid-cols-[1fr_1fr_auto_auto]">
          <Field label="Area">
            <input className={inputClass} value={area} onChange={(event) => setArea(event.target.value)} />
          </Field>
          <Field label="Max budget">
            <input className={inputClass} value={budgetMax} onChange={(event) => setBudgetMax(event.target.value)} inputMode="numeric" />
          </Field>
          <button className={`${ghostClass} self-end`} type="button" disabled={!!loading} onClick={load}>
            {loading === "load" ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />} Refresh
          </button>
          <button className={`${buttonClass} self-end`} type="button" disabled={!!loading} onClick={recommend}>
            {loading === "recommend" ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} Recommend
          </button>
        </section>

        {error && <p className="rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>}

        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-4 md:grid-cols-2">
            {properties.map((property) => (
              <article key={property.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                {property.image_url && <img className="h-44 w-full object-cover" src={property.image_url} alt={property.title} />}
                <div className="grid gap-3 p-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-100/60">{property.area} · {property.property_type}</p>
                    <h2 className="mt-1 text-xl font-black">{property.title}</h2>
                    <p className="mt-1 text-sm text-slate-300">{property.address}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-lg">RM {Number(property.asking_price).toLocaleString("en-MY")}</strong>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                      {property.trustState?.confidenceScore ?? 0}% · {property.trustState?.freshnessStatus ?? "unknown"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button className={ghostClass} type="button" disabled={!!loading || property.saved} onClick={() => saveHome(property.id)}>
                      <Bookmark size={16} /> {property.saved ? "Saved" : "Save"}
                    </button>
                    <button className={buttonClass} type="button" disabled={!!loading} onClick={() => bookViewing(property.id)}>
                      <CalendarPlus size={16} /> Book
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="grid content-start gap-4">
            <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <h2 className="text-lg font-black">Viewing timeline</h2>
              <div className="mt-4 grid gap-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <strong className="block">{booking.property_title}</strong>
                    <p className="text-sm text-slate-300">{booking.agent_name} · {booking.status}</p>
                    <p className="text-xs text-slate-400">{booking.viewing_start_at ? new Date(booking.viewing_start_at).toLocaleString("en-MY") : "Time pending"}</p>
                  </div>
                ))}
              </div>
            </section>
            {recommendation && (
              <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h2 className="text-lg font-black">AI recommendation</h2>
                <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-slate-950/70 p-3 text-xs leading-6 text-cyan-50">{JSON.stringify(recommendation, null, 2)}</pre>
              </section>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
