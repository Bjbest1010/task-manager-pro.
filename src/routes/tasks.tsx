import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, AlarmClock } from "lucide-react";
import { toast } from "sonner";
import { logActivity, setState, uid, useApp, type Task } from "@/lib/store";
import { Field, PageHeader, Progress, fmtDate } from "@/components/ui-bits";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [
    { title: "Tasks & Deadlines — Task Manager Pro" },
    { name: "description", content: "Create tasks with deadlines and get reminders for pending credential activities." },
    { property: "og:title", content: "Tasks & Deadlines — Task Manager Pro" },
    { property: "og:description", content: "Create tasks with deadlines and get reminders." },
  ] }),
  component: Tasks,
});

const prioCls = { High: "badge-rejected", Medium: "badge-pending", Low: "badge-review" } as const;

function Tasks() {
  const { tasks } = useApp();
  const [title, setTitle] = useState(""); const [due, setDue] = useState(""); const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [errors, setErrors] = useState<{ title?: string; due?: string }>({});
  const [view, setView] = useState<"Outstanding" | "Completed" | "All">("Outstanding");
  const today = new Date().toISOString().slice(0, 10);
  const soon = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (title.trim().length < 3) err.title = "Enter a task (min 3 characters).";
    if (!due) err.due = "Pick a deadline.";
    setErrors(err); if (Object.keys(err).length) return;
    setState((s) => ({ ...s, tasks: [{ id: uid(), title: title.trim(), due, priority, done: false }, ...s.tasks], activities: logActivity(s, `Task created: ${title.trim()}`) }));
    setTitle(""); setDue(""); toast.success("Task added");
  };
  const toggle = (t: Task) => setState((s) => ({ ...s, tasks: s.tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)), activities: t.done ? s.activities : logActivity(s, `Task completed: ${t.title}`) }));
  const remove = (t: Task) => { setState((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== t.id) })); toast.success("Task deleted"); };

  const done = tasks.filter((t) => t.done).length;
  const reminders = tasks.filter((t) => !t.done && t.due <= soon);
  const list = tasks.filter((t) => view === "All" || (view === "Completed" ? t.done : !t.done)).sort((a, b) => a.due.localeCompare(b.due));

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks & deadlines" subtitle={`${done} of ${tasks.length} completed · ${tasks.length - done} outstanding`} />
      <Progress value={tasks.length ? (done / tasks.length) * 100 : 0} tone="success" />
      {reminders.length > 0 && (
        <div className="card badge-pending !rounded-xl">
          <p className="mb-2 flex items-center gap-2 font-semibold"><AlarmClock className="h-4 w-4" />Reminders</p>
          <ul className="space-y-1 text-sm">{reminders.map((t) => <li key={t.id}>{t.title} — {t.due < today ? "overdue since" : "due"} {fmtDate(t.due)}</li>)}</ul>
        </div>
      )}
      <form onSubmit={add} className="card grid gap-4 md:grid-cols-[1fr_auto_auto_auto] md:items-end" noValidate>
        <Field label="New task" error={errors.title}><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Request transcript" /></Field>
        <Field label="Deadline" error={errors.due}><input type="date" className="input" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
        <Field label="Priority"><select className="input" value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])}><option>High</option><option>Medium</option><option>Low</option></select></Field>
        <button className="btn btn-primary"><Plus className="h-4 w-4" />Add</button>
      </form>
      <div className="flex gap-2">{(["Outstanding", "Completed", "All"] as const).map((v) => <button key={v} className={`chip ${view === v ? "chip-active" : ""}`} onClick={() => setView(v)}>{v}</button>)}</div>
      <ul className="card divide-y divide-border !p-0">
        {list.map((t) => (
          <li key={t.id} className="flex items-center gap-3 px-5 py-3">
            <input type="checkbox" className="h-4 w-4 accent-primary" checked={t.done} onChange={() => toggle(t)} aria-label={`Mark ${t.title} done`} />
            <div className="min-w-0 flex-1"><p className={`text-sm font-medium ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</p>
              <p className={`text-xs ${!t.done && t.due < today ? "text-destructive" : "text-muted-foreground"}`}>Due {fmtDate(t.due)}{!t.done && t.due < today ? " · overdue" : ""}</p></div>
            <span className={`badge ${prioCls[t.priority]}`}>{t.priority}</span>
            <button className="btn-icon text-destructive" aria-label={`Delete ${t.title}`} onClick={() => remove(t)}><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
        {!list.length && <li className="px-5 py-8 text-center text-sm text-muted-foreground">Nothing here.</li>}
      </ul>
    </div>
  );
}
