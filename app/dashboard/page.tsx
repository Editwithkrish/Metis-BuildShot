"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n-context";
import Link from "next/link";
import {
  LayoutDashboard,
  Baby,
  Utensils,
  Activity,
  Bell,
  Settings,
  LogOut,
  TrendingUp,
  Clock,
  Syringe,
  Stethoscope,
  Lightbulb,
  Moon,
  Sun,
  AudioLines,
  ChevronRight,
  Droplets,
  Heart,
  Menu,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                          */
/* ------------------------------------------------------------------ */

const growthData = [
  { month: "Jan", weight: 4.2 },
  { month: "Feb", weight: 4.8 },
  { month: "Mar", weight: 5.3 },
  { month: "Apr", weight: 5.9 },
  { month: "May", weight: 6.4 },
  { month: "Jun", weight: 7.0 },
  { month: "Jul", weight: 7.5 },
  { month: "Aug", weight: 7.9 },
];

const consultations = [
  { name: "Dr. Emily Carter", role: "Pediatrician", time: "9:00 AM", color: "#86efac" },
  { name: "Dr. Max Smith", role: "Nutritionist", time: "1:45 PM", color: "#60a5fa" },
  { name: "Sarah Collins", role: "Lactation Coach", time: "Tomorrow", color: "#f472b6" },
];

const activityLog = [
  { label: "Sleep", value: "12h 45m", status: "OPTIMAL", color: "#86efac" },
  { label: "Tummy Time", value: "25m", status: "AVERAGE", color: "#fbbf24" },
  { label: "Naps", value: "3 today", status: "OPTIMAL", color: "#86efac" },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Baby, label: "Baby Profile", active: false },
  { icon: TrendingUp, label: "Growth", active: false },
  { icon: Utensils, label: "Nutrition", active: false },
  { icon: Activity, label: "Activity", active: false },
  { icon: Stethoscope, label: "Consult", active: false },
  { icon: Syringe, label: "Vaccines", active: false },
  { icon: Settings, label: "Settings", active: false },
];

/* ------------------------------------------------------------------ */
/*  GROWTH CHART (SVG)                                                 */
/* ------------------------------------------------------------------ */

