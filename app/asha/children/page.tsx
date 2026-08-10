"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Baby,
  BellRing,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardPlus,
  CloudOff,
  CloudUpload,
  FileText,
  HeartPulse,
  MapPin,
  Menu,
  MoreHorizontal,
  Network,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
  Syringe,
  UserRound,
  UsersRound,
  Weight,
  WifiOff,
  X,
} from "lucide-react";
import {
  ASHA_REGISTRY_STORAGE_KEY,
  ASHA_SYNC_STORAGE_KEY,
  ashaSeedChildren,
  type ChildRecord,
  type RiskLevel,
} from "@/lib/asha-data";

type EnrolmentForm = {
  name: string;
  ageMonths: string;
  sex: "Female" | "Male";
  guardian: string;
  village: string;
  phone: string;
  muac: string;
  weight: string;
};

const blankForm: EnrolmentForm = {
  name: "",
  ageMonths: "",
  sex: "Female",
  guardian: "",
  village: "",
  phone: "",
  muac: "",
  weight: "",
};

const riskStyles: Record<RiskLevel, string> = {
  high: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  moderate: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  low: "border-[#86efac]/30 bg-[#86efac]/10 text-[#86efac]",
};

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-[0.14em] ${riskStyles[level]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}

function getInitialRisk(muac: number): { risk: RiskLevel; score: number; flags: string[] } {
  if (muac < 11.5) return { risk: "high", score: 76, flags: ["MUAC below 11.5 cm"] };
  if (muac < 12.5) return { risk: "moderate", score: 46, flags: ["MUAC between 11.5–12.4 cm"] };
  return { risk: "low", score: 14, flags: [] };
}

