"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, FileUp, Loader2, ShieldCheck } from "lucide-react";
import { Field } from "@/components/Field";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
const requiredTypes = ["ic", "payslip", "bank_statement"] as const;
const labels: Record<string, string> = {
  ic: "IC",
  payslip: "Payslip",
  bank_statement: "Bank statement"
};

const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60";

type VaultSummary = {
  vault: { buyer_name: string; buyer_phone: string };
  documents: Array<{ id: string; type: string; original_name: string; upload_status: string; processing_status: string }>;
  dsr: { dsr_percent: string; readiness: string; notes: string } | null;
};

export default function ClientVaultPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [summary, setSummary] = useState<VaultSummary | null>(null);
  const [files, setFiles] = useState<Record<string, File | null>>({ ic: null, payslip: null, bank_statement: null });
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const uploadedTypes = useMemo(() => new Set(summary?.documents.filter((doc) => doc.upload_status === "uploaded").map((doc) => doc.type) || []), [summary]);

  useEffect(() => {
    void loadSummary();
  }, [token]);

  async function publicApi<T>(path: string, init: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers }
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "Request failed");
    }
    return response.json() as Promise<T>;
  }

  async function loadSummary() {
    setLoading("summary");
    try {
      setSummary(await publicApi<VaultSummary>(`/documents/public/vault/${token}`));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Magic link failed");
    } finally {
      setLoading(null);
    }
  }

  async function uploadType(type: string) {
    const file = files[type];
    if (!file) return;

    setLoading(type);
    setMessage("");
    try {
      const presign = await publicApi<{ document: { id: string }; uploadUrl: string }>(`/documents/public/vault/${token}/uploads`, {
        method: "POST",
        body: JSON.stringify({ type, fileName: file.name, contentType: file.type })
      });

      const upload = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });
      if (!upload.ok) throw new Error("S3 upload failed");

      await publicApi(`/documents/public/vault/${token}/documents/${presign.document.id}/complete`, { method: "POST" });
      setMessage(`${labels[type]} uploaded securely.`);
      await loadSummary();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setLoading(null);
    }
  }

  async function processDocuments() {
    setLoading("process");
    setMessage("");
    try {
      setSummary(await publicApi<VaultSummary>(`/documents/public/vault/${token}/process`, { method: "POST" }));
      setMessage("Documents processed. Your agent can now review the DSR.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Processing failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen p-4 text-white md:p-8">
      <div className="mx-auto grid max-w-3xl gap-5">
        <header className="rounded-3xl border border-white/10 bg-[#0f1b2b]/90 p-6 shadow-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
            <ShieldCheck size={14} /> Secure upload
          </div>
          <h1 className="text-3xl font-black md:text-5xl">Upload loan documents</h1>
          <p className="mt-3 text-slate-300">{summary ? `For ${summary.vault.buyer_name}` : "Loading your secure vault..."}</p>
        </header>

        <section className="grid gap-4 rounded-2xl border border-white/10 bg-[#0f1b2b]/85 p-4 shadow-2xl">
          {requiredTypes.map((type) => (
            <div key={type} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">{labels[type]}</h2>
                  <p className="text-sm text-slate-400">{uploadedTypes.has(type) ? "Uploaded" : "Required"}</p>
                </div>
                {uploadedTypes.has(type) && <CheckCircle2 className="text-emerald-200" />}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <Field label="File">
                  <input
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-300 file:px-3 file:py-2 file:text-sm file:font-black file:text-slate-950"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    onChange={(event) => setFiles((current) => ({ ...current, [type]: event.target.files?.[0] || null }))}
                  />
                </Field>
                <button className={`${buttonClass} self-end`} disabled={!files[type] || !!loading} onClick={() => uploadType(type)}>
                  {loading === type ? <Loader2 className="animate-spin" size={16} /> : <FileUp size={16} />} Upload
                </button>
              </div>
            </div>
          ))}

          <button className={buttonClass} disabled={uploadedTypes.size < 3 || !!loading} onClick={processDocuments}>
            {loading === "process" && <Loader2 className="animate-spin" size={16} />} Run OCR and calculate DSR
          </button>

          {summary?.dsr && (
            <div className={`rounded-2xl border p-4 ${summary.dsr.readiness === "likely" ? "border-emerald-300/30 bg-emerald-300/10" : "border-rose-300/30 bg-rose-300/10"}`}>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-300">DSR result</p>
              <strong className="mt-2 block text-3xl">{Number(summary.dsr.dsr_percent).toFixed(2)}%</strong>
              <p className="mt-2 text-sm leading-6 text-slate-200">{summary.dsr.notes}</p>
            </div>
          )}

          {message && <p className="rounded-xl border border-cyan-200/20 bg-cyan-200/10 p-3 text-sm leading-6 text-cyan-50">{message}</p>}
        </section>
      </div>
    </main>
  );
}
