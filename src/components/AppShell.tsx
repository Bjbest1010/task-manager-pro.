import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, GraduationCap, ShieldCheck, Wrench, ListChecks, UserRound, Menu, X, RotateCcw } from "lucide-react";
import { resetDemo, useApp } from "@/lib/store";
import { toast } from "sonner";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/credentials", label: "Credentials", icon: GraduationCap },
  { to: "/verification", label: "Verification", icon: ShieldCheck },
  { to: "/skills", label: "Skills", icon: Wrench },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);
  const { profile } = useApp();
  const initials = profile.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="flex items-center justify-between px-5 py-6">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="logo-mark"><ShieldCheck className="h-5 w-5" /></span>
            <span className="font-display text-lg font-bold">Task Manager Pro</span>
          </Link>
          <button className="btn-icon md:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-4 w-4" /></button>
        </div>
        <p className="px-5 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">Track 1 · Credentials</p>
        <nav className="flex flex-col gap-1 px-3">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className={`nav-item ${path === n.to ? "nav-active" : ""}`}>
              <n.icon className="h-4 w-4" />{n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <button className="nav-item w-full" onClick={() => { if (confirm("Reset all data to the demo data?")) { resetDemo(); toast.success("Demo data restored"); } }}>
            <RotateCcw className="h-4 w-4" />Reset demo data
          </button>
          <p className="mt-3 text-xs leading-relaxed text-sidebar-foreground/60">Prototype: data and documents stay in this browser only. Not an official recognition service.</p>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-foreground/30 md:hidden" onClick={() => setOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="topbar">
          <button className="btn-icon md:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <div className="flex-1" />
          <Link to="/profile" className="flex items-center gap-3">
            <span className="hidden text-right sm:block"><span className="block text-sm font-semibold">{profile.name}</span><span className="block text-xs text-muted-foreground">{profile.headline}</span></span>
            <span className="avatar">{initials}</span>
          </Link>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
