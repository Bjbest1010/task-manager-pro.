import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SKILL_CATEGORIES, SKILL_LEVELS, STATUSES, logActivity, setState, uid, useApp, type Skill, type Status } from "@/lib/store";
import { DemoNote, Field, Modal, PageHeader, StatusBadge } from "@/components/ui-bits";

export const Route = createFileRoute("/skills")({
  head: () => ({ meta: [
    { title: "Skills Validation — Task Manager Pro" },
    { name: "description", content: "Record professional skills and work experience and track their validation status." },
    { property: "og:title", content: "Skills Validation — Task Manager Pro" },
    { property: "og:description", content: "Record skills and track their validation status." },
  ] }),
  component: Skills,
});

type Form = Omit<Skill, "id" | "status">;
const empty: Form = { name: "", category: SKILL_CATEGORIES[0]!, level: SKILL_LEVELS[1]!, years: 1, experience: "" };

function Skills() {
  const { skills } = useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [cat, setCat] = useState("All");

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (form.name.trim().length < 2) err.name = "Enter the skill name.";
    if (!(form.years >= 0 && form.years <= 50)) err.years = "Years must be between 0 and 50.";
    if (form.experience.trim().length < 10) err.experience = "Describe related work experience (min 10 characters).";
    setErrors(err); if (Object.keys(err).length) return;
    if (editing) setState((s) => ({ ...s, skills: s.skills.map((k) => (k.id === editing.id ? { ...k, ...form } : k)), activities: logActivity(s, `Updated skill: ${form.name}`) }));
    else setState((s) => ({ ...s, skills: [{ id: uid(), ...form, status: "Pending" }, ...s.skills], activities: logActivity(s, `Skill added for validation: ${form.name}`) }));
    toast.success(editing ? "Skill updated" : "Skill submitted for validation");
    setOpen(false);
  };
  const setStatus = (k: Skill, status: Status) => setState((s) => ({ ...s, skills: s.skills.map((x) => (x.id === k.id ? { ...x, status } : x)), activities: logActivity(s, `Skill ${k.name} marked ${status}`) }));
  const remove = (k: Skill) => { if (confirm(`Delete "${k.name}"?`)) { setState((s) => ({ ...s, skills: s.skills.filter((x) => x.id !== k.id) })); toast.success("Skill deleted"); } };
  const cats = ["All", ...SKILL_CATEGORIES.filter((c) => skills.some((s) => s.category === c))];
  const list = skills.filter((s) => cat === "All" || s.category === cat);

  return (
    <div>
      <PageHeader title="Skills validation" subtitle="Professional skills and work experience, grouped by category." action={<button className="btn btn-primary" onClick={() => { setEditing(null); setForm(empty); setErrors({}); setOpen(true); }}><Plus className="h-4 w-4" />Add skill</button>} />
      <div className="mb-5 flex flex-wrap gap-2">{cats.map((c) => <button key={c} className={`chip ${cat === c ? "chip-active" : ""}`} onClick={() => setCat(c)}>{c}</button>)}</div>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((k) => (
          <div key={k.id} className="card flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div><p className="text-xs font-semibold uppercase tracking-wide text-primary">{k.category}</p><h3 className="font-display text-lg font-semibold">{k.name}</h3></div>
              <StatusBadge status={k.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{k.level} · {k.years} yr{k.years === 1 ? "" : "s"}</p>
            <p className="mt-3 flex-1 text-sm">{k.experience}</p>
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
              <select className="input w-auto py-1 text-xs" aria-label="Simulated validation status" value={k.status} onChange={(e) => setStatus(k, e.target.value as Status)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
              <div className="flex-1" />
              <button className="btn-icon" aria-label={`Edit ${k.name}`} onClick={() => { setEditing(k); setForm({ name: k.name, category: k.category, level: k.level, years: k.years, experience: k.experience }); setErrors({}); setOpen(true); }}><Pencil className="h-4 w-4" /></button>
              <button className="btn-icon text-destructive" aria-label={`Delete ${k.name}`} onClick={() => remove(k)}><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {!list.length && <div className="card text-sm text-muted-foreground md:col-span-2">No skills yet.</div>}
      </div>
      <div className="mt-6"><DemoNote>Validation status is simulated for demonstration and is not an official skills certification.</DemoNote></div>
      <Modal open={open} title={editing ? "Edit skill" : "Add skill"} onClose={() => setOpen(false)}>
        <form onSubmit={save} className="space-y-4" noValidate>
          <Field label="Skill name" error={errors.name}><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Python" /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Category"><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{SKILL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Level"><select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>{SKILL_LEVELS.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Years" error={errors.years}><input type="number" min={0} max={50} className="input" value={form.years} onChange={(e) => setForm({ ...form, years: Number(e.target.value) })} /></Field>
          </div>
          <Field label="Work experience" error={errors.experience}><textarea className="input min-h-24" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="Where and how you used this skill…" /></Field>
          <div className="flex justify-end gap-2"><button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button><button className="btn btn-primary">Save</button></div>
        </form>
      </Modal>
    </div>
  );
}
