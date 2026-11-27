import { createFileRoute, Link } from "@tanstack/react-router";
import { FileCheck2, Clock, CheckCircle2, XCircle, Bell, Activity as ActIcon, ArrowRight } from "lucide-react";
import { useApp, statusProgress } from "@/lib/store";
import { DemoNote, Progress, StatusBadge, fmtDate } from "@/components/ui-bits";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dashboard — Task Manager Pro" },
    { name: "description", content: "Overview of your credential submissions, verification progress and reminders." },
    { property: "og:title", content: "Dashboard — Task Manager Pro" },
    { property: "og:description", content: "Overview of your credential submissions, verification progress and reminders." },
  ] }),
  component: Dashboard,
});

function Dashboard() {
  const { credentials, skills, tasks, activities, profile } = useApp();
  const count = (s: string) => credentials.filter((c) => c.status === s).length;
  const pending = count("Pending") + count("Under Review");
  const approved = count("Approved"), rejected = count("Rejected");
  const items = [...credentials, ...skills];
  const progress = items.length ? Math.round(items.filter((i) => i.status === "Approved").length / items.length * 100) : 0;
  const today = new Date().toISOString().slice(0, 10);
  const open = tasks.filter((t) => !t.done).sort((a, b) => a.due.localeCompare(b.due));
  const notes = [
    ...credentials.filter((c) => c.status === "Rejected").map((c) => ({ id: c.id, text: `${c.title} was rejected — review feedback and resubmit.`, tone: "danger" })),
    ...open.filter((t) => t.due < today).map((t) => ({ id: t.id, text: `Overdue task: ${t.title}`, tone: "warn" })),
  ];
  const stats = [
    { label: "Total submitted", value: credentials.length, icon: FileCheck2, cls: "text-primary" },
    { label: "Pending / in review", value: pending, icon: Clock, cls: "text-warning" },
    { label: "Approved", value: approved, icon: CheckCircle2, cls: "text-success" },
    { label: "Rejected", value: rejected, icon: XCircle, cls: "text-destructive" },
  ];
  return (
    <div className="space-y-6">
      <section className="hero">
        <p className="text-sm opacity-80">Welcome back,</p>
        <h1 className="font-display text-2xl font-bold md:text-3xl">{profile.name.split(" ")[0]}, here's your verification overview</h1>
        <div className="mt-5 max-w-md">
          <div className="mb-1 flex justify-between text-sm"><span>Overall validation progress</span><span className="font-semibold">{progress}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-primary-foreground/25"><div className="h-full rounded-full bg-primary-foreground" style={{ width: `${progress}%` }} /></div>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <s.icon className={`h-5 w-5 ${s.cls}`} />
            <p className="mt-3 font-display text-3xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-display font-semibold">Verification progress</h2><Link to="/verification" className="flex items-center gap-1 text-sm font-medium text-primary">View all <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="space-y-4">
            {credentials.slice(0, 5).map((c) => (
              <div key={c.id}>
                <div className="mb-1 flex items-center justify-between gap-2 text-sm"><span className="truncate font-medium">{c.title}</span><StatusBadge status={c.status} /></div>
                <Progress value={statusProgress[c.status]} tone={c.status === "Approved" ? "success" : c.status === "Rejected" ? "danger" : "primary"} />
              </div>
            ))}
            {!credentials.length && <p className="text-sm text-muted-foreground">No credentials yet. <Link to="/credentials" className="text-primary">Add one</Link>.</p>}
          </div>
        </div>
        <div className="card">
          <h2 className="mb-4 flex items-center gap-2 font-display font-semibold"><Bell className="h-4 w-4 text-primary" />Notifications</h2>
          <ul className="space-y-3 text-sm">
            {notes.map((n) => <li key={n.id} className={`rounded-lg p-3 ${n.tone === "danger" ? "badge-rejected" : "badge-pending"}`}>{n.text}</li>)}
            {open.slice(0, 3).map((t) => <li key={t.id} className="flex justify-between gap-2 border-b border-border pb-2"><span>{t.title}</span><span className="shrink-0 text-muted-foreground">{fmtDate(t.due)}</span></li>)}
            {!notes.length && !open.length && <li className="text-muted-foreground">You're all caught up.</li>}
          </ul>
          <Link to="/tasks" className="btn btn-outline btn-sm mt-4 w-full">Manage tasks</Link>
        </div>
      </div>
      <div className="card">
        <h2 className="mb-4 flex items-center gap-2 font-display font-semibold"><ActIcon className="h-4 w-4 text-primary" />Recent activity</h2>
        <ul className="space-y-3">
          {activities.slice(0, 6).map((a) => <li key={a.id} className="flex justify-between gap-4 text-sm"><span>{a.text}</span><span className="shrink-0 text-muted-foreground">{fmtDate(a.at)}</span></li>)}
        </ul>
      </div>
      <DemoNote>Demonstration workflow: statuses are simulated for presentation and do not represent official credential recognition or accreditation.</DemoNote>
    </div>
  );
}
