"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Baby,
  BellRing,
  CalendarCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CloudOff,
  CloudUpload,
  Footprints,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Network,
  Phone,
  Route,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
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

type QueueFilter = "all" | "urgent" | "today" | "upcoming";

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

function dueLabel(days: number) {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

function queueGroup(days: number) {
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days <= 4) return "Next 4 days";
  return "Later";
}

export default function FollowUpQueuePage() {
  const [children, setChildren] = useState<ChildRecord[]>(ashaSeedChildren);
  const [selectedId, setSelectedId] = useState(ashaSeedChildren[0].id);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<QueueFilter>("all");
  const [online, setOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDays, setRescheduleDays] = useState("3");
  const [notice, setNotice] = useState("");
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

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const selected = children.find((child) => child.id === selectedId) ?? children[0];

  const stats = useMemo(() => ({
    total: children.filter((child) => child.followUpDays <= 7).length,
    today: children.filter((child) => child.followUpDays === 0).length,
    urgent: children.filter((child) => child.risk === "high" && child.followUpDays <= 1).length,
    villages: new Set(children.filter((child) => child.followUpDays <= 7).map((child) => child.village)).size,
  }), [children]);

  const queue = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return children
      .filter((child) => child.followUpDays <= 14)
      .filter((child) => {
        if (filter === "urgent") return child.risk === "high" && child.followUpDays <= 1;
        if (filter === "today") return child.followUpDays <= 0;
        if (filter === "upcoming") return child.followUpDays > 0;
        return true;
      })
      .filter((child) => !normalized || [child.name, child.id, child.village, child.guardian]
        .some((value) => value.toLowerCase().includes(normalized)))
      .sort((a, b) => a.followUpDays - b.followUpDays || b.riskScore - a.riskScore);
  }, [children, filter, query]);

  const groupedQueue = useMemo(() => {
    const groups = ["Overdue", "Today", "Next 4 days", "Later"];
    return groups
      .map((label) => ({ label, items: queue.filter((child) => queueGroup(child.followUpDays) === label) }))
      .filter((group) => group.items.length > 0);
  }, [queue]);

  const updateSelected = (changes: Partial<ChildRecord>) => {
    if (!selected) return;
    setChildren((current) => current.map((child) => child.id === selected.id ? { ...child, ...changes } : child));
    setPendingSync((current) => current + 1);
  };

  const completeVisit = () => {
    if (!selected) return;
    updateSelected({
      lastVisit: "Follow-up completed just now · saved on device",
      followUpDays: selected.risk === "high" ? 1 : selected.risk === "moderate" ? 7 : 30,
    });
    setNotice(`${selected.name}'s follow-up was saved offline.`);
  };

  const saveReschedule = () => {
    if (!selected) return;
    updateSelected({ followUpDays: Number(rescheduleDays) });
    setRescheduleOpen(false);
    setNotice(`${selected.name}'s visit was rescheduled.`);
  };

  const markContacted = () => {
    if (!selected) return;
    setPendingSync((current) => current + 1);
    setNotice(`Caregiver contact logged for ${selected.name}.`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu className="h-5 w-5" /></button>
            <Link href="/asha" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center border border-[#86efac]/30 bg-[#86efac]/10"><img src="/logo.png" alt="METIS" className="h-5 w-5 object-contain" /></span>
              <div><p className="font-display text-lg leading-none">METIS <span className="text-[#86efac]">Field</span></p><p className="mt-1 text-[8px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Follow-up queue</p></div>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`flex h-9 items-center gap-2 border px-3 text-[10px] font-mono uppercase tracking-wider ${online ? "border-[#86efac]/20 text-[#86efac]" : "border-amber-300/20 text-amber-200"}`}>
              {online ? <Network className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}<span className="hidden sm:inline">{online ? "Online" : "Offline"}</span>
            </span>
            <span className="flex h-9 items-center gap-2 border border-foreground/10 px-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {online ? <CloudUpload className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}<span className="hidden sm:inline">{pendingSync ? `${pendingSync} to sync` : "All synced"}</span>
            </span>
            <div className="hidden items-center gap-2 border-l border-foreground/10 pl-3 md:flex"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#86efac]/15 text-xs text-[#86efac]">AS</span><div><p className="text-xs font-medium">Anjali Shinde</p><p className="text-[9px] font-mono uppercase text-muted-foreground">ASHA · Ward 14</p></div></div>
          </div>
        </div>
      </header>

      {notice && <div role="status" className="fixed right-4 top-20 z-50 flex items-center gap-2 border border-[#86efac]/30 bg-card px-4 py-3 text-xs shadow-2xl"><Check className="h-4 w-4 text-[#86efac]" />{notice}</div>}

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close navigation" className="absolute inset-0 bg-black/70" onClick={() => setMobileNavOpen(false)} />
          <div className="relative h-full w-72 border-r border-foreground/10 bg-card p-5">
            <div className="mb-8 flex items-center justify-between"><span className="font-display text-xl">METIS Field</span><button onClick={() => setMobileNavOpen(false)}><X className="h-5 w-5" /></button></div>
            <nav className="space-y-2 text-sm">
              <Link href="/asha" className="flex items-center gap-3 border border-transparent px-4 py-3 text-muted-foreground"><Activity className="h-4 w-4" /> Today’s overview</Link>
              <Link href="/asha/children" className="flex items-center gap-3 border border-transparent px-4 py-3 text-muted-foreground"><UsersRound className="h-4 w-4" /> Child registry</Link>
              <Link href="/asha/follow-ups" className="flex items-center gap-3 border border-[#86efac]/30 bg-[#86efac]/10 px-4 py-3 text-[#86efac]"><CalendarClock className="h-4 w-4" /> Follow-up queue</Link>
              <Link href="/asha/map" className="flex items-center gap-3 border border-transparent px-4 py-3 text-muted-foreground"><MapPin className="h-4 w-4" /> Village map</Link>
            </nav>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-64px)] border-r border-foreground/10 px-4 py-6 lg:block">
          <nav className="space-y-1">
            <Link href="/asha" className="flex items-center gap-3 px-3 py-2.5 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground"><Activity className="h-4 w-4" />Today’s overview</Link>
            <Link href="/asha/children" className="flex items-center gap-3 px-3 py-2.5 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground"><Baby className="h-4 w-4" />Child registry</Link>
            <Link href="/asha/follow-ups" className="flex items-center gap-3 bg-[#86efac]/10 px-3 py-2.5 text-xs text-[#86efac]"><CalendarClock className="h-4 w-4" />Follow-up queue<span className="ml-auto font-mono text-[9px]">{stats.total}</span></Link>
            <Link href="/asha/map" className="flex items-center gap-3 px-3 py-2.5 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground"><MapPin className="h-4 w-4" />Village map</Link>
            <span className="flex items-center gap-3 px-3 py-2.5 text-xs text-muted-foreground"><BellRing className="h-4 w-4" />Alerts<span className="ml-auto font-mono text-[9px]">{stats.urgent}</span></span>
          </nav>
          <div className="mt-8 border border-foreground/10 bg-foreground/[0.02] p-4"><div className="flex items-center gap-2 text-[#86efac]"><Route className="h-4 w-4" /><span className="text-[10px] font-mono uppercase tracking-wider">Today’s route</span></div><p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{stats.today} visits across {stats.villages} villages. Urgent cases appear first.</p></div>
          <Link href="/dashboard" className="mt-4 flex items-center gap-2 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Family dashboard</Link>
        </aside>

        <section className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div><div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#86efac]"><span className="h-px w-8 bg-[#86efac]/60" /> Sunday · 09 August 2026</div><h1 className="font-display text-3xl sm:text-4xl">Follow-up queue</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Turn risk alerts into timely home visits, referrals and caregiver contact.</p></div>
            <button className="flex h-11 items-center justify-center gap-2 border border-[#86efac]/30 bg-[#86efac]/10 px-5 text-xs font-bold text-[#86efac] hover:bg-[#86efac]/15"><Navigation className="h-4 w-4" /> Start today’s route</button>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              { label: "Due within 7 days", value: stats.total, detail: "Priority sorted", icon: CalendarClock, tone: "text-foreground" },
              { label: "Due today", value: stats.today, detail: "Home visits", icon: Footprints, tone: "text-[#86efac]" },
              { label: "Urgent", value: stats.urgent, detail: "Clinical escalation", icon: AlertTriangle, tone: "text-rose-300" },
              { label: "Villages", value: stats.villages, detail: "Route coverage", icon: MapPin, tone: "text-amber-200" },
            ].map((stat) => <div key={stat.label} className="border border-foreground/10 bg-foreground/[0.02] p-4 sm:p-5"><div className="flex items-start justify-between"><div><p className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p><p className={`mt-3 font-display text-3xl ${stat.tone}`}>{stat.value}</p></div><stat.icon className={`h-4 w-4 ${stat.tone}`} /></div><p className="mt-2 text-[10px] text-muted-foreground">{stat.detail}</p></div>)}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.45fr)]">
            <section className="border border-foreground/10 bg-foreground/[0.015]">
              <div className="border-b border-foreground/10 p-4">
                <div className="relative"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search child, village or caregiver" className="h-10 w-full border border-foreground/10 bg-black/20 pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground/60 focus:border-[#86efac]/40" /></div>
                <div className="mt-3 flex gap-1 overflow-x-auto">{(["all", "urgent", "today", "upcoming"] as QueueFilter[]).map((item) => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider ${filter === item ? "bg-foreground text-background" : "text-muted-foreground hover:bg-foreground/5"}`}>{item}</button>)}</div>
              </div>
              <div className="max-h-[670px] overflow-y-auto">
                {groupedQueue.map((group) => (
                  <div key={group.label}>
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-foreground/10 bg-card/95 px-4 py-2 backdrop-blur"><p className="text-[9px] font-mono uppercase tracking-[0.16em] text-muted-foreground">{group.label}</p><span className="text-[9px] font-mono text-muted-foreground">{group.items.length}</span></div>
                    {group.items.map((child) => (
                      <button key={child.id} onClick={() => { setSelectedId(child.id); setRescheduleOpen(false); }} className={`w-full border-b border-foreground/10 p-4 text-left transition-colors ${selectedId === child.id ? "bg-[#86efac]/[0.06]" : "hover:bg-foreground/[0.03]"}`}>
                        <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground/5 font-display text-sm">{child.name.charAt(0)}</span><div className="min-w-0"><p className="truncate text-sm font-medium">{child.name}</p><p className="mt-1 truncate text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{child.ageMonths} months · {child.village}</p></div></div><RiskBadge level={child.risk} /></div>
                        <div className="mt-3 flex items-center justify-between text-[10px]"><span className="text-muted-foreground">{child.guardian}</span><span className={child.followUpDays <= 0 ? "text-rose-300" : child.followUpDays <= 3 ? "text-amber-200" : "text-muted-foreground"}>{dueLabel(child.followUpDays)}</span></div>
                      </button>
                    ))}
                  </div>
                ))}
                {!queue.length && <div className="p-10 text-center"><CheckCircle2 className="mx-auto h-6 w-6 text-[#86efac]" /><p className="mt-3 text-xs text-muted-foreground">No follow-ups match this view.</p></div>}
              </div>
            </section>

            {selected && (
              <section className="space-y-5">
                <div className="border border-foreground/10 bg-foreground/[0.015] p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#86efac]/10 font-display text-xl text-[#86efac]">{selected.name.charAt(0)}</span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-2xl">{selected.name}</h2><RiskBadge level={selected.risk} /></div><p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{selected.id} · {selected.ageMonths} months · {selected.sex}</p></div></div><div className="sm:text-right"><p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Visit status</p><p className={`mt-1 text-lg font-medium ${selected.followUpDays <= 0 ? "text-rose-300" : "text-amber-200"}`}>{dueLabel(selected.followUpDays)}</p></div></div>
                  <div className="mt-6 grid gap-px bg-foreground/10 sm:grid-cols-3">{[["Village", selected.village], ["Caregiver", selected.guardian], ["Last contact", selected.lastVisit]].map(([label, value]) => <div key={label} className="bg-card p-3 sm:p-4"><p className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1.5 text-xs font-medium">{value}</p></div>)}</div>
                </div>

                <div className={`border p-5 sm:p-6 ${selected.risk === "high" ? "border-rose-400/30 bg-rose-400/[0.06]" : selected.risk === "moderate" ? "border-amber-300/30 bg-amber-300/[0.05]" : "border-[#86efac]/25 bg-[#86efac]/[0.04]"}`}>
                  <div className="flex items-start gap-3"><Stethoscope className={`mt-0.5 h-5 w-5 shrink-0 ${selected.risk === "high" ? "text-rose-300" : selected.risk === "moderate" ? "text-amber-200" : "text-[#86efac]"}`} /><div><p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Visit objective</p><h3 className="mt-1 font-display text-xl">{selected.risk === "high" ? "Confirm referral and reassess danger signs" : selected.risk === "moderate" ? "Repeat growth assessment and feeding review" : "Routine growth and prevention check"}</h3><p className="mt-2 text-xs leading-relaxed text-foreground/70">{selected.risk === "high" ? "Verify that the child reached the referral facility. Recheck feeding, alertness, oedema and hydration; escalate immediately if danger signs persist." : selected.risk === "moderate" ? "Repeat MUAC and weight, review the feeding plan, check vaccine status and agree on the next home visit with the caregiver." : "Review growth, feeding, hygiene and immunisation. Reinforce the caregiver’s preventive-care plan."}</p></div></div>
                  {selected.flags.length > 0 && <div className="mt-4 flex flex-wrap gap-2 border-t border-foreground/10 pt-4">{selected.flags.map((flag) => <span key={flag} className="border border-foreground/10 bg-black/15 px-2.5 py-1 text-[9px] text-foreground/70">{flag}</span>)}</div>}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <button onClick={completeVisit} className="flex min-h-20 flex-col items-start justify-between border border-[#86efac]/30 bg-[#86efac]/10 p-4 text-left text-[#86efac] transition-colors hover:bg-[#86efac]/15"><ClipboardCheck className="h-5 w-5" /><span className="text-xs font-bold text-foreground">Complete visit</span></button>
                  <button onClick={markContacted} className="flex min-h-20 flex-col items-start justify-between border border-foreground/10 bg-foreground/[0.02] p-4 text-left transition-colors hover:bg-foreground/[0.05]"><MessageCircle className="h-5 w-5 text-amber-200" /><span className="text-xs font-bold">Log caregiver contact</span></button>
                  <button onClick={() => setRescheduleOpen((open) => !open)} className="flex min-h-20 flex-col items-start justify-between border border-foreground/10 bg-foreground/[0.02] p-4 text-left transition-colors hover:bg-foreground/[0.05]"><CalendarCheck className="h-5 w-5 text-muted-foreground" /><span className="text-xs font-bold">Reschedule visit</span></button>
                </div>

                {rescheduleOpen && <div className="border border-foreground/10 bg-foreground/[0.02] p-5"><div className="flex items-start justify-between"><div><p className="text-[9px] font-mono uppercase tracking-wider text-[#86efac]">Reschedule</p><h3 className="mt-1 font-display text-xl">Choose next visit window</h3></div><button onClick={() => setRescheduleOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button></div><div className="mt-4 flex flex-wrap gap-2">{[{ value: "1", label: "Tomorrow" }, { value: "3", label: "In 3 days" }, { value: "7", label: "In 1 week" }, { value: "14", label: "In 2 weeks" }].map((option) => <button key={option.value} onClick={() => setRescheduleDays(option.value)} className={`border px-3 py-2 text-xs ${rescheduleDays === option.value ? "border-[#86efac]/40 bg-[#86efac]/10 text-[#86efac]" : "border-foreground/10 text-muted-foreground"}`}>{option.label}</button>)}</div><div className="mt-5 flex justify-end"><button onClick={saveReschedule} className="h-9 bg-[#86efac] px-4 text-xs font-bold text-black">Save new date</button></div></div>}

                <div className="grid gap-4 border border-foreground/10 bg-foreground/[0.015] p-5 sm:grid-cols-2 sm:p-6">
                  <div><p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Visit checklist</p><div className="mt-4 space-y-3">{["Confirm caregiver consent", "Repeat MUAC and weight", "Review current danger signs", "Check referral or vaccine status", "Agree next follow-up date"].map((item) => <label key={item} className="flex items-center gap-3 text-xs"><input type="checkbox" className="accent-[#86efac]" /><span>{item}</span></label>)}</div></div>
                  <div className="border-t border-foreground/10 pt-5 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0"><p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Quick contact</p><div className="mt-4 space-y-2"><button onClick={markContacted} className="flex w-full items-center justify-between border border-foreground/10 p-3 text-xs hover:bg-foreground/5"><span className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#86efac]" /> Call caregiver</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></button><button onClick={markContacted} className="flex w-full items-center justify-between border border-foreground/10 p-3 text-xs hover:bg-foreground/5"><span className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-[#86efac]" /> Send reminder</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></button><Link href="/asha/children" className="flex w-full items-center justify-between border border-foreground/10 p-3 text-xs hover:bg-foreground/5"><span className="flex items-center gap-2"><UserRound className="h-4 w-4 text-[#86efac]" /> Open child record</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></Link></div></div>
                </div>

                <div className="flex items-start gap-3 border border-foreground/10 bg-foreground/[0.02] p-4 text-[10px] leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#86efac]" />Follow-up guidance supports ASHA workflow and does not replace IMNCI protocols, clinical judgement, or emergency referral.</div>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
