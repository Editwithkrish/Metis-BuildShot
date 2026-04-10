"use client";

import React from "react";
import {
    LayoutDashboard,
    Calendar,
    MessageSquare,
    Stethoscope,
    ShieldCheck,
    LogOut,
    Utensils,
    Bell
} from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface NavItemProps {
    icon: React.ReactNode;
    active?: boolean;
    href?: string;
    onClick?: () => void;
}

function NavItem({ icon, active = false, href, onClick }: NavItemProps) {
    const content = (
        <button
            onClick={onClick}
            className={`
        relative p-3 rounded-[10px] transition-all duration-300 cursor-pointer z-10
        ${active
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105"
                    : "text-slate-400 hover:bg-white/80 hover:text-slate-900 hover:shadow-md hover:scale-105"}
      `}>
            {icon}
        </button>
    );

    if (href) {
        return (
            <Link href={href} className="relative w-full flex justify-center group">
                {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-slate-900 rounded-r-full shadow-[2px_0_10px_rgba(15,23,42,0.1)] z-20" />
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

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/onboarding");
        router.refresh();
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-20 md:w-24 flex flex-col items-center py-8 gap-10 border-r border-white/40 z-50 backdrop-blur-xl bg-white/30">
            <Link href="/dashboard" className="text-primary font-bold text-2xl tracking-tight font-primary hover:scale-110 transition-transform cursor-pointer mb-2">
                Metis
            </Link>

            <nav className="flex flex-col gap-6 w-full">
                <NavItem icon={<LayoutDashboard size={22} />} href="/dashboard" active={pathname === "/dashboard"} />
                <NavItem icon={<Calendar size={22} />} href="/calendar" active={pathname === "/calendar"} />
                <NavItem icon={<ShieldCheck size={22} />} href="/vault" active={pathname === "/vault"} />
                <NavItem icon={<Stethoscope size={22} />} href="/specialists" active={pathname === "/specialists"} />
                <NavItem icon={<Utensils size={22} />} href="/nutrition" active={pathname === "/nutrition"} />
                <NavItem icon={<MessageSquare size={22} />} href="/messages" active={pathname === "/messages"} />
            </nav>

            <div className="mt-auto w-full flex justify-center">
                <NavItem
                    icon={<LogOut size={22} />}
                    onClick={handleLogout}
                />
            </div>
        </aside>
    );
}
