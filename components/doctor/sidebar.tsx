"use client";

import React from "react";
import {
    LayoutDashboard,
    Users,
    Syringe,
    AlertCircle,
    MessageSquare,
    Stethoscope,
    Calendar,
    FileText,
    BarChart3,
    Settings,
    LogOut,
    Baby
} from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface NavItemProps {
    icon: React.ReactNode;
    active?: boolean;
    href?: string;
    onClick?: () => void;
    label?: string;
}

function NavItem({ icon, active = false, href, onClick, label }: NavItemProps) {
    const content = (
        <button
            onClick={onClick}
            title={label}
            className={`
        relative p-3 rounded-[10px] transition-all duration-300 cursor-pointer z-10
        ${active
                    ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105"
                    : "text-slate-400 hover:bg-white/80 hover:text-slate-900 hover:shadow-md hover:scale-105"}
      `}>
            {icon}
        </button>
    );

    if (href) {
        return (
            <Link href={href} className="relative w-full flex justify-center group">
                {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[2px_0_10px_rgba(92,124,250,0.2)] z-20" />
                )}
                {content}
            </Link>
        );
    }

    return (
        <div className="relative w-full flex justify-center group">
            {content}
        </div>
    );
}

export function DoctorSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/onboarding");
        router.refresh();
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-20 md:w-24 flex flex-col items-center py-8 gap-6 border-r border-white/40 z-50 backdrop-blur-xl bg-white/30">
            <Link href="/doctor" className="text-primary font-bold text-2xl tracking-tight font-primary hover:scale-110 transition-transform cursor-pointer mb-2">
                Metis
            </Link>

            <nav className="flex flex-col gap-4 w-full overflow-y-auto no-scrollbar pb-10">
                <NavItem icon={<LayoutDashboard size={22} />} href="/doctor" active={pathname === "/doctor"} label="Overview" />
                <NavItem icon={<Users size={22} />} href="/doctor/patients" active={pathname === "/doctor/patients"} label="Patients" />
                <NavItem icon={<Syringe size={22} />} href="/doctor/vaccinations" active={pathname === "/doctor/vaccinations"} label="Vaccinations" />
                <NavItem icon={<AlertCircle size={22} />} href="/doctor/risk-alerts" active={pathname === "/doctor/risk-alerts"} label="Risk Alerts" />
                <NavItem icon={<MessageSquare size={22} />} href="/doctor/chats" active={pathname === "/doctor/chats"} label="Chats" />
                <NavItem icon={<Stethoscope size={22} />} href="/doctor/sos" active={pathname === "/doctor/sos"} label="SOS Emergencies" />
                <NavItem icon={<Calendar size={22} />} href="/doctor/appointments" active={pathname === "/doctor/appointments"} label="Appointments" />
                <NavItem icon={<FileText size={22} />} href="/doctor/records" active={pathname === "/doctor/records"} label="Records" />
                <NavItem icon={<BarChart3 size={22} />} href="/doctor/analytics" active={pathname === "/doctor/analytics"} label="Analytics" />
                <NavItem icon={<Settings size={22} />} href="/doctor/settings" active={pathname === "/doctor/settings"} label="Settings" />
            </nav>

            <div className="mt-auto w-full flex justify-center">
                <NavItem icon={<LogOut size={22} />} onClick={handleLogout} label="Logout" />
                <NavItem icon={<Baby size={22} />} href="/dashboard" label="Switch to Mother Dashboard" />
            </div>
        </aside>
    );
}
