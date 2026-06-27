/** A bordered container that frames one setting (a switch, picker, or input). */
export function SettingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-secondary/40 p-4">
      {children}
    </div>
  );
}
