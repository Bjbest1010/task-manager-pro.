import type { ReactNode } from "react";
import { X } from "lucide-react";
import type { Status } from "@/lib/store";

const statusCls: Record<Status, string> = {
  Pending: "badge-pending", "Under Review": "badge-review", Approved: "badge-approved", Rejected: "badge-rejected",
};
export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge ${statusCls[status]}`}>{status}</span>;
}
export function Progress({ value, tone = "primary" }: { value: number; tone?: "primary" | "success" | "danger" }) {
  return <div className="progress"><div className={`progress-bar progress-${tone}`} style={{ width: `${value}%` }} /></div>;
}
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}</div>
      {action}
    </div>
  );
}
export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function Field({ label, error, children }: { label: string; error?: string | undefined; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
export function DemoNote({ children }: { children: ReactNode }) {
  return <div className="demo-note">{children}</div>;
}
export const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
export const fmtSize = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} KB`);
