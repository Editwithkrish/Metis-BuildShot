"use client";

import React, { useState } from "react";
import { Search, Bell, Waves } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CryDetectionModal } from "./cry-detection/cry-detection-modal";
import { NotificationPopover } from "./notification-popover";

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
    const [isCryModalOpen, setIsCryModalOpen] = useState(false);

    return (
        <header className="grid grid-cols-3 items-center gap-4 h-16 w-full relative z-[60]">
            {/* Title Section */}
            <div className="flex flex-col justify-center">
                <h1 className="text-3xl font-normal tracking-tight text-slate-900/90 font-primary">
                    {title}
                </h1>
                {subtitle && <p className="text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis text-xs mt-0.5 font-secondary">{subtitle}</p>}
            </div>

            {/* Search Section - Guaranteed Center */}
            <div className="flex justify-center hidden md:flex font-secondary">
                <div className="relative group w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="search"
                        placeholder="Search metrics, consultations..."
                        className="w-full h-12 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 text-sm"
                    />
                </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-4 justify-self-end">
                {/* Cry Detection Trigger */}
                <button
                    onClick={() => setIsCryModalOpen(true)}
                    aria-label="Cry Detection"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all cursor-pointer group"
                >
                    <Waves size={18} className="group-hover:animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:block">Cry Decoder</span>
                </button>

                <NotificationPopover />
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white/60 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                        <AvatarImage
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
                            alt="User profile"
                        />
                        <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-sm cursor-default font-secondary">
                        <p className="font-bold text-slate-900/80 leading-none">Sarah Wilson</p>
                        <p className="text-slate-500 text-[10px] mt-1 font-bold uppercase tracking-wider">Mom of baby Leo</p>
                    </div>
                </div>
            </div>

            <CryDetectionModal
                isOpen={isCryModalOpen}
                onClose={() => setIsCryModalOpen(false)}
            />
        </header>
    );
}