function GrowthChart() {
  const maxW = 7.9;
  const minW = 4.2;
  const padding = 32;
  const chartW = 520;
  const chartH = 220;

  const points = growthData.map((d, i) => {
    const x = padding + (i / (growthData.length - 1)) * (chartW - padding * 2);
    const y = chartH - padding - ((d.weight - minW) / (maxW - minW)) * (chartH - padding * 2);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Curved path using catmull-rom approximation
  const curvePath = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = arr[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `${acc} C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
  }, "");

  const areaPath = `${curvePath} L ${points[points.length - 1].x} ${chartH - padding} L ${points[0].x} ${chartH - padding} Z`;

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#86efac" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 1, 2, 3].map((i) => {
        const y = padding + (i / 3) * (chartH - padding * 2);
        return (
          <line
            key={i}
            x1={padding}
            y1={y}
            x2={chartW - padding}
            y2={y}
            stroke="currentColor"
            strokeOpacity="0.06"
            strokeDasharray="4 4"
          />
        );
      })}

      {/* Area */}
      <path d={areaPath} fill="url(#chartGrad)" />

      {/* Line */}
      <path d={curvePath} fill="none" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" />

      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="var(--background)" stroke="#86efac" strokeWidth="2" />
          <text
            x={p.x}
            y={chartH - 10}
            textAnchor="middle"
            fill="currentColor"
            fillOpacity="0.3"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            {p.month}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                          */
/* ------------------------------------------------------------------ */



export default function DashboardPage() {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("metis_onboarding_data");
    if (data) {
      setUserData(JSON.parse(data));
    }
  }, []);

  const userName = userData?.name || "Sarah Wilson";
  const userRole = userData?.role === 'mother' ? "MOM OF BABY LEO" : 
                   userData?.role === 'doc' ? "CLINICAL DOCTOR" : 
                   userData?.role?.toUpperCase() || "INDIVIDUAL";

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* ---- SIDEBAR ---- */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[72px] bg-card border-r border-foreground/10 flex flex-col items-center py-6 gap-2 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="mb-6 group">
          <div className="w-10 h-10 border border-[#86efac]/30 bg-[#86efac]/10 flex items-center justify-center group-hover:bg-[#86efac]/20 transition-colors">
            <img src="/logo.png" alt="METIS Logo" className="w-6 h-6 object-contain" />
          </div>
        </Link>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              title={item.label}
              className={`w-10 h-10 flex items-center justify-center transition-all ${
                item.active
                  ? "bg-[#86efac]/10 text-[#86efac]"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="flex flex-col gap-2">
          <button title="Logout" className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </aside>

      {/* ---- MAIN CONTENT ---- */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-foreground/10">
          <div className="flex items-center justify-between px-6 lg:px-10 h-16">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden text-muted-foreground"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-display">Dashboard</h1>
                <p className="text-[11px] text-muted-foreground font-mono -mt-0.5">
                  {t.dashboard.welcome}, {userName.split(' ')[0]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Cry Decoder CTA */}
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-foreground/10 hover:border-[#86efac]/30 hover:bg-[#86efac]/5 transition-all text-xs font-mono uppercase tracking-wider">
                <AudioLines className="w-4 h-4 text-[#86efac]" />
                Cry Decoder
              </button>

              {/* Notification bell */}
              <button className="relative w-9 h-9 flex items-center justify-center border border-foreground/10 hover:bg-foreground/5 transition-colors">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#86efac] rounded-full" />
              </button>

              {/* User */}
              <div className="flex items-center gap-3 pl-3 border-l border-foreground/10">
                <div className="w-8 h-8 rounded-full bg-[#86efac]/20 flex items-center justify-center">
                  <span className="text-xs font-display text-[#86efac]">{userName.charAt(0)}</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-medium leading-none">{userName}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {userRole}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <main className="flex-1 p-6 lg:p-10">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid lg:grid-cols-12 gap-6">
              {/* ============================================ */}
              {/* LEFT COLUMN — 8 cols                         */}
              {/* ============================================ */}
              <div className="lg:col-span-8 space-y-6">
                {/* --- Growth Track --- */}
                <div className="border border-foreground/10 bg-foreground/[0.02] p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-display">Growth Track</h2>
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        Leo&apos;s weight progress over 8 months
                      </p>
                    </div>
                    <span className="px-3 py-1 border border-[#86efac]/30 text-[10px] font-mono text-[#86efac] uppercase tracking-widest">
                      Normal Range
                    </span>
                  </div>
                  <div className="h-[220px]">
                    <GrowthChart />
                  </div>
                </div>

                {/* --- Feeding Log + Activity --- */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Feeding Log */}
                  <div className="border border-foreground/10 bg-foreground/[0.02] p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-[#86efac]/10 flex items-center justify-center">
                        <Droplets className="w-4 h-4 text-[#86efac]" />
                      </div>
                      <div>
                        <h3 className="font-display text-base">Feeding Log</h3>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Daily intake summary
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[
                        { time: "6:30 AM", type: "Breast", duration: "20 min", side: "Left" },
                        { time: "9:15 AM", type: "Breast", duration: "15 min", side: "Right" },
                        { time: "12:00 PM", type: "Formula", duration: "120 ml", side: "" },
                        { time: "3:30 PM", type: "Breast", duration: "18 min", side: "Left" },
                      ].map((feed, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2 border-b border-foreground/5 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-muted-foreground font-mono w-16">
                              {feed.time}
                            </span>
                            <span className="text-xs">{feed.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{feed.duration}</span>
                            {feed.side && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-foreground/5 text-muted-foreground">
                                {feed.side}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="border border-foreground/10 bg-foreground/[0.02] p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-[#86efac]/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-[#86efac]" />
                      </div>
                      <div>
                        <h3 className="font-display text-base">Activity</h3>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Movement and sleep
                        </p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      {activityLog.map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">{item.label}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                              {item.value}
                            </p>
                          </div>
                          <span
                            className="text-[10px] font-mono font-bold uppercase tracking-widest"
                            style={{ color: item.color }}
                          >
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Diet (New) */}
                  <div className="border border-foreground/10 bg-foreground/[0.02] p-8 sm:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#86efac]/10 flex items-center justify-center">
                          <Utensils className="w-4 h-4 text-[#86efac]" />
                        </div>
                        <div>
                          <h3 className="font-display text-base">AI Suggested Diet</h3>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            Personalized nutrition plan
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#86efac] animate-pulse">
                        LIVE_CALIBRATION
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6">
                      {[
                        { meal: 'Morning', food: 'Finger Millet (Ragi) porridge with mashed banana', nutrients: 'Iron, Calcium' },
                        { meal: 'Mid-Day', food: 'Pureed lentils (Dal) with soft rice', nutrients: 'Protein, Carbs' },
                        { meal: 'Evening', food: 'Mashed papaya or steamed carrot', nutrients: 'Vitamin A, C' },
                      ].map((diet) => (
                        <div key={diet.meal} className="p-4 border border-foreground/5 bg-foreground/[0.01]">
                          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-2">{diet.meal}</p>
                          <p className="text-sm font-medium mb-1">{diet.food}</p>
                          <p className="text-[10px] text-[#86efac]/70">{diet.nutrients}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* --- Quick Actions Bar --- */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: AudioLines, label: "Cry Decoder", accent: true },
                    { icon: Utensils, label: "Log Feeding", accent: false },
                    { icon: Syringe, label: "Vaccines", accent: false },
                    { icon: Stethoscope, label: "Consult", accent: false },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className={`p-4 border flex flex-col items-center gap-2 transition-all hover-lift ${
                        action.accent
                          ? "border-[#86efac]/30 bg-[#86efac]/5 hover:bg-[#86efac]/10"
                          : "border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.04]"
                      }`}
                    >
                      <action.icon
                        className={`w-5 h-5 ${action.accent ? "text-[#86efac]" : "text-muted-foreground"}`}
                      />
                      <span className="text-[10px] font-mono uppercase tracking-widest">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ============================================ */}
              {/* RIGHT COLUMN — 4 cols                        */}
              {/* ============================================ */}
              <div className="lg:col-span-4 space-y-6">
                {/* --- Upcoming Vaccine --- */}
                <div className="border border-foreground/10 bg-foreground/[0.02] p-8">
                  <span className="text-[10px] font-mono text-[#86efac] uppercase tracking-widest">
                    Upcoming Vaccine
                  </span>
                  <div className="mt-4 flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#86efac]/10 flex items-center justify-center shrink-0 mt-1">
                      <Syringe className="w-5 h-5 text-[#86efac]" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg">DPT Booster 1</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        6 Month · Milestone Immunization
                      </p>
                      <p className="text-xs text-[#86efac]/70 font-mono mt-2">
                        Feb 12, 2026 · 10:30 AM
                      </p>
                    </div>
                  </div>
                  <button className="w-full mt-6 py-2.5 border border-foreground/10 text-xs font-mono uppercase tracking-widest hover:border-[#86efac]/30 hover:bg-[#86efac]/5 transition-all">
                    Reschedule
                  </button>
                </div>

                {/* --- Consultations --- */}
                <div className="border border-foreground/10 bg-foreground/[0.02] p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-base">{t.dashboard.consultations}</h3>
                    <button className="text-[10px] font-mono text-[#86efac] uppercase tracking-widest hover:underline">
                      See all
                    </button>
                  </div>
                  <div className="space-y-4">
                    {consultations.map((doc) => (
                      <div
                        key={doc.name}
                        className="flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-display"
                            style={{ backgroundColor: `${doc.color}20`, color: doc.color }}
                          >
                            {doc.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-[10px] text-muted-foreground">{doc.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {doc.time}
                          </span>
                          <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* --- Health Tip --- */}
                <div className="border border-[#86efac]/20 bg-[#86efac]/5 p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-[#86efac]" />
                    <h3 className="text-sm font-display text-[#86efac]">{t.dashboard.healthTip}</h3>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed italic">
                    &ldquo;Consistent tummy time helps Leo develop strong neck and shoulder
                    muscles. Try 3–5 minutes after each diaper change.&rdquo;
                  </p>
                </div>

                {/* --- Risk Score --- */}
                <div className="border border-foreground/10 bg-foreground/[0.02] p-8">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    {t.dashboard.riskScore}
                  </span>
                  <div className="mt-4 flex items-end gap-4">
                    <span className="text-5xl font-display text-[#86efac]">12</span>
                    <span className="text-sm text-muted-foreground mb-2">/100</span>
                  </div>
                  <div className="mt-4 h-1.5 bg-foreground/10 overflow-hidden">
                    <div
                      className="h-full bg-[#86efac] transition-all duration-1000"
                      style={{ width: "12%" }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[9px] font-mono text-[#86efac]">{t.dashboard.lowRisk}</span>
                    <span className="text-[9px] font-mono text-muted-foreground">
                      Updated 2h ago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
