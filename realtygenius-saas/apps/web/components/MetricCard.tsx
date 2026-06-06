type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/60">{label}</p>
      <strong className="mt-3 block text-2xl font-black text-white">{value}</strong>
      <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
    </article>
  );
}
