"use client";

import React, { useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    User,
    Video,
    MapPin,
    Plus,
    Activity,
    MessageSquare,
    Search
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Appointment {
    id: string;
    patientName: string;
    motherName: string;
    date: string;
    time: string;
    type: 'physical' | 'virtual' | 'emergency';
    status: 'upcoming' | 'completed' | 'cancelled';
    description: string;
    patientImage?: string;
}

const initialAppointments: Appointment[] = [
    { id: "1", patientName: "Baby Leo", motherName: "Sarah Wilson", date: "2026-02-08", time: "10:30 AM", type: 'physical', status: 'upcoming', description: "6 Month Routine Checkup & Vaccination", patientImage: "https://images.unsplash.com/photo-1519689689378-430c00ad1fae?auto=format&fit=crop&q=80&w=150" },
    { id: "2", patientName: "Baby Amara", motherName: "Jane Doe", date: "2026-02-08", time: "01:00 PM", type: 'virtual', status: 'upcoming', description: "Follow-up for underweight recovery", patientImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150" },
    { id: "3", patientName: "Baby Noah", motherName: "Emily Blunt", date: "2026-02-09", time: "09:00 AM", type: 'physical', status: 'upcoming', description: "General consultation", patientImage: "https://images.unsplash.com/photo-1544126592-807daa2b569b?auto=format&fit=crop&q=80&w=150" },
    { id: "4", patientName: "Baby Zoe", motherName: "Olivia Wilde", date: "2026-02-12", time: "11:00 AM", type: 'physical', status: 'upcoming', description: "12 Month Milestone Screening", patientImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" },
    { id: "5", patientName: "Baby Kai", motherName: "Mia Khalifa", date: "2026-02-07", time: "10:00 AM", type: 'physical', status: 'completed', description: "Newborn screening", patientImage: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&q=80&w=150" },
];

export function DoctorCalendarView() {
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // Feb 2026
    const [selectedDate, setSelectedDate] = useState<string>("2026-02-08");

    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

    const monthName = currentMonth.toLocaleString('default', { month: 'long' });
    const year = currentMonth.getFullYear();

    const totalDays = daysInMonth(currentMonth.getMonth(), year);
    const startDay = firstDayOfMonth(currentMonth.getMonth(), year);

    const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
    const paddingArray = Array.from({ length: startDay }, (_, i) => null);

    const getAppointmentsForDay = (day: number) => {
        const dateStr = `${year}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return initialAppointments.filter(a => a.date === dateStr);
    };

    const selectedAppointments = initialAppointments.filter(a => a.date === selectedDate);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full font-secondary">
            {/* Left Column: Date Grid */}
            <div className="lg:col-span-8 space-y-6">
                <Card className="glass border-none shadow-xl p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-6">
                            <div>
                                <h3 className="text-3xl font-normal text-slate-800 font-primary italic">
                                    {monthName} <span className="opacity-40">{year}</span>
                                </h3>
                                <p className="text-slate-500 font-medium text-xs mt-1 uppercase tracking-widest font-secondary">Clinical Schedule</p>
                            </div>
                            <div className="hidden md:flex bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
                                <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white rounded-lg shadow-sm text-primary">Month</button>
                                <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Week</button>
                                <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Day</button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 hover:bg-white/60">
                                <ChevronLeft size={20} />
                            </Button>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 hover:bg-white/60">
                                <ChevronRight size={20} />
                            </Button>
                            <Button className="h-9 px-4 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest ml-2">
                                <Plus size={16} className="mr-1.5" /> New Consult
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 rounded-3xl overflow-hidden border border-slate-100 bg-white/10 shadow-inner">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="h-12 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 border-r border-b border-slate-100 last:border-r-0">
                                {day}
                            </div>
                        ))}
                        {paddingArray.map((_, i) => (
                            <div key={`pad-${i}`} className="h-32 bg-white/5 border-r border-b border-slate-100 last:border-r-0" />
                        ))}
                        {daysArray.map(day => {
                            const appointments = getAppointmentsForDay(day);
                            const dateStr = `${year}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = selectedDate === dateStr;
                            const isToday = day === 8; // Mock for current day (Feb 8)
                            const hasAppointments = appointments.length > 0;

                            return (
                                <div
                                    key={day}
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={`
                                        h-32 p-3 border-r border-b border-slate-100 relative transition-all cursor-pointer last:border-r-0
                                        ${isSelected ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset z-10' : 'bg-transparent hover:bg-slate-50/50'}
                                        ${isToday ? 'bg-slate-50/80' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-sm font-black ${isToday ? 'text-primary' : isSelected ? 'text-primary' : 'text-slate-400'} ${isToday ? 'bg-primary/10 w-8 h-8 flex items-center justify-center rounded-2xl shadow-sm' : ''}`}>
                                            {day}
                                        </span>
                                        {hasAppointments && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" title={`${appointments.length} Consultations`} />
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        {appointments.slice(0, 2).map(app => (
                                            <div key={app.id} className={`
                                                px-2 py-1 rounded-lg text-[9px] font-bold border truncate
                                                ${app.type === 'physical' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    app.type === 'virtual' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                        'bg-red-50 text-red-700 border-red-100'}
                                            `}>
                                                {app.time}: {app.patientName}
                                            </div>
                                        ))}
                                        {appointments.length > 2 && (
                                            <p className="text-[9px] text-slate-400 font-bold ml-1">+{appointments.length - 2} more</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Right Column: Appointment Details */}
            <div className="lg:col-span-4 h-full">
                <AppointmentDetailCard
                    appointments={selectedAppointments}
                    date={selectedDate}
                />
            </div>
        </div>
    );
}

function AppointmentDetailCard({ appointments, date }: { appointments: Appointment[], date: string }) {
    const formattedDate = new Date(date).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <Card className="glass border-none shadow-xl flex flex-col h-full min-h-[600px] overflow-hidden">
            <div className="p-6 border-b border-white pb-6 bg-white/20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-normal text-slate-800 font-primary italic">Agenda</h3>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-black px-2 py-1">
                        {appointments.length} Consults
                    </Badge>
                </div>
                <div>
                    <p className="text-2xl font-black text-slate-900 leading-none">{formattedDate}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 font-secondary">Daily Clinical Log</p>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                {appointments.length > 0 ? (
                    appointments.map(app => (
                        <div key={app.id} className="group cursor-pointer">
                            <div className="flex items-start gap-4 p-5 rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{app.time.split(' ')[0]}</div>
                                    <div className="w-px h-10 bg-slate-100" />
                                    <Badge className={`text-[8px] font-black uppercase ${app.status === 'completed' ? 'bg-green-500' : 'bg-primary'}`}>
                                        {app.status}
                                    </Badge>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="h-10 w-10 rounded-2xl ring-2 ring-white shadow-md">
                                            <AvatarImage src={app.patientImage} />
                                            <AvatarFallback><User size={20} /></AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-black text-slate-800 text-sm leading-none mb-1">{app.patientName}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Mother: {app.motherName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        {app.type === 'physical' ? (
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold">
                                                <MapPin size={12} /> Clinic Visit
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                                                <Video size={12} /> Telemedicine
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-bold">
                                            <Clock size={12} /> 30m
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-2xl italic">
                                        "{app.description}"
                                    </p>

                                    <div className="flex items-center gap-2 mt-4">
                                        <Button size="sm" className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest h-9">
                                            {app.type === 'virtual' ? 'Join Link' : 'Start Log'}
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 hover:text-primary">
                                            <Activity size={16} />
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 hover:text-indigo-600">
                                            <MessageSquare size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
                            <CalendarIcon size={32} />
                        </div>
                        <p className="font-black text-sm uppercase tracking-widest">No Consultations</p>
                        <p className="text-xs font-medium mt-1">Select another date or add new</p>
                    </div>
                )}
            </div>

            <div className="p-6 bg-slate-50/80 border-t border-white">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search daily agenda..."
                        className="w-full h-11 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    />
                </div>
            </div>
        </Card>
    );
}
