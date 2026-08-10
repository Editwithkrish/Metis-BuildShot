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
  Check,
  ChevronRight,
  CircleUserRound,
  CloudOff,
  CloudUpload,
  HeartPulse,
  MapPin,
  Menu,
  Network,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  UserRoundSearch,
  Utensils,
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

type ScreeningForm = {
  name: string;
  ageMonths: string;
  sex: "Female" | "Male";
  village: string;
  guardian: string;
  muac: string;
  weight: string;
  fever: boolean;
  diarrhoea: boolean;
  oedema: boolean;
  poorFeeding: boolean;
  lethargy: boolean;
  missedVaccines: boolean;
};

const blankForm: ScreeningForm = {
  name: "",
  ageMonths: "",
  sex: "Female",
  village: "",
  guardian: "",
  muac: "",
  weight: "",
  fever: false,
  diarrhoea: false,
  oedema: false,
  poorFeeding: false,
  lethargy: false,
  missedVaccines: false,
};

const riskStyles: Record<RiskLevel, string> = {
  high: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  moderate: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  low: "border-[#86efac]/30 bg-[#86efac]/10 text-[#86efac]",
};

function calculateRisk(form: ScreeningForm) {
  const muac = Number(form.muac);
  const flags: string[] = [];
  let score = 8;

  if (muac > 0 && muac < 11.5) {
    score += 42;
    flags.push("MUAC below 11.5 cm");
  } else if (muac >= 11.5 && muac < 12.5) {
    score += 24;
    flags.push("MUAC between 11.5–12.4 cm");
  }
  if (form.oedema) {
    score += 35;
    flags.push("Bilateral oedema");
  }
  if (form.lethargy) {
    score += 22;
    flags.push("Unusually sleepy or difficult to wake");
  }
  if (form.poorFeeding) {
    score += 14;
    flags.push("Poor feeding");
  }
  if (form.fever) {
    score += 10;
    flags.push("Fever reported");
  }
  if (form.diarrhoea) {
    score += 10;
    flags.push("Diarrhoea reported");
  }
  if (form.missedVaccines) {
    score += 7;
    flags.push("Vaccination overdue");
  }

  const cappedScore = Math.min(score, 98);
  const risk: RiskLevel = form.oedema || form.lethargy || cappedScore >= 70
    ? "high"
    : cappedScore >= 35
      ? "moderate"
      : "low";

  return { risk, score: cappedScore, flags };
}

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-[0.16em] ${riskStyles[level]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}

function AgentCard({
  icon: Icon,
  name,
  finding,
  status,
}: {
  icon: typeof Activity;
  name: string;
  finding: string;
  status: "alert" | "review" | "clear";
}) {
  const color = status === "alert" ? "text-rose-300" : status === "review" ? "text-amber-200" : "text-[#86efac]";
  return (
    <div className="border border-foreground/10 bg-black/20 p-4 transition-colors hover:border-foreground/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center border border-current/20 bg-current/5 ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-medium">{name}</p>
            <p className="mt-0.5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Specialist monitor</p>
          </div>
        </div>
        <span className={`mt-1 h-2 w-2 rounded-full bg-current shadow-[0_0_10px_currentColor] ${color}`} />
      </div>
      <p className="mt-4 text-xs leading-relaxed text-foreground/70">{finding}</p>
    </div>
  );
}

