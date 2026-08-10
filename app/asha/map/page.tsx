"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Baby,
  BellRing,
  Building2,
  CalendarClock,
  Check,
  ChevronRight,
  CloudOff,
  CloudUpload,
  Cross,
  ExternalLink,
  Footprints,
  Layers3,
  LocateFixed,
  Map,
  MapPin,
  Menu,
  Navigation,
  Network,
  Route,
  ShieldCheck,
  UsersRound,
  WifiOff,
  X,
} from "lucide-react";
import {
  ASHA_REGISTRY_STORAGE_KEY,
  ASHA_SYNC_STORAGE_KEY,
  ashaSeedChildren,
  type ChildRecord,
} from "@/lib/asha-data";

type MapLayer = "risk" | "visits" | "coverage";

type VillageMeta = {
  name: string;
  x: number;
  y: number;
  households: number;
  coverage: number;
  facility: string;
};

const connections = [
  { left: 22, top: 31, width: 39, rotate: -9 },
  { left: 62, top: 26, width: 34, rotate: 72 },
  { left: 41, top: 70, width: 32, rotate: -26 },
  { left: 17, top: 59, width: 28, rotate: 35 },
  { left: 20, top: 32, width: 36, rotate: 75 },
];

const villageMeta: VillageMeta[] = [
  { name: "Kondhwa", x: 20, y: 28, households: 184, coverage: 91, facility: "Kondhwa Sub-centre" },
  { name: "Undri", x: 61, y: 20, households: 132, coverage: 84, facility: "Undri Anganwadi 2" },
  { name: "Mohammadwadi", x: 72, y: 58, households: 156, coverage: 88, facility: "Mohammadwadi AWC" },
  { name: "Handewadi", x: 39, y: 74, households: 118, coverage: 79, facility: "Handewadi Health Post" },
  { name: "Pisoli", x: 15, y: 61, households: 96, coverage: 94, facility: "Pisoli Anganwadi 1" },
];

function metricTone(layer: MapLayer, high: number, due: number, coverage: number) {
  if (layer === "risk") return high > 0 ? "rose" : "green";
  if (layer === "visits") return due > 1 ? "amber" : due > 0 ? "green" : "muted";
  return coverage < 80 ? "rose" : coverage < 90 ? "amber" : "green";
}

const toneClasses = {
  rose: "border-rose-300 bg-rose-400/15 text-rose-200 shadow-[0_0_28px_rgba(251,113,133,0.2)]",
  amber: "border-amber-200 bg-amber-300/15 text-amber-100 shadow-[0_0_28px_rgba(253,224,71,0.14)]",
  green: "border-[#86efac] bg-[#86efac]/15 text-[#86efac] shadow-[0_0_28px_rgba(134,239,172,0.14)]",
  muted: "border-foreground/30 bg-card text-muted-foreground",
};

