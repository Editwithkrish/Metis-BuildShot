"use client";

import React from "react";
import { DoctorHeader } from "@/components/doctor/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Phone, MessageSquare, MapPin, Navigation, Activity, Siren, Video, Heart, ShieldAlert } from "lucide-react";

const sosAlerts = [
    { id: 1, baby: "Baby Amara", mother: "Jane Doe", age: "3m", type: "Respiratory Distress", location: "1.2 km away", time: "2m ago", status: "Critical", vitals: { o2: "92%", hr: "142 bpm" } },
    { id: 2, baby: "Baby Kai", mother: "Mia Khalifa", age: "1m", type: "High Fever (103°F)", location: "4.5 km away", time: "8m ago", status: "Moderate", vitals: { o2: "98%", hr: "110 bpm" } },
];

export default function SOSPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
            <DoctorHeader title="Emergency Response" subtitle="Live dispatch and triage center" />

            <div className="flex-1 min-h-0 flex gap-6 mt-4">
                {/* Main Action Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar pb-8 space-y-6">
                    <div className="flex items-center justify-between p-6 bg-red-600 rounded-[40px] text-white shadow-2xl shadow-red-600/30">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <Siren size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">2 Live Emergencies</h2>
                                <p className="text-red-100 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Needs Immediate Physician Triage</p>
                            </div>
                        </div>
                        <ShieldAlert size={48} className="opacity-40" />
                    </div>

                    {sosAlerts.map((alert) => (
                        <Card key={alert.id} className="glass border-none shadow-2xl overflow-hidden relative group transition-all hover:scale-[1.005]">
                            <div className={`absolute left-0 top-0 w-3 h-full ${alert.status === 'Critical' ? 'bg-red-600' : 'bg-orange-500'}`} />
                            <CardContent className="p-8">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Critical Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Badge className={`${alert.status === 'Critical' ? 'bg-red-600' : 'bg-orange-500'} text-white border-none font-black text-xs px-4 py-1 uppercase tracking-widest`}>
                                                {alert.status}
                                            </Badge>
                                            <span className="text-slate-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-600" />
                                                Reported {alert.time}
                                            </span>
                                        </div>
                                        <h3 className="text-4xl font-normal text-slate-900 font-primary italic mb-2 leading-none uppercase tracking-tighter">{alert.type}</h3>
                                        <p className="text-xl font-bold text-slate-600 flex items-center gap-3">
                                            {alert.baby} <span className="text-slate-300 font-normal">|</span> <span className="text-sm font-medium uppercase tracking-widest text-slate-400">Mother: {alert.mother}</span>
                                        </p>

                                        <div className="grid grid-cols-3 gap-4 mt-8">
                                            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                                                <Heart className="text-red-500 mb-2" size={20} />
                                                <p className="text-lg font-black text-slate-900 leading-none">{alert.vitals.hr}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Heart Rate</p>
                                            </div>
                                            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                                                <Activity className="text-blue-500 mb-2" size={20} />
                                                <p className="text-lg font-black text-slate-900 leading-none">{alert.vitals.o2}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Oxygen</p>
                                            </div>
                                            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                                                <MapPin className="text-slate-400 mb-2" size={20} />
                                                <p className="text-lg font-black text-slate-900 leading-none">{alert.location}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Distance</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Unified High-Speed Actions */}
                                    <div className="flex flex-col gap-3 w-full lg:w-80">
                                        <Button className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-white rounded-[24px] shadow-xl shadow-red-600/30 text-lg font-black uppercase tracking-tighter flex items-center justify-center gap-3">
                                            <Siren size={24} /> ACCEPT CASE
                                        </Button>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button variant="outline" className="h-20 rounded-[24px] border-2 border-slate-200 hover:bg-slate-50 flex flex-col items-center justify-center gap-2 group transition-all">
                                                <Phone className="text-blue-600 group-hover:scale-110" size={24} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Call Mother</span>
                                            </Button>
                                            <Button variant="outline" className="h-20 rounded-[24px] border-2 border-slate-200 hover:bg-slate-50 flex flex-col items-center justify-center gap-2 group transition-all">
                                                <Video className="text-indigo-600 group-hover:scale-110" size={24} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Video</span>
                                            </Button>
                                        </div>
                                        <Button variant="outline" className="h-14 rounded-[24px] border-2 border-slate-200 text-slate-500 hover:text-slate-800 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                                            <Navigation size={18} /> Open GPS Tracker
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Simplified Sidebar Protocols */}
                <div className="w-80 flex flex-col gap-6">
                    <Card className="glass border-none shadow-xl rounded-[40px] overflow-hidden">
                        <div className="bg-slate-900 p-6 text-white">
                            <h4 className="text-xl font-normal font-primary italic">Emergency Triage</h4>
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black text-xs shrink-0">1</div>
                                    <p className="text-xs font-bold text-slate-700 leading-relaxed">Immediate visual assessment via high-priority video link.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs shrink-0">2</div>
                                    <p className="text-xs font-bold text-slate-400 leading-relaxed">Verify O2 saturation levels from smart sensor history.</p>
                                </div>
                                <div className="flex gap-4 opacity-50">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs shrink-0">3</div>
                                    <p className="text-xs font-bold text-slate-400 leading-relaxed">Initiate hospital-inbound notification protocol.</p>
                                </div>
                            </div>
                            <Button className="w-full h-12 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">
                                Full Guidelines
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border border-primary/20 rounded-[40px] p-6 text-center">
                        <Activity size={32} className="mx-auto text-primary mb-3" />
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Status Center</h4>
                        <p className="text-[10px] text-slate-500 font-medium mb-6 leading-relaxed">Metis Response Center is currently monitoring 1,240 live infants.</p>
                        <Button className="w-full h-10 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20">
                            Force System Update
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