export default function ChildRegistryPage() {
  const [children, setChildren] = useState<ChildRecord[]>(ashaSeedChildren);
  const [selectedId, setSelectedId] = useState(ashaSeedChildren[0].id);
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all");
  const [villageFilter, setVillageFilter] = useState("all");
  const [enrolmentOpen, setEnrolmentOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [form, setForm] = useState<EnrolmentForm>(blankForm);
  const [online, setOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ASHA_REGISTRY_STORAGE_KEY);
    const queued = localStorage.getItem(ASHA_SYNC_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ChildRecord[];
        if (parsed.length) {
          setChildren(parsed);
          setSelectedId(parsed[0].id);
        }
      } catch {
        localStorage.removeItem(ASHA_REGISTRY_STORAGE_KEY);
      }
    }
    if (queued) setPendingSync(Number(queued) || 0);
    setOnline(navigator.onLine);
    setReady(true);

    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(ASHA_REGISTRY_STORAGE_KEY, JSON.stringify(children));
    localStorage.setItem(ASHA_SYNC_STORAGE_KEY, String(pendingSync));
  }, [children, pendingSync, ready]);

  const villages = useMemo(
    () => Array.from(new Set(children.map((child) => child.village))).sort(),
    [children],
  );

  const selected = children.find((child) => child.id === selectedId) ?? children[0];

  const filteredChildren = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return children
      .filter((child) => riskFilter === "all" || child.risk === riskFilter)
      .filter((child) => villageFilter === "all" || child.village === villageFilter)
      .filter((child) => !normalized || [child.name, child.id, child.guardian, child.village]
        .some((value) => value.toLowerCase().includes(normalized)))
      .sort((a, b) => {
        const order: Record<RiskLevel, number> = { high: 0, moderate: 1, low: 2 };
        return order[a.risk] - order[b.risk] || a.followUpDays - b.followUpDays;
      });
  }, [children, query, riskFilter, villageFilter]);

  const stats = useMemo(() => ({
    total: children.length,
    underTwo: children.filter((child) => child.ageMonths < 24).length,
    high: children.filter((child) => child.risk === "high").length,
    due: children.filter((child) => child.followUpDays <= 4).length,
  }), [children]);

  const updateForm = <K extends keyof EnrolmentForm>(key: K, value: EnrolmentForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const enrolChild = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const muac = Number(form.muac);
    const initialRisk = getInitialRisk(muac);
    const record: ChildRecord = {
      id: `CH-${String(Date.now()).slice(-4)}`,
      name: form.name.trim(),
      ageMonths: Number(form.ageMonths),
      sex: form.sex,
      village: form.village.trim(),
      guardian: form.guardian.trim(),
      lastVisit: "Enrolled just now · saved on device",
      risk: initialRisk.risk,
      riskScore: initialRisk.score,
      muac,
      weight: Number(form.weight),
      followUpDays: initialRisk.risk === "high" ? 0 : initialRisk.risk === "moderate" ? 3 : 14,
      flags: initialRisk.flags,
    };
    setChildren((current) => [record, ...current]);
    setSelectedId(record.id);
    setPendingSync((current) => current + 1);
    setForm(blankForm);
    setEnrolmentOpen(false);
  };

  const markVisitComplete = () => {
    if (!selected) return;
    setChildren((current) => current.map((child) => child.id === selected.id
      ? {
        ...child,
        lastVisit: "Visited just now · saved on device",
        followUpDays: child.risk === "high" ? 1 : child.risk === "moderate" ? 7 : 30,
      }
      : child));
    setPendingSync((current) => current + 1);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu className="h-5 w-5" /></button>
            <Link href="/asha" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center border border-[#86efac]/30 bg-[#86efac]/10">
                <img src="/logo.png" alt="METIS" className="h-5 w-5 object-contain" />
              </span>
              <div><p className="font-display text-lg leading-none">METIS <span className="text-[#86efac]">Field</span></p><p className="mt-1 text-[8px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Child registry</p></div>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`flex h-9 items-center gap-2 border px-3 text-[10px] font-mono uppercase tracking-wider ${online ? "border-[#86efac]/20 text-[#86efac]" : "border-amber-300/20 text-amber-200"}`}>
              {online ? <Network className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}<span className="hidden sm:inline">{online ? "Online" : "Offline"}</span>
            </span>
            <span className="flex h-9 items-center gap-2 border border-foreground/10 px-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {online ? <CloudUpload className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}<span className="hidden sm:inline">{pendingSync ? `${pendingSync} to sync` : "All synced"}</span>
            </span>
            <div className="hidden items-center gap-2 border-l border-foreground/10 pl-3 md:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#86efac]/15 text-xs text-[#86efac]">AS</span>
              <div><p className="text-xs font-medium">Anjali Shinde</p><p className="text-[9px] font-mono uppercase text-muted-foreground">ASHA · Ward 14</p></div>
            </div>
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close navigation" className="absolute inset-0 bg-black/70" onClick={() => setMobileNavOpen(false)} />
          <div className="relative h-full w-72 border-r border-foreground/10 bg-card p-5">
            <div className="mb-8 flex items-center justify-between"><span className="font-display text-xl">METIS Field</span><button onClick={() => setMobileNavOpen(false)}><X className="h-5 w-5" /></button></div>
            <nav className="space-y-2 text-sm">
              <Link href="/asha" className="flex items-center gap-3 border border-transparent px-4 py-3 text-muted-foreground"><Activity className="h-4 w-4" /> Today’s overview</Link>
              <Link href="/asha/children" className="flex items-center gap-3 border border-[#86efac]/30 bg-[#86efac]/10 px-4 py-3 text-[#86efac]"><UsersRound className="h-4 w-4" /> Child registry</Link>
              <Link href="/asha/follow-ups" className="flex items-center gap-3 px-4 py-3 text-muted-foreground"><CalendarClock className="h-4 w-4" /> Follow-up queue</Link>
              <Link href="/asha/map" className="flex items-center gap-3 px-4 py-3 text-muted-foreground"><MapPin className="h-4 w-4" /> Village map</Link>
            </nav>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-64px)] border-r border-foreground/10 px-4 py-6 lg:block">
          <nav className="space-y-1">
            <Link href="/asha" className="flex items-center gap-3 px-3 py-2.5 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground"><Activity className="h-4 w-4" />Today’s overview</Link>
            <Link href="/asha/children" className="flex items-center gap-3 bg-[#86efac]/10 px-3 py-2.5 text-xs text-[#86efac]"><Baby className="h-4 w-4" />Child registry</Link>
            <Link href="/asha/follow-ups" className="flex items-center gap-3 px-3 py-2.5 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground"><CalendarClock className="h-4 w-4" />Follow-up queue<span className="ml-auto font-mono text-[9px]">{stats.due}</span></Link>
            <Link href="/asha/map" className="flex items-center gap-3 px-3 py-2.5 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground"><MapPin className="h-4 w-4" />Village map</Link>
            <span className="flex items-center gap-3 px-3 py-2.5 text-xs text-muted-foreground"><BellRing className="h-4 w-4" />Alerts<span className="ml-auto font-mono text-[9px]">{stats.high}</span></span>
          </nav>
          <div className="mt-8 border border-foreground/10 bg-foreground/[0.02] p-4">
            <div className="flex items-center gap-2 text-[#86efac]"><ShieldCheck className="h-4 w-4" /><span className="text-[10px] font-mono uppercase tracking-wider">Offline registry</span></div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">Enrolments and visit updates remain available without a network.</p>
          </div>
          <Link href="/dashboard" className="mt-4 flex items-center gap-2 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Family dashboard</Link>
        </aside>

        <section className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#86efac]"><span className="h-px w-8 bg-[#86efac]/60" /> Household records · Ward 14</div>
              <h1 className="font-display text-3xl sm:text-4xl">Child registry</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">A single offline record for enrolment, screening history, risk and follow-up.</p>
            </div>
            <button onClick={() => setEnrolmentOpen(true)} className="flex h-11 items-center justify-center gap-2 bg-[#86efac] px-5 text-xs font-bold text-black hover:bg-[#a2f3bf]"><Plus className="h-4 w-4" /> Enrol a child</button>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              { label: "Registered", value: stats.total, icon: UsersRound, tone: "text-foreground" },
              { label: "Under 2 years", value: stats.underTwo, icon: Baby, tone: "text-[#86efac]" },
              { label: "High risk", value: stats.high, icon: AlertTriangle, tone: "text-rose-300" },
              { label: "Visits due", value: stats.due, icon: CalendarClock, tone: "text-amber-200" },
            ].map((stat) => (
              <div key={stat.label} className="border border-foreground/10 bg-foreground/[0.02] p-4 sm:p-5">
                <div className="flex items-start justify-between"><div><p className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p><p className={`mt-3 font-display text-3xl ${stat.tone}`}>{stat.value}</p></div><stat.icon className={`h-4 w-4 ${stat.tone}`} /></div>
              </div>
            ))}
          </div>

          {enrolmentOpen && (
            <div className="mb-6 border border-[#86efac]/25 bg-[#86efac]/[0.025] p-5 sm:p-6">
              <div className="mb-6 flex items-start justify-between"><div><p className="text-[10px] font-mono uppercase tracking-wider text-[#86efac]">New household record</p><h2 className="mt-2 font-display text-2xl">Enrol a child</h2><p className="mt-1 text-xs text-muted-foreground">The record is saved on this device immediately.</p></div><button aria-label="Close enrolment" onClick={() => setEnrolmentOpen(false)}><X className="h-5 w-5 text-muted-foreground" /></button></div>
              <form onSubmit={enrolChild}>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { key: "name", label: "Child’s full name", type: "text", placeholder: "e.g. Kavya Patil" },
                    { key: "ageMonths", label: "Age in months", type: "number", placeholder: "18" },
                    { key: "guardian", label: "Caregiver name", type: "text", placeholder: "Parent or guardian" },
                    { key: "village", label: "Village / hamlet", type: "text", placeholder: "Kondhwa" },
                    { key: "phone", label: "Caregiver phone", type: "tel", placeholder: "+91 98••• •••••" },
                    { key: "muac", label: "Baseline MUAC (cm)", type: "number", placeholder: "12.5", step: "0.1" },
                    { key: "weight", label: "Baseline weight (kg)", type: "number", placeholder: "8.2", step: "0.1" },
                  ].map((field) => (
                    <label key={field.key} className="grid gap-2"><span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{field.label}</span><input required type={field.type} step={field.step} min={field.type === "number" ? "0" : undefined} value={form[field.key as keyof EnrolmentForm] as string} onChange={(event) => updateForm(field.key as keyof EnrolmentForm, event.target.value as never)} placeholder={field.placeholder} className="h-10 border border-foreground/10 bg-black/30 px-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-[#86efac]/50" /></label>
                  ))}
                  <label className="grid gap-2"><span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Sex</span><select value={form.sex} onChange={(event) => updateForm("sex", event.target.value as "Female" | "Male")} className="h-10 border border-foreground/10 bg-black/30 px-3 text-sm outline-none focus:border-[#86efac]/50"><option>Female</option><option>Male</option></select></label>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-foreground/10 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 text-[10px] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-[#86efac]" /> Consent should be confirmed before enrolment</p><button type="submit" className="h-10 bg-[#86efac] px-5 text-xs font-bold text-black">Save child record</button></div>
              </form>
            </div>
          )}

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.55fr)_390px]">
            <section className="min-w-0 border border-foreground/10 bg-foreground/[0.015]">
              <div className="border-b border-foreground/10 p-4">
                <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_160px]">
                  <label className="relative"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, ID, caregiver or village" className="h-10 w-full border border-foreground/10 bg-black/20 pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground/60 focus:border-[#86efac]/40" /></label>
                  <label className="relative"><MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><select aria-label="Filter by village" value={villageFilter} onChange={(event) => setVillageFilter(event.target.value)} className="h-10 w-full appearance-none border border-foreground/10 bg-black/20 pl-9 pr-8 text-xs outline-none"><option value="all">All villages</option>{villages.map((village) => <option key={village} value={village}>{village}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /></label>
                  <label className="relative"><SlidersHorizontal className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><select aria-label="Filter by risk" value={riskFilter} onChange={(event) => setRiskFilter(event.target.value as "all" | RiskLevel)} className="h-10 w-full appearance-none border border-foreground/10 bg-black/20 pl-9 pr-8 text-xs outline-none"><option value="all">All risk levels</option><option value="high">High risk</option><option value="moderate">Moderate risk</option><option value="low">Low risk</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /></label>
                </div>
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] text-left">
                  <thead><tr className="border-b border-foreground/10 text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground"><th className="px-4 py-3 font-normal">Child</th><th className="px-4 py-3 font-normal">Location</th><th className="px-4 py-3 font-normal">Latest measures</th><th className="px-4 py-3 font-normal">Risk</th><th className="px-4 py-3 font-normal">Follow-up</th><th className="w-10 px-3 py-3" /></tr></thead>
                  <tbody>{filteredChildren.map((child) => (
                    <tr key={child.id} onClick={() => setSelectedId(child.id)} className={`cursor-pointer border-b border-foreground/10 transition-colors last:border-0 ${selectedId === child.id ? "bg-[#86efac]/[0.06]" : "hover:bg-foreground/[0.03]"}`}>
                      <td className="px-4 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground/5 font-display text-sm">{child.name.charAt(0)}</span><div><p className="text-sm font-medium">{child.name}</p><p className="mt-1 text-[9px] font-mono uppercase text-muted-foreground">{child.id} · {child.ageMonths} months · {child.sex}</p></div></div></td>
                      <td className="px-4 py-4"><p className="text-xs">{child.village}</p><p className="mt-1 text-[10px] text-muted-foreground">{child.guardian}</p></td>
                      <td className="px-4 py-4"><p className="text-xs">{child.weight} kg · {child.muac} cm</p><p className="mt-1 text-[10px] text-muted-foreground">{child.lastVisit}</p></td>
                      <td className="px-4 py-4"><RiskBadge level={child.risk} /></td>
                      <td className="px-4 py-4"><p className={`text-xs ${child.followUpDays <= 4 ? "text-amber-200" : "text-foreground"}`}>{child.followUpDays === 0 ? "Today" : `In ${child.followUpDays} days`}</p></td>
                      <td className="px-3 py-4"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>

              <div className="divide-y divide-foreground/10 md:hidden">
                {filteredChildren.map((child) => (
                  <button key={child.id} onClick={() => setSelectedId(child.id)} className={`w-full p-4 text-left ${selectedId === child.id ? "bg-[#86efac]/[0.06]" : ""}`}>
                    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium">{child.name}</p><p className="mt-1 text-[9px] font-mono uppercase text-muted-foreground">{child.id} · {child.ageMonths} months · {child.village}</p></div><RiskBadge level={child.risk} /></div>
                    <div className="mt-3 flex justify-between text-[10px] text-muted-foreground"><span>{child.weight} kg · MUAC {child.muac} cm</span><span>{child.followUpDays === 0 ? "Due today" : `${child.followUpDays}d`}</span></div>
                  </button>
                ))}
              </div>
              {!filteredChildren.length && <div className="p-12 text-center"><Search className="mx-auto h-5 w-5 text-muted-foreground" /><p className="mt-3 text-xs text-muted-foreground">No child records match these filters.</p></div>}
              <div className="flex items-center justify-between border-t border-foreground/10 px-4 py-3 text-[10px] text-muted-foreground"><span>{filteredChildren.length} of {children.length} records</span><span>Risk-priority order</span></div>
            </section>

            {selected && (
              <aside className="h-fit border border-foreground/10 bg-foreground/[0.015] 2xl:sticky 2xl:top-24">
                <div className="border-b border-foreground/10 p-5">
                  <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#86efac]/10 font-display text-lg text-[#86efac]">{selected.name.charAt(0)}</span><div><h2 className="font-display text-xl">{selected.name}</h2><p className="mt-1 text-[9px] font-mono uppercase text-muted-foreground">{selected.id} · {selected.ageMonths} months</p></div></div><RiskBadge level={selected.risk} /></div>
                  <div className="mt-5 grid grid-cols-2 gap-2"><button onClick={markVisitComplete} className="flex h-9 items-center justify-center gap-2 bg-[#86efac] text-[10px] font-bold text-black"><CheckCircle2 className="h-3.5 w-3.5" /> Complete visit</button><Link href="/asha" className="flex h-9 items-center justify-center gap-2 border border-foreground/15 text-[10px] font-medium hover:bg-foreground/5"><ClipboardPlus className="h-3.5 w-3.5" /> New screening</Link></div>
                </div>
                <div className="space-y-5 p-5">
                  <div><p className="mb-3 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Household details</p><div className="space-y-3 text-xs"><div className="flex items-center gap-3"><UserRound className="h-4 w-4 text-muted-foreground" /><span>{selected.guardian}</span></div><div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{selected.village}, Ward 14</span></div><div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Phone available offline</span></div></div></div>
                  <div className="border-t border-foreground/10 pt-5"><p className="mb-3 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Latest measurements</p><div className="grid grid-cols-2 gap-2"><div className="border border-foreground/10 bg-black/20 p-3"><Weight className="h-3.5 w-3.5 text-[#86efac]" /><p className="mt-2 text-lg font-display">{selected.weight} kg</p><p className="text-[9px] text-muted-foreground">Weight</p></div><div className="border border-foreground/10 bg-black/20 p-3"><HeartPulse className="h-3.5 w-3.5 text-[#86efac]" /><p className="mt-2 text-lg font-display">{selected.muac} cm</p><p className="text-[9px] text-muted-foreground">MUAC</p></div></div></div>
                  <div className="border-t border-foreground/10 pt-5"><p className="mb-3 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Risk evidence</p>{selected.flags.length ? <div className="space-y-2">{selected.flags.map((flag) => <div key={flag} className="flex items-start gap-2 border border-foreground/10 bg-black/15 p-2.5 text-[10px] leading-relaxed"><AlertTriangle className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${selected.risk === "high" ? "text-rose-300" : "text-amber-200"}`} />{flag}</div>)}</div> : <div className="flex items-center gap-2 text-xs text-[#86efac]"><CheckCircle2 className="h-4 w-4" />No active risk flags</div>}</div>
                  <div className="border-t border-foreground/10 pt-5"><div className="flex items-center justify-between"><div><p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Next follow-up</p><p className="mt-1 text-sm font-medium">{selected.followUpDays === 0 ? "Due today" : `In ${selected.followUpDays} days`}</p></div><CalendarClock className="h-5 w-5 text-[#86efac]" /></div></div>
                  <button className="flex w-full items-center justify-between border border-foreground/10 p-3 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground"><span className="flex items-center gap-2"><FileText className="h-4 w-4" /> View complete history</span><ChevronRight className="h-4 w-4" /></button>
                </div>
              </aside>
            )}
          </div>

          <div className="mt-6 flex items-start gap-3 border border-foreground/10 bg-foreground/[0.02] p-4 text-[10px] leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#86efac]" />Health records in this local preview are stored only in this browser. Production deployment should use approved consent, access-control, encryption, audit and health-data retention policies.</div>
        </section>
      </div>
    </main>
  );
}
