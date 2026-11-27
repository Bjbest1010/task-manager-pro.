import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, MessageSquareWarning } from "lucide-react";
import { toast } from "sonner";
import { STATUSES, logActivity, setState, statusProgress, useApp, type Credential, type Status } from "@/lib/store";
import { DemoNote, Field, Modal, PageHeader, Progress, StatusBadge, fmtDate } from "@/components/ui-bits";

export const Route = createFileRoute("/verification")({
  head: () => ({ meta: [
    { title: "Verification Tracking — Task Manager Pro" },
    { name: "description", content: "Follow each credential through Pending, Under Review, Approved and Rejected stages." },
    { property: "og:title", content: "Verification Tracking — Task Manager Pro" },
    { property: "og:description", content: "Follow each credential through the verification stages." },
  ] }),
  component: Verification,
});

const steps = ["Pending", "Under Review", "Decision"];

function Stepper({ status }: { status: Status }) {
  const idx = status === "Pending" ? 0 : status === "Under Review" ? 1 : 2;
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const final = i === 2 && idx === 2;
        const cls = final ? (status === "Approved" ? "step-ok" : "step-fail") : i <= idx ? "step-done" : "";
        return (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span className={`step-dot ${cls}`}>{final ? (status === "Approved" ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />) : i + 1}</span>
            <span className="hidden text-xs font-medium sm:inline">{i === 2 && idx === 2 ? status : s}</span>
            {i < 2 && <span className={`h-0.5 flex-1 rounded ${i < idx ? "bg-primary" : "bg-muted"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function Verification() {
  const { credentials } = useApp();
  const [filter, setFilter] = useState<Status | "All">("All");
  const [rejecting, setRejecting] = useState<Credential | null>(null);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");

  const setStatus = (c: Credential, status: Status, feedback = c.feedback) => {
    setState((s) => ({ ...s, credentials: s.credentials.map((x) => (x.id === c.id ? { ...x, status, feedback } : x)), activities: logActivity(s, `${c.title} moved to ${status}`) }));
    toast.success(`${c.title}: ${status}`);
  };
  const list = credentials.filter((c) => filter === "All" || c.status === filter);

  return (
    <div>
      <PageHeader title="Verification tracking" subtitle="Follow each submission through the review stages." />
      <DemoNote>Demonstration workflow: use the reviewer buttons to simulate progress. This is not an official recognition or accreditation decision.</DemoNote>
      <div className="my-5 flex flex-wrap gap-2">
        {(["All", ...STATUSES] as const).map((s) => <button key={s} className={`chip ${filter === s ? "chip-active" : ""}`} onClick={() => setFilter(s)}>{s} ({s === "All" ? credentials.length : credentials.filter((c) => c.status === s).length})</button>)}
      </div>
      <div className="space-y-4">
        {list.map((c) => (
          <div key={c.id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-display font-semibold">{c.title}</h3><p className="text-sm text-muted-foreground">{c.institution} · submitted {fmtDate(c.submittedAt)}</p></div>
              <StatusBadge status={c.status} />
            </div>
            <div className="my-4"><Stepper status={c.status} /></div>
            <Progress value={statusProgress[c.status]} tone={c.status === "Approved" ? "success" : c.status === "Rejected" ? "danger" : "primary"} />
            {c.status === "Rejected" && c.feedback && (
              <div className="mt-4 flex gap-2 rounded-lg p-3 text-sm badge-rejected"><MessageSquareWarning className="h-4 w-4 shrink-0" /><div><p className="font-semibold">Reason for rejection</p><p>{c.feedback}</p></div></div>
            )}
            {c.status === "Approved" && c.feedback && <p className="mt-3 text-sm text-muted-foreground">Feedback: {c.feedback}</p>}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              <span className="mr-auto self-center text-xs text-muted-foreground">Simulate reviewer:</span>
              {c.status === "Pending" && <button className="btn btn-outline btn-sm" onClick={() => setStatus(c, "Under Review")}>Start review</button>}
              {c.status === "Under Review" && <>
                <button className="btn btn-primary btn-sm" onClick={() => setStatus(c, "Approved", "Documents checked against records (demo).")}>Approve</button>
                <button className="btn btn-danger btn-sm" onClick={() => { setRejecting(c); setReason(""); setErr(""); }}>Reject</button>
              </>}
              {c.status === "Rejected" && <>
                <Link to="/credentials" className="btn btn-outline btn-sm">Update documents</Link>
                <button className="btn btn-primary btn-sm" onClick={() => setStatus(c, "Pending", "")}>Resubmit</button>
              </>}
              {c.status === "Approved" && <span className="text-xs font-medium text-success">Verification complete</span>}
            </div>
          </div>
        ))}
        {!list.length && <div className="card text-center text-sm text-muted-foreground">No submissions with this status.</div>}
      </div>
      <Modal open={!!rejecting} title="Reject submission" onClose={() => setRejecting(null)}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (reason.trim().length < 10) { setErr("Give a clear reason (min 10 characters)."); return; } if (rejecting) setStatus(rejecting, "Rejected", reason.trim()); setRejecting(null); }}>
          <Field label="Reason for rejection" error={err}><textarea className="input min-h-24" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Document is illegible…" /></Field>
          <div className="flex justify-end gap-2"><button type="button" className="btn btn-outline" onClick={() => setRejecting(null)}>Cancel</button><button className="btn btn-danger">Reject</button></div>
        </form>
      </Modal>
    </div>
  );
}
