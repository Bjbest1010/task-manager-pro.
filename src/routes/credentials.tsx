import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Paperclip, Search } from "lucide-react";
import { toast } from "sonner";
import { CREDENTIAL_TYPES, logActivity, setState, uid, useApp, type Credential, type DocMeta } from "@/lib/store";
import { DemoNote, Field, Modal, PageHeader, StatusBadge, fmtDate, fmtSize } from "@/components/ui-bits";

export const Route = createFileRoute("/credentials")({
  head: () => ({ meta: [
    { title: "Credentials — Task Manager Pro" },
    { name: "description", content: "Add, edit and manage academic and professional qualifications with supporting documents." },
    { property: "og:title", content: "Credentials — Task Manager Pro" },
    { property: "og:description", content: "Add, edit and manage academic and professional qualifications." },
  ] }),
  component: Credentials,
});

type Form = { title: string; institution: string; type: string; awardDate: string; details: string; documents: DocMeta[] };
const empty: Form = { title: "", institution: "", type: CREDENTIAL_TYPES[0]!, awardDate: "", details: "", documents: [] };
const MAX = 10 * 1024 * 1024;

function Credentials() {
  const { credentials } = useApp();
  const [editing, setEditing] = useState<Credential | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [q, setQ] = useState("");

  const startNew = () => { setEditing(null); setForm(empty); setErrors({}); setOpen(true); };
  const startEdit = (c: Credential) => { setEditing(c); setForm({ title: c.title, institution: c.institution, type: c.type, awardDate: c.awardDate, details: c.details, documents: c.documents }); setErrors({}); setOpen(true); };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (form.title.trim().length < 3) err.title = "Enter a qualification title (min 3 characters).";
    if (form.institution.trim().length < 2) err.institution = "Enter the awarding institution.";
    if (!form.awardDate) err.awardDate = "Select the award date.";
    else if (form.awardDate > new Date().toISOString().slice(0, 10)) err.awardDate = "Award date cannot be in the future.";
    if (!form.documents.length) err.documents = "Attach at least one supporting document.";
    setErrors(err);
    if (Object.keys(err).length) return;
    if (editing) {
      setState((s) => ({ ...s, credentials: s.credentials.map((c) => (c.id === editing.id ? { ...c, ...form } : c)), activities: logActivity(s, `Updated credential: ${form.title}`) }));
      toast.success("Credential updated");
    } else {
      const c: Credential = { id: uid(), ...form, status: "Pending", feedback: "", submittedAt: new Date().toISOString().slice(0, 10) };
      setState((s) => ({ ...s, credentials: [c, ...s.credentials], activities: logActivity(s, `${form.title} submitted for verification`) }));
      toast.success("Credential submitted for verification");
    }
    setOpen(false);
  };
  const remove = (c: Credential) => {
    if (!confirm(`Delete "${c.title}"?`)) return;
    setState((s) => ({ ...s, credentials: s.credentials.filter((x) => x.id !== c.id), activities: logActivity(s, `Deleted credential: ${c.title}`) }));
    toast.success("Credential deleted");
  };
  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const ok: DocMeta[] = [];
    for (const f of Array.from(files)) {
      if (f.size > MAX) { toast.error(`${f.name} is larger than 10 MB`); continue; }
      ok.push({ name: f.name, size: f.size, type: f.type });
    }
    setForm((p) => ({ ...p, documents: [...p.documents, ...ok] }));
  };
  const list = credentials.filter((c) => `${c.title} ${c.institution} ${c.type}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader title="Credentials" subtitle="Your academic and professional qualifications." action={<button className="btn btn-primary" onClick={startNew}><Plus className="h-4 w-4" />Add credential</button>} />
      <div className="card">
        <div className="relative mb-4 max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><input className="input pl-9" placeholder="Search credentials…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search credentials" /></div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th>Qualification</th><th>Type</th><th>Awarded</th><th>Documents</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td><p className="font-semibold">{c.title}</p><p className="text-xs text-muted-foreground">{c.institution}</p></td>
                  <td className="whitespace-nowrap">{c.type}</td>
                  <td className="whitespace-nowrap">{fmtDate(c.awardDate)}</td>
                  <td>{c.documents.map((d) => <p key={d.name} className="flex items-center gap-1 text-xs"><Paperclip className="h-3 w-3" />{d.name}</p>)}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="whitespace-nowrap text-right">
                    <button className="btn-icon" onClick={() => startEdit(c)} aria-label={`Edit ${c.title}`}><Pencil className="h-4 w-4" /></button>
                    <button className="btn-icon text-destructive" onClick={() => remove(c)} aria-label={`Delete ${c.title}`}><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No credentials found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={open} title={editing ? "Edit credential" : "Add credential"} onClose={() => setOpen(false)}>
        <form onSubmit={save} className="space-y-4" noValidate>
          <Field label="Qualification title" error={errors.title}><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. BSc Computer Science" /></Field>
          <Field label="Institution" error={errors.institution}><input className="input" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="e.g. University of Nairobi" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Qualification type"><select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{CREDENTIAL_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Award date" error={errors.awardDate}><input type="date" className="input" value={form.awardDate} onChange={(e) => setForm({ ...form, awardDate: e.target.value })} /></Field>
          </div>
          <Field label="Credential details"><textarea className="input min-h-20" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Grade, credential ID, notes…" /></Field>
          <Field label="Supporting documents" error={errors.documents}>
            <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="input" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
          </Field>
          {form.documents.length > 0 && <ul className="space-y-1">{form.documents.map((d, i) => (
            <li key={d.name + i} className="flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-sm"><span className="truncate">{d.name} <span className="text-muted-foreground">· {fmtSize(d.size)}</span></span>
              <button type="button" className="btn-icon" aria-label={`Remove ${d.name}`} onClick={() => setForm({ ...form, documents: form.documents.filter((_, j) => j !== i) })}><Trash2 className="h-3.5 w-3.5" /></button></li>))}</ul>}
          <DemoNote>Prototype: only the file name and size are saved, locally in this browser. Files are not uploaded to any server.</DemoNote>
          <div className="flex justify-end gap-2"><button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button><button className="btn btn-primary">{editing ? "Save changes" : "Submit"}</button></div>
        </form>
      </Modal>
    </div>
  );
}
