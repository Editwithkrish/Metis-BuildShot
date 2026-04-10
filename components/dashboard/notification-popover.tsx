"use client";

import React, { useState } from "react";
import {
    Bell,
    Check,
    Info,
    ShieldAlert,
    Droplets,
    Utensils,
    Activity,
    Clock,
    Inbox
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface Notification {
    id: string;
    text: string;
    time: string;
    type: "baby" | "mother" | "clinical";
    icon: React.ReactNode;
    color: string;
    isRead: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        text: "Mumma, mujhe bhook lagi ho sakti hai 🍼",
        time: "Just now",
        type: "baby",
        icon: <Utensils size={14} />,
        color: "bg-orange-500",
        isRead: false
    },
    {
        id: "2",
        text: "Hydration reminder: It's time for your water intake 💧",
        time: "15m ago",
        type: "mother",
        icon: <Droplets size={14} />,
        color: "bg-blue-500",
        isRead: false
    },
    {
        id: "3",
        text: "Observation: High crying intensity detected. Check feeding loop.",
        time: "1h ago",
        type: "clinical",
        icon: <ShieldAlert size={14} />,
        color: "bg-rose-500",
        isRead: false
    },
    {
        id: "4",
        text: "Vaccination: Leo's 6-month immunization is due tomorrow.",
        time: "2h ago",
        type: "clinical",
        icon: <Activity size={14} />,
        color: "bg-blue-600",
        isRead: false
    }
];

export function NotificationPopover() {
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    aria-label="Notifications"
                    className="p-2.5 rounded-full bg-white/60 backdrop-blur-xl border border-white/80 text-slate-600 hover:bg-white transition-all relative cursor-pointer shadow-sm active:scale-95"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[350px] p-0 rounded-[32px] border border-slate-100 shadow-2xl bg-white/98 backdrop-blur-2xl overflow-hidden z-[100]"
                align="end"
                sideOffset={12}
            >
                <div className="p-5 bg-white border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight">Notifications</h3>
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-black tracking-widest uppercase px-2.5 py-1">
                            {unreadCount} New
                        </Badge>
                    )}
                </div>

                <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => handleMarkAsRead(n.id)}
                                className={`p-5 border-b border-slate-50 last:border-none hover:bg-slate-50/80 transition-all group cursor-pointer relative ${!n.isRead ? 'bg-primary/[0.02]' : 'opacity-60'}`}
                            >
                                {!n.isRead && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                                )}
                                <div className="flex gap-4">
                                    <div className={`w-11 h-11 rounded-full ${n.color} text-white flex items-center justify-center shrink-0 shadow-lg shadow-${n.color.split('-')[1]}-500/20 group-hover:scale-105 transition-transform`}>
                                        {n.icon}
                                    </div>
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.1em]">{n.type === 'baby' ? 'Baby Alert' : n.type === 'mother' ? 'Mumma Sync' : 'Clinical Intelligence'}</p>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Clock size={10} className="text-slate-300" />
                                                <span className="text-[9px] font-bold text-slate-300 uppercase">{n.time}</span>
                                            </div>
                                        </div>
                                        <p className={`text-[13px] leading-relaxed break-words ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                                            {n.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                <Inbox size={32} />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">All caught up</p>
                        </div>
                    )}
                </div>

                {unreadCount > 0 && (
                    <div className="p-4 bg-slate-50/30 text-center border-t border-slate-50">
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-[10px] font-black uppercase text-slate-400 hover:text-primary tracking-[0.2em] transition-colors"
                        >
                            Mark all as read
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
