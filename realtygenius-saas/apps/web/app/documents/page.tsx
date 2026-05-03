"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, FileText, Loader2, RefreshCcw, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { Field } from "@/components/Field";
import { MetricCard } from "@/components/MetricCard";

const inputClass = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60";
const ghostClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]";

type LoanFile = {
  vault_id: string;
  magic_token: string;
  buyer_id: string;
  buyer_name: string;
  buyer_phone: string;
  document_count: number;
  uploaded_count: number;
  dsr_percent: string | null;
  readiness: "likely" | "not_qualified" | null;
  notes: string | null;
};

type VaultSummary = {
  vault: { id: string; buyer_name: string; buyer_phone: string; buyer_email: string | null };
  requiredDocuments: string[];
  documents: Array<{
    id: string;
    type: string;
    original_name: string;
    upload_status: string;
    processing_status: string;
    extracted_json: { salary?: number; commitments?: number; netIncome?: number; confidence?: number };
    processing_error?: string | null;
  }>;
  dsr: {
    gross_monthly_income: string;
    existing_monthly_debt: string;
    dsr_percent: string;
    readiness: "likely" | "not_qualified";
    notes: string;
  } | null;
};

export default function AgentDocumentsPage() {
  const [email, setEmail] = useState("agent@realtygenius.my");
  const [password, setPassword] = useState("ChangeMe123!");
  const [token, setToken] = useState("");
  const [buyerName, setBuyerName] = useState("Aina Rahman");
  const [buyerPhone, setBuyerPhone] = useState("+60123456789");
  const [files, setFiles] = useState<LoanFile[]>([]);
  const [selected, setSelected] = useState<VaultSummary | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("rg_token");
    if (saved) {
      setToken(saved);
      void loadLoanFiles();
    }
  }, []);

  async function run<T>(label: string, action: () => Promise<T>) {
    setLoading(label);
    setMessage("");
    try {
      return await action();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed");
      return null;
    } finally {
      setLoading(null);
    }
  }

  async function login() {
    const response = await run("login", () => api<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }));
    if (response?.token) {
      window.localStorage.setItem("rg_token", response.token);
      setToken(response.token);
      await loadLoanFiles();
    }
  }

  async function createVault() {
    const buyer = await run("buyer", () => api<{ id: string }>("/documents/buyers", {
      method: "POST",
      body: JSON.stringify({ name: buyerName, phone: buyerPhone, preferredArea: "Bangsar" })
    }));
    if (!buyer) return;

    const vault = await run("vault", () => api<{ id: string; magicLink: string }>("/documents/vaults", {
      method: "POST",
      body: JSON.stringify({ buyerId: buyer.id })
    }));
    if (vault) {
      setMessage(`Magic link created: ${window.location.origin}${vault.magicLink}`);
      await loadLoanFiles();
    }
  }

  async function loadLoanFiles() {
    const response = await run("files", () => api<LoanFile[]>("/documents/loan-files"));
    if (response) setFiles(response);
  }

  async function loadSummary(vaultId: string) {
    const response = await run("summary", () => api<VaultSummary>(`/documents/vaults/${vaultId}/summary`));
    if (response) setSelected(response);
  }

  async function processSelected() {
    if (!selected) return;
    const response = await run("process", () => api<VaultSummary>(`/documents/vaults/${selected.vault.id}/process`, { method: "POST" }));
    if (response) {
      setSelected(response);
      await loadLoanFiles();
    }
  }

  return (
    <main className="min-h-screen p-4 text-white md:p-8">
      <div className="mx-auto grid max-w-7xl gap-5">
        <header className="rounded-3xl border border-white/10 bg-[#0f1b2b]/90 p-6 shadow-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
            <ShieldCheck size={14} /> Secure Document Vault
          </div>
          <h1 className="text-4xl font-black md:text-5xl">Loan document dashboard</h1>
          <p className="mt-3 max-w-2xl text-slate-300">Generate client magic links, monitor uploads, review OCR extraction, and decide loan eligibility from DSR.</p>
        </header>

        <section className="grid gap-4 lg:grid-cols-[330px_1fr]">
          <aside className="grid content-start gap-4 rounded-2xl border border-white/10 bg-[#0f1b2b]/85 p-4 shadow-2xl">
            <div className="grid gap-3">
              <Field label="Email"><input className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} /></Field>
              <Field label="Password"><input className={inputClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></Field>
              <button className={buttonClass} onClick={login} disabled={!!loading}>
                {loading === "login" && <Loader2 className="animate-spin" size={16} />} Login
              </button>
            </div>

            <div className="h-px bg-white/10" />

            <div className="grid gap-3">
              <Field label="Buyer name"><input className={inputClass} value={buyerName} onChange={(event) => setBuyerName(event.target.value)} /></Field>
              <Field label="Buyer phone"><input className={inputClass} value={buyerPhone} onChange={(event) => setBuyerPhone(event.target.value)} /></Field>
              <button className={ghostClass} onClick={createVault} disabled={!token || !!loading}>
                <FileText size={16} /> Create magic link
              </button>
              <button className={ghostClass} onClick={loadLoanFiles} disabled={!token || !!loading}>
                <RefreshCcw size={16} /> Refresh files
              </button>
            </div>

            {message && <p className="rounded-xl border border-cyan-200/20 bg-cyan-200/10 p-3 text-sm leading-6 text-cyan-50">{message}</p>}
          </aside>

          <section className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              <MetricCard label="Loan files" value={String(files.length)} detail="Active buyer vaults created by this agent." />
              <MetricCard label="Uploaded docs" value={String(files.reduce((sum, file) => sum + file.uploaded_count, 0))} detail="Documents uploaded through magic links." />
              <MetricCard label="Approvals" value={String(files.filter((file) => file.readiness === "likely").length)} detail="Buyers currently passing DSR rules." />
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-2xl border border-white/10 bg-[#0f1b2b]/85 p-4 shadow-2xl">
                <h2 className="text-xl font-black">Client vaults</h2>
                <div className="mt-4 grid gap-3">
                  {files.map((file) => (
                    <button key={file.vault_id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.08]" onClick={() => loadSummary(file.vault_id)}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <strong className="block text-white">{file.buyer_name}</strong>
                          <span className="text-sm text-slate-400">{file.buyer_phone}</span>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${file.readiness === "likely" ? "bg-emerald-300/15 text-emerald-100" : file.readiness ? "bg-rose-300/15 text-rose-100" : "bg-white/10 text-slate-200"}`}>
                          {file.readiness || "pending"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-300">{file.uploaded_count}/3 docs uploaded</p>
                      <p className="mt-1 text-sm text-slate-400">DSR {file.dsr_percent ? `${file.dsr_percent}%` : "not calculated"}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0f1b2b]/85 p-4 shadow-2xl">
                {!selected ? (
                  <div className="grid min-h-96 place-items-center rounded-xl border border-dashed border-white/15 text-center text-slate-400">
                    Select a client vault to review OCR data and DSR.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-black">{selected.vault.buyer_name}</h2>
                        <p className="text-sm text-slate-400">{selected.vault.buyer_phone}</p>
                      </div>
                      <button className={buttonClass} onClick={processSelected} disabled={!!loading}>
                        {loading === "process" && <Loader2 className="animate-spin" size={16} />} Run OCR + DSR
                      </button>
                    </div>

                    {selected.dsr && (
                      <div className={`rounded-2xl border p-4 ${selected.dsr.readiness === "likely" ? "border-emerald-300/30 bg-emerald-300/10" : "border-rose-300/30 bg-rose-300/10"}`}>
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
                          <BadgeCheck size={16} /> {selected.dsr.readiness === "likely" ? "Approve" : "Reject"}
                        </div>
                        <strong className="mt-2 block text-3xl">{Number(selected.dsr.dsr_percent).toFixed(2)}%</strong>
                        <p className="mt-2 text-sm leading-6 text-slate-200">{selected.dsr.notes}</p>
                      </div>
                    )}

                    <div className="overflow-hidden rounded-xl border border-white/10">
                      <table className="w-full border-collapse text-sm">
                        <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-[0.14em] text-slate-400">
                          <tr>
                            <th className="p-3">Document</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Salary</th>
                            <th className="p-3">Commitments</th>
                            <th className="p-3">Net income</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.documents.map((doc) => (
                            <tr key={doc.id} className="border-t border-white/10">
                              <td className="p-3">
                                <strong className="block">{doc.type}</strong>
                                <span className="text-xs text-slate-400">{doc.original_name}</span>
                              </td>
                              <td className="p-3 text-slate-300">{doc.processing_status}</td>
                              <td className="p-3">RM {Number(doc.extracted_json.salary || 0).toLocaleString("en-MY")}</td>
                              <td className="p-3">RM {Number(doc.extracted_json.commitments || 0).toLocaleString("en-MY")}</td>
                              <td className="p-3">RM {Number(doc.extracted_json.netIncome || 0).toLocaleString("en-MY")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
