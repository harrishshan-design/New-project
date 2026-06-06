import type { ReactNode } from "react";

type ModulePanelProps = {
  eyebrow: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
};

export function ModulePanel({ eyebrow, title, icon, children }: ModulePanelProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0f1b2b]/90 p-5 shadow-2xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/60">{eyebrow}</p>
          <h2 className="mt-2 text-xl font-black text-white">{title}</h2>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200">{icon}</div>
      </div>
      {children}
    </section>
  );
}
