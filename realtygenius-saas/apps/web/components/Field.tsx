type FieldProps = {
  label: string;
  children: React.ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}