export default function AshaPanel() {
  const [children, setChildren] = useState<ChildRecord[]>(ashaSeedChildren);
  const [selectedId, setSelectedId] = useState(ashaSeedChildren[0].id);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | RiskLevel>("all");
  const [screeningOpen, setScreeningOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [form, setForm] = useState<ScreeningForm>(blankForm);
  const [online, setOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(3);
  const [syncing, setSyncing] = useState(false);
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

  const selected = children.find((child) => child.id === selectedId) ?? children[0];
  const filteredChildren = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return children.filter((child) => {
      const matchesFilter = filter === "all" || child.risk === filter;
      const matchesSearch = !normalized || [child.name, child.id, child.village, child.guardian]
        .some((value) => value.toLowerCase().includes(normalized));
      return matchesFilter && matchesSearch;
    });
  }, [children, filter, query]);

  const counts = useMemo(() => ({
    high: children.filter((child) => child.risk === "high").length,
    moderate: children.filter((child) => child.risk === "moderate").length,
    due: children.filter((child) => child.followUpDays <= 4).length,
  }), [children]);

  const agentFindings = useMemo(() => {
    if (!selected) return [];
    return [
      {
        icon: Utensils,
        name: "Nutrition agent",
        finding: selected.muac < 11.5
          ? `Severe acute malnutrition threshold flagged at ${selected.muac} cm MUAC.`
          : selected.muac < 12.5
            ? `Moderate nutrition risk: ${selected.muac} cm MUAC needs close follow-up.`
            : `MUAC ${selected.muac} cm is above the current referral threshold.`,
        status: selected.muac < 11.5 ? "alert" : selected.muac < 12.5 ? "review" : "clear",
      },
      {
        icon: HeartPulse,
        name: "Danger-sign agent",
        finding: selected.flags.some((flag) => /oedema|sleepy|feeding/i.test(flag))
          ? "One or more IMNCI danger signs need immediate clinical assessment."
          : "No urgent danger sign is recorded in the latest screening.",
        status: selected.flags.some((flag) => /oedema|sleepy/i.test(flag)) ? "alert" : selected.flags.some((flag) => /feeding/i.test(flag)) ? "review" : "clear",
      },
      {
        icon: Syringe,
        name: "Immunisation agent",
        finding: selected.flags.some((flag) => /vaccination/i.test(flag))
          ? "Dose history needs verification and catch-up planning at the next visit."
          : "No vaccination gap is flagged in the current record.",
        status: selected.flags.some((flag) => /vaccination/i.test(flag)) ? "review" : "clear",
      },
      {
        icon: CalendarClock,
        name: "Follow-up agent",
        finding: selected.followUpDays === 0
          ? "Same-day referral and confirmation call are due."
          : `Home follow-up is scheduled in ${selected.followUpDays} day${selected.followUpDays === 1 ? "" : "s"}.`,
        status: selected.followUpDays === 0 ? "alert" : selected.followUpDays <= 4 ? "review" : "clear",
      },
    ] as const;
  }, [selected]);

  const updateForm = <K extends keyof ScreeningForm>(key: K, value: ScreeningForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitScreening = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = calculateRisk(form);
    const record: ChildRecord = {
      id: `CH-${String(Date.now()).slice(-4)}`,
      name: form.name,
      ageMonths: Number(form.ageMonths),
      sex: form.sex,
      village: form.village,
      guardian: form.guardian,
      lastVisit: "Just now · saved on device",
      risk: result.risk,
      riskScore: result.score,
      muac: Number(form.muac),
      weight: Number(form.weight),
      followUpDays: result.risk === "high" ? 0 : result.risk === "moderate" ? 3 : 14,
      flags: result.flags,
    };
    setChildren((current) => [record, ...current]);
    setSelectedId(record.id);
    setPendingSync((current) => current + 1);
    setForm(blankForm);
    setScreeningOpen(false);
  };

  const syncRecords = () => {
    if (!online || pendingSync === 0 || syncing) return;
    setSyncing(true);
    window.setTimeout(() => {
      setPendingSync(0);
      setSyncing(false);
    }, 900);
  };

  const recommendation = selected?.risk === "high"
    ? {
      label: "Refer now",
      title: "Urgent clinical assessment",
      body: "Keep the child warm, support feeding if safe, and arrange same-day referral to the nearest PHC/FRU. Confirm arrival by phone.",
      tone: "border-rose-400/30 bg-rose-400/[0.07]",
    }
    : selected?.risk === "moderate"
      ? {
        label: "Review in 72h",
        title: "Targeted home follow-up",
        body: "Counsel the caregiver on age-appropriate feeding, verify immunisation, and repeat MUAC and weight within three days.",
        tone: "border-amber-300/30 bg-amber-300/[0.06]",
      }
      : {
        label: "Routine follow-up",
        title: "Continue preventive care",
        body: "Reinforce feeding, hygiene and scheduled immunisation. Repeat growth monitoring during the next routine home visit.",
        tone: "border-[#86efac]/30 bg-[#86efac]/[0.05]",
      };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center border border-[#86efac]/30 bg-[#86efac]/10">
                <img src="/logo.png" alt="METIS" className="h-5 w-5 object-contain" />
              </span>
              <div>
                <p className="font-display text-lg leading-none">METIS <span className="text-[#86efac]">Field</span></p>
                <p className="mt-1 text-[8px] font-mono uppercase tracking-[0.2em] text-muted-foreground">ASHA decision support</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={syncRecords}
              disabled={!online || pendingSync === 0 || syncing}
              className="flex h-9 items-center gap-2 border border-foreground/10 px-3 text-[10px] font-mono uppercase tracking-wider transition-colors hover:bg-foreground/5 disabled:opacity-50"
            >
              {syncing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : online ? <CloudUpload className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{syncing ? "Syncing" : pendingSync ? `${pendingSync} to sync` : "Synced"}</span>
            </button>
            <span className={`flex h-9 items-center gap-2 border px-3 text-[10px] font-mono uppercase tracking-wider ${online ? "border-[#86efac]/20 text-[#86efac]" : "border-amber-300/20 text-amber-200"}`}>
              {online ? <Network className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{online ? "Online" : "Offline"}</span>
            </span>
            <div className="hidden items-center gap-2 border-l border-foreground/10 pl-3 md:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#86efac]/15 text-xs text-[#86efac]">AS</span>
              <div>
                <p className="text-xs font-medium">Anjali Shinde</p>
                <p className="text-[9px] font-mono uppercase text-muted-foreground">ASHA · Ward 14</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close navigation" className="absolute inset-0 bg-black/70" onClick={() => setMobileNavOpen(false)} />
          <div className="relative h-full w-72 border-r border-foreground/10 bg-card p-5">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-xl">METIS Field</span>
              <button onClick={() => setMobileNavOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="space-y-2 text-sm">
              {[
                { label: "Today’s overview", href: "/asha" },
                { label: "Child registry", href: "/asha/children" },
                { label: "Follow-up queue", href: "/asha/follow-ups" },
                { label: "Village map", href: "/asha/map" },
                { label: "Reports", href: "#" },
              ].map((item, index) => (
                <Link key={item.label} href={item.href} className={`flex w-full items-center gap-3 border px-4 py-3 text-left ${index === 0 ? "border-[#86efac]/30 bg-[#86efac]/10 text-[#86efac]" : "border-transparent text-muted-foreground"}`}>
                  <ChevronRight className="h-4 w-4" /> {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-64px)] border-r border-foreground/10 px-4 py-6 lg:block">
          <nav className="space-y-1">
            {[
              { icon: Activity, label: "Today’s overview", href: "/asha", active: true },
              { icon: Baby, label: "Child registry", href: "/asha/children" },
              { icon: CalendarClock, label: "Follow-up queue", href: "/asha/follow-ups", count: counts.due },
              { icon: MapPin, label: "Village map", href: "/asha/map" },
              { icon: BellRing, label: "Alerts", href: "#", count: counts.high },
            ].map((item) => (
              <Link href={item.href} key={item.label} className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors ${item.active ? "bg-[#86efac]/10 text-[#86efac]" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"}`}>
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.count ? <span className="font-mono text-[9px]">{item.count}</span> : null}
              </Link>
            ))}
          </nav>
          <div className="mt-8 border border-foreground/10 bg-foreground/[0.02] p-4">
            <div className="flex items-center gap-2 text-[#86efac]">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Offline ready</span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">Screenings stay encrypted on this device and enter the sync queue automatically.</p>
          </div>
          <Link href="/dashboard" className="mt-4 flex items-center gap-2 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Family dashboard
          </Link>
        </aside>

        <section className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#86efac]">
                <span className="h-px w-8 bg-[#86efac]/60" /> Sunday · 09 August 2026
              </div>
              <h1 className="max-w-3xl font-display text-3xl leading-tight sm:text-4xl">Early risk intelligence for every home visit.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Prioritise children, capture screening data without internet, and act on clear referral guidance.</p>
            </div>
            <button onClick={() => setScreeningOpen(true)} className="flex h-11 items-center justify-center gap-2 bg-[#86efac] px-5 text-xs font-bold text-black transition-colors hover:bg-[#a2f3bf]">
              <Plus className="h-4 w-4" /> Start new screening
            </button>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              { label: "Children monitored", value: children.length, detail: "Across 5 hamlets", icon: Baby, color: "text-foreground" },
              { label: "Urgent referrals", value: counts.high, detail: "Action today", icon: AlertTriangle, color: "text-rose-300" },
              { label: "Needs review", value: counts.moderate, detail: "Within 72 hours", icon: Stethoscope, color: "text-amber-200" },
              { label: "Follow-ups due", value: counts.due, detail: "Route optimised", icon: CalendarClock, color: "text-[#86efac]" },
            ].map((stat) => (
              <div key={stat.label} className="border border-foreground/10 bg-foreground/[0.02] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p>
                    <p className={`mt-3 font-display text-3xl ${stat.color}`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">{stat.detail}</p>
              </div>
            ))}
          </div>

          {screeningOpen && (
            <div className="mb-6 border border-[#86efac]/25 bg-[#86efac]/[0.025] p-5 sm:p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#86efac]"><Sparkles className="h-4 w-4" /><span className="text-[10px] font-mono uppercase tracking-wider">Rapid screening</span></div>
                  <h2 className="mt-2 font-display text-2xl">Record the child’s current condition</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Required fields are saved on this device before any sync attempt.</p>
                </div>
                <button aria-label="Close screening form" onClick={() => setScreeningOpen(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={submitScreening}>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { key: "name", label: "Child’s full name", type: "text", placeholder: "e.g. Kavya Patil" },
                    { key: "ageMonths", label: "Age in months", type: "number", placeholder: "18" },
                    { key: "village", label: "Village / hamlet", type: "text", placeholder: "Kondhwa" },
                    { key: "guardian", label: "Caregiver name", type: "text", placeholder: "Parent or guardian" },
                    { key: "muac", label: "MUAC (cm)", type: "number", placeholder: "12.5", step: "0.1" },
                    { key: "weight", label: "Weight (kg)", type: "number", placeholder: "8.2", step: "0.1" },
                  ].map((field) => (
                    <label key={field.key} className="grid gap-2">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{field.label}</span>
                      <input
                        required
                        type={field.type}
                        step={field.step}
                        min={field.type === "number" ? "0" : undefined}
                        value={form[field.key as keyof ScreeningForm] as string}
                        onChange={(event) => updateForm(field.key as keyof ScreeningForm, event.target.value as never)}
                        placeholder={field.placeholder}
                        className="h-10 border border-foreground/10 bg-black/30 px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-[#86efac]/50"
                      />
                    </label>
                  ))}
                  <label className="grid gap-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Sex</span>
                    <select value={form.sex} onChange={(event) => updateForm("sex", event.target.value as "Female" | "Male")} className="h-10 border border-foreground/10 bg-black/30 px-3 text-sm outline-none focus:border-[#86efac]/50">
                      <option>Female</option><option>Male</option>
                    </select>
                  </label>
                </div>
                <div className="mt-5">
                  <p className="mb-3 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Observed or reported signs</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {[
                      ["fever", "Fever"], ["diarrhoea", "Diarrhoea"], ["oedema", "Bilateral oedema"],
                      ["poorFeeding", "Poor feeding"], ["lethargy", "Lethargy"], ["missedVaccines", "Missed vaccine"],
                    ].map(([key, label]) => (
                      <label key={key} className={`flex min-h-10 items-center gap-2 border px-3 text-xs transition-colors ${form[key as keyof ScreeningForm] ? "border-[#86efac]/35 bg-[#86efac]/10" : "border-foreground/10 bg-black/20"}`}>
                        <input type="checkbox" checked={form[key as keyof ScreeningForm] as boolean} onChange={(event) => updateForm(key as keyof ScreeningForm, event.target.checked as never)} className="accent-[#86efac]" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-foreground/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-2 text-[10px] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-[#86efac]" /> Decision support only · clinical judgement remains essential</p>
                  <button type="submit" className="h-10 bg-[#86efac] px-5 text-xs font-bold text-black hover:bg-[#a2f3bf]">Analyse and save offline</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.5fr)]">
            <section className="border border-foreground/10 bg-foreground/[0.015]">
              <div className="border-b border-foreground/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl">Priority registry</h2>
                    <p className="mt-1 text-[10px] text-muted-foreground">Sorted for today’s action</p>
                  </div>
                  <UserRoundSearch className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search child, village or ID" className="h-10 w-full border border-foreground/10 bg-black/20 pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground/60 focus:border-[#86efac]/40" />
                </div>
                <div className="mt-3 flex gap-1 overflow-x-auto">
                  {(["all", "high", "moderate", "low"] as const).map((item) => (
                    <button key={item} onClick={() => setFilter(item)} className={`shrink-0 px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider ${filter === item ? "bg-foreground text-background" : "text-muted-foreground hover:bg-foreground/5"}`}>{item}</button>
                  ))}
                </div>
              </div>
              <div className="max-h-[570px] overflow-y-auto">
                {filteredChildren.map((child) => (
                  <button key={child.id} onClick={() => setSelectedId(child.id)} className={`w-full border-b border-foreground/10 p-4 text-left transition-colors ${selectedId === child.id ? "bg-[#86efac]/[0.06]" : "hover:bg-foreground/[0.03]"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground/5 font-display text-sm">{child.name.charAt(0)}</span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{child.name}</p>
                          <p className="mt-1 truncate text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{child.id} · {child.ageMonths} months · {child.village}</p>
                        </div>
                      </div>
                      <RiskBadge level={child.risk} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{child.lastVisit}</span><span>MUAC {child.muac} cm</span>
                    </div>
                  </button>
                ))}
                {!filteredChildren.length && <p className="p-8 text-center text-xs text-muted-foreground">No children match this filter.</p>}
              </div>
            </section>

            {selected && (
              <section className="space-y-5">
                <div className="border border-foreground/10 bg-foreground/[0.015] p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#86efac]/10 font-display text-xl text-[#86efac]">{selected.name.charAt(0)}</span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-2xl">{selected.name}</h2><RiskBadge level={selected.risk} /></div>
                        <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{selected.ageMonths} months · {selected.sex} · Caregiver: {selected.guardian}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Composite risk</p>
                      <p className={`mt-1 font-display text-4xl ${selected.risk === "high" ? "text-rose-300" : selected.risk === "moderate" ? "text-amber-200" : "text-[#86efac]"}`}>{selected.riskScore}<span className="text-sm text-muted-foreground">/100</span></p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-px bg-foreground/10">
                    {[
                      ["MUAC", `${selected.muac} cm`], ["Weight", `${selected.weight} kg`], ["Follow-up", selected.followUpDays === 0 ? "Today" : `${selected.followUpDays} days`],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-card p-3 sm:p-4"><p className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1.5 text-sm font-medium">{value}</p></div>
                    ))}
                  </div>
                </div>

                <div className={`border p-5 sm:p-6 ${recommendation.tone}`}>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="max-w-2xl">
                      <p className="text-[9px] font-mono uppercase tracking-[0.16em] text-muted-foreground">Decision support · {recommendation.label}</p>
                      <h3 className="mt-2 font-display text-2xl">{recommendation.title}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-foreground/70">{recommendation.body}</p>
                    </div>
                    <button className="flex h-10 shrink-0 items-center justify-center gap-2 border border-foreground/20 bg-foreground px-4 text-xs font-bold text-background hover:bg-foreground/90">
                      {selected.risk === "high" ? <><Stethoscope className="h-4 w-4" /> Start referral</> : <><CalendarClock className="h-4 w-4" /> Schedule visit</>}
                    </button>
                  </div>
                  {selected.flags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-foreground/10 pt-4">
                      {selected.flags.map((flag) => <span key={flag} className="border border-foreground/10 bg-black/15 px-2.5 py-1 text-[9px] text-foreground/70">{flag}</span>)}
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div><h3 className="font-display text-xl">Multi-agent monitor</h3><p className="mt-1 text-[10px] text-muted-foreground">Four checks, one coordinated decision</p></div>
                    <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-[#86efac]"><Check className="h-3.5 w-3.5" /> Analysis complete</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {agentFindings.map((agent) => <AgentCard key={agent.name} {...agent} />)}
                  </div>
                </div>

                <div className="flex items-start gap-3 border border-foreground/10 bg-foreground/[0.02] p-4 text-[10px] leading-relaxed text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#86efac]" />
                  METIS Field provides screening and decision support for trained health workers. It does not diagnose disease or replace IMNCI protocols, clinical judgement, or emergency referral pathways.
                </div>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
