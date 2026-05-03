"use client";

import { useMemo, useState } from "react";
import { Building2, Loader2, ShieldCheck, UserRound } from "lucide-react";
import { api } from "@/lib/api";
import { Field } from "@/components/Field";

type Role = "buyer" | "agent" | "admin";
type Mode = "login" | "register";

const inputClass = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60";
const ghostClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]";

const roleDefaults: Record<Role, { email: string; label: string; icon: typeof UserRound }> = {
  buyer: { email: "buyer@realtygenius.my", label: "Buyer", icon: UserRound },
  agent: { email: "agent@realtygenius.my", label: "Agent", icon: Building2 },
  admin: { email: "admin@realtygenius.my", label: "Admin", icon: ShieldCheck }
};

export default function LoginPage() {
  const [role, setRole] = useState<Role>("buyer");
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("Aina Rahman");
  const [email, setEmail] = useState(roleDefaults.buyer.email);
  const [password, setPassword] = useState("ChangeMe123!");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Use seeded accounts or register a buyer/agent.");

  const roles = useMemo(() => Object.entries(roleDefaults) as Array<[Role, typeof roleDefaults[Role]]>, []);

  function selectRole(nextRole: Role) {
    setRole(nextRole);
    setEmail(roleDefaults[nextRole].email);
    if (nextRole === "admin") setMode("login");
  }

  async function submit() {
    setLoading(true);
    setMessage("");
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login"
        ? { email, password }
        : { name, email, password, role };
      const response = await api<{ token: string; user: { role: string; name: string } }>(path, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      window.localStorage.setItem("rg_token", response.token);
      window.localStorage.setItem("rg_user", JSON.stringify(response.user));
      const destination = response.user.role === "buyer" ? "/buyer" : response.user.role === "agent" ? "/" : "/admin";
      window.location.href = destination;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-4 text-white md:p-8">
      <section className="mx-auto grid max-w-5xl gap-6 rounded-3xl border border-white/10 bg-[#0f1b2b]/90 p-5 shadow-2xl md:grid-cols-[0.9fr_1.1fr] md:p-7">
        <div className="grid content-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">RealtyGenius access</p>
            <h1 className="mt-3 text-4xl font-black leading-tight">One login, role-safe workspaces.</h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Buyers search and book. Agents close faster. Admins guard platform trust.
            </p>
          </div>
          <div className="grid gap-3">
            {roles.map(([id, item]) => {
              const Icon = item.icon;
              return (
                <button
                  key={id}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${role === id ? "border-cyan-200 bg-cyan-300 text-slate-950" : "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"}`}
                  type="button"
                  onClick={() => selectRole(id)}
                >
                  <span className="inline-flex items-center gap-3 text-sm font-black"><Icon size={18} /> {item.label}</span>
                  <span className="text-xs font-bold">{id === "admin" ? "login only" : "login/register"}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button className={mode === "login" ? buttonClass : ghostClass} type="button" onClick={() => setMode("login")}>Login</button>
            <button className={mode === "register" ? buttonClass : ghostClass} type="button" disabled={role === "admin"} onClick={() => setMode("register")}>Register</button>
          </div>

          <div className="grid gap-4">
            {mode === "register" && (
              <Field label="Name">
                <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} />
              </Field>
            )}
            <Field label="Email">
              <input className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
            </Field>
            <Field label="Password">
              <input className={inputClass} value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
            </Field>
            <button className={buttonClass} type="button" disabled={loading || (mode === "register" && role === "admin")} onClick={submit}>
              {loading && <Loader2 className="animate-spin" size={16} />}
              {mode === "login" ? `Login as ${roleDefaults[role].label}` : `Create ${roleDefaults[role].label}`}
            </button>
            {message && <p className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-slate-300">{message}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