export default function VillageMapPage() {
  const [children, setChildren] = useState<ChildRecord[]>(ashaSeedChildren);
  const [selectedVillage, setSelectedVillage] = useState("Kondhwa");
  const [layer, setLayer] = useState<MapLayer>("risk");
  const [online, setOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [routeStarted, setRouteStarted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ASHA_REGISTRY_STORAGE_KEY);
    const queued = localStorage.getItem(ASHA_SYNC_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ChildRecord[];
        if (parsed.length) setChildren(parsed);
      } catch {
        localStorage.removeItem(ASHA_REGISTRY_STORAGE_KEY);
      }
    }
    if (queued) setPendingSync(Number(queued) || 0);
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const villages = useMemo(() => villageMeta.map((meta) => {
    const records = children.filter((child) => child.village === meta.name);
    return {
      ...meta,
      children: records,
      registered: records.length,
      high: records.filter((child) => child.risk === "high").length,
      moderate: records.filter((child) => child.risk === "moderate").length,
      due: records.filter((child) => child.followUpDays <= 4).length,
    };
  }), [children]);

  const selected = villages.find((village) => village.name === selectedVillage) ?? villages[0];
  const totalDue = villages.reduce((sum, village) => sum + village.due, 0);
  const totalHigh = villages.reduce((sum, village) => sum + village.high, 0);
  const avgCoverage = Math.round(villages.reduce((sum, village) => sum + village.coverage, 0) / villages.length);
  const routeVillages = useMemo(() => [...villages]
    .filter((village) => village.due > 0)
    .sort((a, b) => b.high - a.high || b.due - a.due), [villages]);

  const selectedMetric = layer === "risk"
    ? `${selected.high} urgent · ${selected.moderate} review`
    : layer === "visits"
      ? `${selected.due} visits due`
      : `${selected.coverage}% covered`;
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${selected.name}, Pune, Maharashtra, India`)}&z=14&output=embed`;
  const routeDestination = routeVillages.at(-1)?.name ?? selected.name;
  const routeWaypoints = routeVillages.slice(1, -1).map((village) => `${village.name}, Pune`).join("|");
  const googleRouteUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent("Kondhwa, Pune")}&destination=${encodeURIComponent(`${routeDestination}, Pune`)}${routeWaypoints ? `&waypoints=${encodeURIComponent(routeWaypoints)}` : ""}&travelmode=driving`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu className="h-5 w-5" /></button>
            <Link href="/asha" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center border border-[#86efac]/30 bg-[#86efac]/10"><img src="/logo.png" alt="METIS" className="h-5 w-5 object-contain" /></span><div><p className="font-display text-lg leading-none">METIS <span className="text-[#86efac]">Field</span></p><p className="mt-1 text-[8px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Village map</p></div></Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`flex h-9 items-center gap-2 border px-3 text-[10px] font-mono uppercase tracking-wider ${online ? "border-[#86efac]/20 text-[#86efac]" : "border-amber-300/20 text-amber-200"}`}>{online ? <Network className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}<span className="hidden sm:inline">{online ? "Online" : "Offline"}</span></span>
            <span className="flex h-9 items-center gap-2 border border-foreground/10 px-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{online ? <CloudUpload className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}<span className="hidden sm:inline">{pendingSync ? `${pendingSync} to sync` : "Registry ready"}</span></span>
            <div className="hidden items-center gap-2 border-l border-foreground/10 pl-3 md:flex"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#86efac]/15 text-xs text-[#86efac]">AS</span><div><p className="text-xs font-medium">Anjali Shinde</p><p className="text-[9px] font-mono uppercase text-muted-foreground">ASHA · Ward 14</p></div></div>
          </div>
        </div>
      </header>

      {mobileNavOpen && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Close navigation" className="absolute inset-0 bg-black/70" onClick={() => setMobileNavOpen(false)} /><div className="relative h-full w-72 border-r border-foreground/10 bg-card p-5"><div className="mb-8 flex items-center justify-between"><span className="font-display text-xl">METIS Field</span><button onClick={() => setMobileNavOpen(false)}><X className="h-5 w-5" /></button></div><nav className="space-y-2 text-sm"><Link href="/asha" className="flex items-center gap-3 border border-transparent px-4 py-3 text-muted-foreground"><Activity className="h-4 w-4" /> Today’s overview</Link><Link href="/asha/children" className="flex items-center gap-3 border border-transparent px-4 py-3 text-muted-foreground"><UsersRound className="h-4 w-4" /> Child registry</Link><Link href="/asha/follow-ups" className="flex items-center gap-3 border border-transparent px-4 py-3 text-muted-foreground"><CalendarClock className="h-4 w-4" /> Follow-up queue</Link><Link href="/asha/map" className="flex items-center gap-3 border border-[#86efac]/30 bg-[#86efac]/10 px-4 py-3 text-[#86efac]"><MapPin className="h-4 w-4" /> Village map</Link></nav></div></div>}

      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-64px)] border-r border-foreground/10 px-4 py-6 lg:block">
          <nav className="space-y-1"><Link href="/asha" className="flex items-center gap-3 px-3 py-2.5 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground"><Activity className="h-4 w-4" />Today’s overview</Link><Link href="/asha/children" className="flex items-center gap-3 px-3 py-2.5 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground"><Baby className="h-4 w-4" />Child registry</Link><Link href="/asha/follow-ups" className="flex items-center gap-3 px-3 py-2.5 text-xs text-muted-foreground hover:bg-foreground/5 hover:text-foreground"><CalendarClock className="h-4 w-4" />Follow-up queue<span className="ml-auto font-mono text-[9px]">{totalDue}</span></Link><Link href="/asha/map" className="flex items-center gap-3 bg-[#86efac]/10 px-3 py-2.5 text-xs text-[#86efac]"><MapPin className="h-4 w-4" />Village map</Link><span className="flex items-center gap-3 px-3 py-2.5 text-xs text-muted-foreground"><BellRing className="h-4 w-4" />Alerts<span className="ml-auto font-mono text-[9px]">{totalHigh}</span></span></nav>
          <div className="mt-8 border border-foreground/10 bg-foreground/[0.02] p-4"><div className="flex items-center gap-2 text-[#86efac]"><Map className="h-4 w-4" /><span className="text-[10px] font-mono uppercase tracking-wider">Live Google Maps</span></div><p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">Map tiles need internet. Registry risks and follow-up data remain available offline.</p></div>
          <Link href="/dashboard" className="mt-4 flex items-center gap-2 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Family dashboard</Link>
        </aside>

        <section className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end"><div><div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#86efac]"><span className="h-px w-8 bg-[#86efac]/60" /> Ward 14 · Field coverage</div><h1 className="font-display text-3xl sm:text-4xl">Village map</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">See where risk is concentrated and plan the shortest path to children who need care.</p></div><button onClick={() => setRouteStarted((started) => !started)} className={`flex h-11 items-center justify-center gap-2 px-5 text-xs font-bold transition-colors ${routeStarted ? "border border-[#86efac]/30 bg-[#86efac]/10 text-[#86efac]" : "bg-[#86efac] text-black hover:bg-[#a2f3bf]"}`}>{routeStarted ? <><Check className="h-4 w-4" /> Route active</> : <><Navigation className="h-4 w-4" /> Start field route</>}</button></div>

          <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">{[
            { label: "Villages covered", value: villages.length, detail: "Ward 14", icon: MapPin, tone: "text-foreground" },
            { label: "Visits due", value: totalDue, detail: "Across route", icon: Footprints, tone: "text-amber-200" },
            { label: "Urgent risks", value: totalHigh, detail: "Refer first", icon: AlertTriangle, tone: "text-rose-300" },
            { label: "Avg. coverage", value: `${avgCoverage}%`, detail: "Household mapping", icon: LocateFixed, tone: "text-[#86efac]" },
          ].map((stat) => <div key={stat.label} className="border border-foreground/10 bg-foreground/[0.02] p-4 sm:p-5"><div className="flex items-start justify-between"><div><p className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p><p className={`mt-3 font-display text-3xl ${stat.tone}`}>{stat.value}</p></div><stat.icon className={`h-4 w-4 ${stat.tone}`} /></div><p className="mt-2 text-[10px] text-muted-foreground">{stat.detail}</p></div>)}</div>

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.55fr)_390px]">
            <section className="overflow-hidden border border-foreground/10 bg-foreground/[0.015]">
              <div className="flex flex-col justify-between gap-3 border-b border-foreground/10 p-4 sm:flex-row sm:items-center"><div><h2 className="font-display text-xl">Field coverage</h2><p className="mt-1 text-[10px] text-muted-foreground">Tap a village to inspect households and visits</p></div><div className="flex gap-1 overflow-x-auto">{(["risk", "visits", "coverage"] as MapLayer[]).map((item) => <button key={item} onClick={() => setLayer(item)} className={`flex items-center gap-1.5 px-3 py-2 text-[9px] font-mono uppercase tracking-wider ${layer === item ? "bg-foreground text-background" : "text-muted-foreground hover:bg-foreground/5"}`}><Layers3 className="h-3 w-3" />{item}</button>)}</div></div>

              <div className="relative h-[560px] overflow-hidden bg-white">
                <iframe
                  key={selected.name}
                  title={`Google Maps view of ${selected.name}`}
                  src={mapEmbedUrl}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                <div className="hidden">
                <div className="absolute inset-5 rounded-[48%_52%_42%_58%/55%_38%_62%_45%] border border-foreground/10 bg-[#86efac]/[0.015]" />
                <div className="absolute left-[8%] top-[9%] text-[8px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50">North</div>
                <div className="absolute left-[9%] top-[14%] h-8 w-px bg-foreground/20"><span className="absolute -left-1 top-0 h-2 w-2 rotate-45 border-l border-t border-foreground/50" /></div>
                {connections.map((line, index) => <div key={index} className={`absolute h-px origin-left border-t ${routeStarted ? "border-solid border-[#86efac]/50" : "border-dashed border-foreground/15"}`} style={{ left: `${line.left}%`, top: `${line.top}%`, width: `${line.width}%`, transform: `rotate(${line.rotate}deg)` }} />)}

                <div className="absolute left-[48%] top-[45%] z-10 -translate-x-1/2 -translate-y-1/2"><div className="flex h-8 w-8 items-center justify-center rounded-full border border-sky-300/40 bg-sky-300/15 text-sky-200"><Building2 className="h-4 w-4" /></div><p className="mt-1 whitespace-nowrap text-[8px] font-mono uppercase text-sky-200/70">Ward office</p></div>
                <div className="absolute left-[84%] top-[35%] z-10 -translate-x-1/2 -translate-y-1/2"><div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white"><Cross className="h-4 w-4" /></div><p className="mt-1 whitespace-nowrap text-[8px] font-mono uppercase text-white/60">PHC · 2.1 km</p></div>

                {villages.map((village, index) => {
                  const tone = metricTone(layer, village.high, village.due, village.coverage);
                  const active = village.name === selectedVillage;
                  const metric = layer === "risk" ? village.high : layer === "visits" ? village.due : village.coverage;
                  return <button key={village.name} onClick={() => setSelectedVillage(village.name)} className="group absolute z-20 -translate-x-1/2 -translate-y-1/2 text-left" style={{ left: `${village.x}%`, top: `${village.y}%` }} aria-label={`Open ${village.name} details`}><div className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-transform group-hover:scale-110 sm:h-14 sm:w-14 ${toneClasses[tone]} ${active ? "ring-2 ring-white/30 ring-offset-4 ring-offset-background" : ""}`}><span className="font-display text-lg">{metric}</span>{routeStarted && village.due > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#86efac] text-[9px] font-bold text-black">{routeVillages.findIndex((routeVillage) => routeVillage.name === village.name) + 1}</span>}</div><div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-center"><p className={`text-[10px] font-bold ${active ? "text-foreground" : "text-foreground/75"}`}>{village.name}</p><p className="mt-0.5 text-[8px] font-mono uppercase text-muted-foreground">{index === 0 ? "NW cluster" : `Sector ${index + 1}`}</p></div></button>;
                })}

                <div className="absolute bottom-4 left-4 border border-foreground/10 bg-card/90 p-3 backdrop-blur"><p className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground">Map key</p><div className="mt-2 flex flex-wrap gap-3 text-[9px] text-muted-foreground"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-300" />Action</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-200" />Review</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#86efac]" />Covered</span></div></div>
                </div>

                <div className="absolute left-3 top-3 z-10 max-w-[calc(100%-24px)] border border-black/15 bg-card/95 p-2 shadow-2xl backdrop-blur sm:left-4 sm:top-4">
                  <p className="px-1 pb-2 text-[8px] font-mono uppercase tracking-[0.16em] text-muted-foreground">Select village · {layer} layer</p>
                  <div className="flex max-w-[calc(100vw-72px)] gap-1.5 overflow-x-auto pb-0.5 sm:max-w-xl">
                    {villages.map((village) => {
                      const tone = metricTone(layer, village.high, village.due, village.coverage);
                      const metric = layer === "risk" ? village.high : layer === "visits" ? village.due : `${village.coverage}%`;
                      return <button key={village.name} onClick={() => setSelectedVillage(village.name)} className={`flex shrink-0 items-center gap-2 border px-2.5 py-2 text-left transition-colors ${village.name === selectedVillage ? toneClasses[tone] : "border-foreground/10 bg-background/90 text-foreground hover:bg-background"}`}><span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-current/10 px-1 text-[9px] font-bold">{metric}</span><span><span className="block text-[10px] font-medium">{village.name}</span><span className="mt-0.5 block text-[8px] text-muted-foreground">{village.due} due</span></span></button>;
                    })}
                  </div>
                </div>

                <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 border border-black/15 bg-card/95 p-2 shadow-2xl backdrop-blur">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selected.name}, Pune, Maharashtra`)}`} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-2 whitespace-nowrap px-3 text-[10px] font-bold text-foreground hover:bg-foreground/5"><ExternalLink className="h-3.5 w-3.5 text-[#86efac]" /> Open village</a>
                  <span className="h-6 w-px bg-foreground/10" />
                  <a href={googleRouteUrl} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-2 whitespace-nowrap bg-[#86efac] px-3 text-[10px] font-bold text-black hover:bg-[#a2f3bf]"><Navigation className="h-3.5 w-3.5" /> Directions</a>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-foreground/10 px-4 py-3 text-[9px] font-mono uppercase tracking-wider text-muted-foreground"><span>Live Google Maps · {selected.name}</span><span>Internet required for map tiles</span></div>
            </section>

            <aside className="space-y-5">
              <div className="border border-foreground/10 bg-foreground/[0.015]">
                <div className="border-b border-foreground/10 p-5"><div className="flex items-start justify-between"><div><p className="text-[9px] font-mono uppercase tracking-wider text-[#86efac]">Selected village</p><h2 className="mt-1 font-display text-2xl">{selected.name}</h2><p className="mt-1 text-[10px] text-muted-foreground">{selected.facility}</p></div><MapPin className="h-5 w-5 text-[#86efac]" /></div></div>
                <div className="grid grid-cols-2 gap-px bg-foreground/10">{[["Registered children", selected.registered], ["Households", selected.households], ["Visits due", selected.due], ["Coverage", `${selected.coverage}%`]].map(([label, value]) => <div key={label} className="bg-card p-4"><p className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl">{value}</p></div>)}</div>
                <div className="p-5"><div className="flex items-center justify-between"><p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Active layer</p><span className="text-[10px] text-foreground">{selectedMetric}</span></div><div className="mt-4 h-1.5 overflow-hidden bg-foreground/10"><div className="h-full bg-[#86efac]" style={{ width: `${layer === "coverage" ? selected.coverage : Math.min(100, (layer === "risk" ? selected.high : selected.due) * 32)}%` }} /></div></div>
              </div>

              <div className="border border-foreground/10 bg-foreground/[0.015] p-5"><div className="flex items-center justify-between"><div><h3 className="font-display text-xl">Children in {selected.name}</h3><p className="mt-1 text-[10px] text-muted-foreground">Risk-priority order</p></div><Baby className="h-4 w-4 text-muted-foreground" /></div><div className="mt-4 space-y-2">{selected.children.length ? [...selected.children].sort((a, b) => b.riskScore - a.riskScore).map((child) => <Link key={child.id} href="/asha/children" className="flex items-center justify-between border border-foreground/10 p-3 transition-colors hover:bg-foreground/5"><div><p className="text-xs font-medium">{child.name}</p><p className="mt-1 text-[9px] text-muted-foreground">{child.ageMonths} months · {child.guardian}</p></div><div className="text-right"><p className={child.risk === "high" ? "text-[10px] text-rose-300" : child.risk === "moderate" ? "text-[10px] text-amber-200" : "text-[10px] text-[#86efac]"}>{child.risk.toUpperCase()}</p><p className="mt-1 text-[9px] text-muted-foreground">{child.followUpDays === 0 ? "Due today" : `${child.followUpDays}d`}</p></div></Link>) : <div className="border border-dashed border-foreground/10 p-5 text-center text-xs text-muted-foreground">No registered children in this village.</div>}</div></div>

              <div className="border border-foreground/10 bg-foreground/[0.015] p-5"><div className="flex items-center justify-between"><div><h3 className="font-display text-xl">Suggested route</h3><p className="mt-1 text-[10px] text-muted-foreground">Urgent villages first</p></div><Route className="h-4 w-4 text-[#86efac]" /></div><div className="mt-4 space-y-0">{routeVillages.map((village, index) => <button key={village.name} onClick={() => setSelectedVillage(village.name)} className="relative flex w-full items-center gap-3 pb-4 text-left last:pb-0"><span className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${routeStarted && index === 0 ? "border-[#86efac] bg-[#86efac] text-black" : "border-foreground/20 bg-card text-muted-foreground"}`}>{index + 1}</span>{index < routeVillages.length - 1 && <span className="absolute left-[13px] top-6 h-full border-l border-dashed border-foreground/15" />}<div className="flex-1"><p className="text-xs font-medium">{village.name}</p><p className="mt-0.5 text-[9px] text-muted-foreground">{village.due} visits · {village.high} urgent</p></div><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>)}</div></div>

              <div className="flex items-start gap-3 border border-foreground/10 bg-foreground/[0.02] p-4 text-[10px] leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#86efac]" />Locations shown are prototype planning markers, not precise household coordinates. Protect identifiable health and location data in production.</div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
