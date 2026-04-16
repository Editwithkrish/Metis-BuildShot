"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Baby,
  TrendingUp,
  Utensils,
  Activity,
  Stethoscope,
  Syringe,
  Settings,
  LogOut,
  Bell,
  Menu,
  AudioLines,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Baby, label: "Cry Decoder", href: "/dashboard/cry-decoder" },
  { icon: TrendingUp, label: "Growth", href: "/dashboard/growth" },
  { icon: Utensils, label: "Nutrition", href: "/dashboard/nutrition" },
  { icon: Activity, label: "Activity", href: "/dashboard/activity" },
  { icon: Stethoscope, label: "Consult", href: "/dashboard/consult" },
  { icon: Syringe, label: "Vaccines", href: "/dashboard/vaccines" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  const pathname = usePathname();
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
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ---- SIDEBAR ---- */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[72px] bg-card border-r border-foreground/10 flex flex-col items-center py-6 gap-2 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Link href="/" className="mb-6 group">
          <div className="w-10 h-10 border border-[#86efac]/30 bg-[#86efac]/10 flex items-center justify-center group-hover:bg-[#86efac]/20 transition-colors">
            <img src="/logo.png" alt="METIS Logo" className="w-6 h-6 object-contain" />
          </div>
        </Link>

        <nav className="flex-1 flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                title={item.label}
                className={`w-10 h-10 flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-[#86efac]/10 text-[#86efac]"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
              </Link>
            );
          })}
        </nav>

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
                <h1 className="text-lg font-display">
                  {pathname === "/dashboard" ? "Dashboard" : 
                   pathname.includes("cry-decoder") ? "Cry Decoder" : "METIS"}
                </h1>
                <p className="text-[11px] text-muted-foreground font-mono -mt-0.5">
                  {t.dashboard.welcome}, {userName.split(' ')[0]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/dashboard/cry-decoder" className="hidden sm:flex items-center gap-2 px-4 py-2 border border-foreground/10 hover:border-[#86efac]/30 hover:bg-[#86efac]/5 transition-all text-xs font-mono uppercase tracking-wider">
                <AudioLines className="w-4 h-4 text-[#86efac]" />
                Cry Decoder
              </Link>

              <button className="relative w-9 h-9 flex items-center justify-center border border-foreground/10 hover:bg-foreground/5 transition-colors">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#86efac] rounded-full" />
              </button>

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

        <main className="flex-1 p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
