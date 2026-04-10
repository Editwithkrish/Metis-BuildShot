"use client";

import React from "react";
import { Search, Bell, Activity } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface DoctorHeaderProps {
    title: string;
    subtitle?: string;
}

export function DoctorHeader({ title, subtitle }: DoctorHeaderProps) {
    return (
        <header className="grid grid-cols-3 items-center gap-4 h-16 w-full relative z-[60]">
            {/* Title Section */}
            <div className="flex flex-col justify-center">
                <h1 className="text-3xl font-normal tracking-tight text-slate-900/90 font-primary">
                    {title}
                </h1>
                {subtitle && <p className="text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis text-xs mt-0.5 font-secondary">{subtitle}</p>}
            </div>

            {/* Search Section */}
            <div className="flex justify-center hidden md:flex font-secondary">
                <div className="relative group w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="search"
                        placeholder="Search patients, records, alerts..."
                        className="w-full h-12 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 text-sm"
                    />
                </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-4 justify-self-end">
                <Link
                    href="/doctor/sos"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-600 border border-red-500 text-white hover:bg-red-700 transition-all cursor-pointer group shadow-lg shadow-red-600/20"
                >
                    <Activity size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">SOS Live</span>
                </Link>

                <button
                    aria-label="Notifications"
                    className="p-2.5 rounded-full bg-white/40 backdrop-blur-xl border border-white/60 text-slate-600 hover:bg-white/60 transition-colors relative cursor-pointer"
                >
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-400 rounded-full border-2 border-white"></span>
                </button>
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white/60 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                        <AvatarImage
                            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150"
                            alt="Doctor profile"
                        />
                        <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-sm cursor-default font-secondary">
                        <p className="font-bold text-slate-900/80 leading-none">Dr. James Miller</p>
                        <p className="text-slate-500 text-[10px] mt-1 font-bold uppercase tracking-wider">Chief Pediatrician</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
