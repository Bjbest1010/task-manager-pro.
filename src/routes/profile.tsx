import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Pencil } from "lucide-react";
import { toast } from "sonner";
import { logActivity, setState, useApp, type Profile } from "@/lib/store";
import { Field, PageHeader } from "@/components/ui-bits";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [
    { title: "Profile — Task Manager Pro" },
    { name: "description", content: "Your personal information and educational and professional background." },
    { property: "og:title", content: "Profile — Task Manager Pro" },
    { property: "og:description", content: "Your personal information and background." },
  ] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, credentials, skills } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Profile>(profile);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});
  useEffect(() => { if (!editing) setForm(profile); }, [profile, editing]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (form.name.trim().length < 2) err.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Enter a valid email address.";
    if (form.phone && !/^[+\d][\d\s()-]{6,}$/.test(form.phone)) err.phone = "Enter a valid phone number.";
    setErrors(err); if (Object.keys(err).length) return;
    setState((s) => ({ ...s, profile: form, activities: logActivity(s, "Profile updated") }));
    setEditing(false); toast.success("Profile saved");
  };
  const f = (k: keyof Profile) => ({ value: form[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value }) });
  const initials = profile.name.split(" ").map((p) => p[0]).slice(0, 2).join("");

  if (editing) return (
    <div>
      <PageHeader title="Edit profile" />
      <form onSubmit={save} className="card space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name}><input className="input" {...f("name")} /></Field>
          <Field label="Headline"><input className="input" {...f("headline")} /></Field>
          <Field label="Email" error={errors.email}><input type="email" className="input" {...f("email")} /></Field>
          <Field label="Phone" error={errors.phone}><input className="input" {...f("phone")} /></Field>
          <Field label="Location"><input className="input" {...f("location")} /></Field>
        </div>
        <Field label="Educational background (one per line)"><textarea className="input min-h-24" {...f("education")} /></Field>
        <Field label="Professional background (one per line)"><textarea className="input min-h-24" {...f("experience")} /></Field>
        <div className="flex justify-end gap-2"><button type="button" className="btn btn-outline" onClick={() => { setEditing(false); setErrors({}); }}>Cancel</button><button className="btn btn-primary">Save profile</button></div>
      </form>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" action={<button className="btn btn-primary" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />Edit profile</button>} />
      <div className="card flex flex-wrap items-center gap-5">
        <span className="avatar !h-20 !w-20 !text-2xl">{initials}</span>
        <div className="flex-1">
          <h2 className="font-display text-2xl font-bold">{profile.name}</h2>
          <p className="text-muted-foreground">{profile.headline}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{profile.email}</span>
            {profile.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{profile.phone}</span>}
            {profile.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{profile.location}</span>}
          </div>
        </div>
        <div className="flex gap-6 text-center"><div><p className="font-display text-2xl font-bold">{credentials.length}</p><p className="text-xs text-muted-foreground">Credentials</p></div><div><p className="font-display text-2xl font-bold">{skills.length}</p><p className="text-xs text-muted-foreground">Skills</p></div></div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {([["Educational background", profile.education], ["Professional background", profile.experience]] as const).map(([t, v]) => (
          <div key={t} className="card"><h3 className="mb-3 font-display font-semibold">{t}</h3>
            <ul className="space-y-2 text-sm">{v.split("\n").filter(Boolean).map((l) => <li key={l} className="border-l-2 border-primary pl-3">{l}</li>)}</ul>
            {!v.trim() && <p className="text-sm text-muted-foreground">Nothing added yet.</p>}</div>
        ))}
      </div>
    </div>
  );
}
