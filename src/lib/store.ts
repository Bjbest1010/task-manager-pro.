import { useEffect, useSyncExternalStore } from "react";

export type Status = "Pending" | "Under Review" | "Approved" | "Rejected";
export const STATUSES: Status[] = ["Pending", "Under Review", "Approved", "Rejected"];

export interface DocMeta { name: string; size: number; type: string }
export interface Credential {
  id: string; title: string; institution: string; type: string; awardDate: string;
  details: string; documents: DocMeta[]; status: Status; feedback: string; submittedAt: string;
}
export interface Skill {
  id: string; name: string; category: string; level: string; years: number;
  experience: string; status: Status;
}
export interface Task {
  id: string; title: string; due: string; priority: "Low" | "Medium" | "High"; done: boolean;
}
export interface Activity { id: string; text: string; at: string }
export interface Profile {
  name: string; email: string; phone: string; location: string; headline: string;
  education: string; experience: string;
}
export interface AppState {
  credentials: Credential[]; skills: Skill[]; tasks: Task[]; activities: Activity[]; profile: Profile;
}

export const CREDENTIAL_TYPES = ["Bachelor's Degree", "Master's Degree", "Doctorate", "Diploma", "Professional Certificate", "Licence", "Short Course"];
export const SKILL_CATEGORIES = ["Technical", "Management", "Communication", "Data & Analytics", "Design", "Languages"];
export const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

const seed = (): AppState => ({
  credentials: [
    { id: "c1", title: "BSc Computer Science", institution: "University of Nairobi", type: "Bachelor's Degree", awardDate: "2021-11-20", details: "First Class Honours. Thesis on distributed systems.", documents: [{ name: "bsc_certificate.pdf", size: 482113, type: "application/pdf" }, { name: "transcript.pdf", size: 912004, type: "application/pdf" }], status: "Approved", feedback: "Documents matched institution records (demo).", submittedAt: "2026-09-02" },
    { id: "c2", title: "AWS Certified Solutions Architect", institution: "Amazon Web Services", type: "Professional Certificate", awardDate: "2024-03-14", details: "Associate level, credential ID AWS-ASA-88231.", documents: [{ name: "aws_badge.png", size: 120533, type: "image/png" }], status: "Under Review", feedback: "", submittedAt: "2026-11-10" },
    { id: "c3", title: "MSc Data Science", institution: "University of Edinburgh", type: "Master's Degree", awardDate: "2023-07-01", details: "Distinction. Dissertation on NLP for low-resource languages.", documents: [{ name: "msc_certificate.pdf", size: 530221, type: "application/pdf" }], status: "Pending", feedback: "", submittedAt: "2026-11-22" },
    { id: "c4", title: "PRINCE2 Foundation", institution: "AXELOS", type: "Professional Certificate", awardDate: "2020-05-09", details: "Project management methodology.", documents: [{ name: "prince2.jpg", size: 230112, type: "image/jpeg" }], status: "Rejected", feedback: "Scanned copy is blurry and the candidate number is unreadable. Please upload a clearer scan.", submittedAt: "2026-10-18" },
  ],
  skills: [
    { id: "s1", name: "React & TypeScript", category: "Technical", level: "Expert", years: 5, experience: "Lead front-end developer at Safari Tech, 2022–present.", status: "Approved" },
    { id: "s2", name: "Team Leadership", category: "Management", level: "Advanced", years: 3, experience: "Managed a team of 6 engineers.", status: "Under Review" },
    { id: "s3", name: "SQL & Data Modelling", category: "Data & Analytics", level: "Advanced", years: 4, experience: "Designed analytics warehouse for retail client.", status: "Pending" },
    { id: "s4", name: "French", category: "Languages", level: "Intermediate", years: 2, experience: "DELF B1 certificate holder.", status: "Approved" },
  ],
  tasks: [
    { id: "t1", title: "Upload clearer PRINCE2 scan", due: "2026-11-25", priority: "High", done: false },
    { id: "t2", title: "Request MSc transcript from university", due: "2026-12-03", priority: "Medium", done: false },
    { id: "t3", title: "Add references for leadership skill", due: "2026-12-10", priority: "Low", done: false },
    { id: "t4", title: "Submit BSc degree for verification", due: "2026-09-01", priority: "High", done: true },
  ],
  activities: [
    { id: "a1", text: "MSc Data Science submitted for verification", at: "2026-11-22T09:12:00Z" },
    { id: "a2", text: "AWS certificate moved to Under Review", at: "2026-11-15T14:30:00Z" },
    { id: "a3", text: "PRINCE2 Foundation was rejected — action needed", at: "2026-10-25T11:05:00Z" },
    { id: "a4", text: "BSc Computer Science approved", at: "2026-09-12T08:40:00Z" },
  ],
  profile: { name: "Bishara Bare Sahal", email: "bishara.sahal@example.com", phone: "+254 712 345 678", location: "Nairobi, Kenya", headline: "Software Engineer & Data Scientist", education: "MSc Data Science — University of Edinburgh (2023)\nBSc Computer Science — University of Nairobi (2021)", experience: "Lead Front-end Developer — Safari Tech (2022–present)\nSoftware Engineer — Kijiji Labs (2021–2022)" },
});

const KEY = "tmp-state-v2";
let state: AppState | null = null;
const listeners = new Set<() => void>();
let loaded = false;

function get(): AppState { if (!state) state = seed(); return state; }
function load() {
  if (loaded) return; loaded = true;
  try { const raw = localStorage.getItem(KEY); if (raw) { state = JSON.parse(raw); listeners.forEach((l) => l()); } } catch { /* ignore */ }
}
export function setState(fn: (s: AppState) => AppState) {
  state = fn(get());
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
export function resetDemo() { setState(() => seed()); }
let serverSnap: AppState | null = null;
export function useApp(): AppState {
  useEffect(load, []);
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    get,
    () => (serverSnap ??= seed()),
  );
}
export const uid = () => crypto.randomUUID();
export function logActivity(s: AppState, text: string): Activity[] {
  return [{ id: uid(), text, at: new Date().toISOString() }, ...s.activities].slice(0, 30);
}
export const statusProgress: Record<Status, number> = { Pending: 25, "Under Review": 60, Approved: 100, Rejected: 100 };
