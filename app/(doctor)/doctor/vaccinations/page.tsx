"use client";

import React from "react";
import { DoctorHeader } from "@/components/doctor/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Syringe, Calendar, CheckCircle2, AlertCircle, Clock, Search, ChevronRight } from "lucide-react";

const vaccineSchedule = [
    { baby: "Baby Leo", mother: "Sarah Wilson", vaccine: "DPT Booster 1", due: "Feb 12, 2026", status: "Upcoming", priority: "Medium" },
    { baby: "Baby Amara", mother: "Jane Doe", vaccine: "Measles (MCV1)", due: "Feb 01, 2026", status: "Overdue", priority: "High" },
    { baby: "Baby Zoe", mother: "Olivia Wilde", vaccine: "Polio (OPV3)", due: "Today", status: "Due", priority: "High" },
    { baby: "Baby Noah", mother: "Emily Blunt", vaccine: "Hepatitis B", due: "Completed", status: "Administered", priority: "Normal" },
];

export default function VaccinationsPage() {
    return (
        <>
            <DoctorHeader title="Vaccine Command Center" subtitle="Manage and verify patient immunizations" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8 font-secondary">

                {/* Actionable List */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Card className="glass border-none shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-normal text-slate-800 font-primary">Immunization Queue</CardTitle>
                                <p className="text-xs text-slate-500 font-medium">Verify and log doses for today&apos;s clinic</p>
                            </div>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button className="px-4 py-1.5 text-xs font-bold bg-white rounded-lg shadow-sm text-primary">Pending</button>
                                <button className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600">History</button>
                            </div>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="divide-y divide-slate-100/50">
                                {vaccineSchedule.map((item, i) => (
                                    <div key={i} className="flex items-center gap-6 px-6 py-5 hover:bg-slate-50/50 transition-colors group">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.status === 'Overdue' ? 'bg-red-50 text-red-500' :
                                            item.status === 'Due' ? 'bg-yellow-50 text-yellow-600' :
                                                item.status === 'Upcoming' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                            }`}>
                                            <Syringe size={22} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-slate-800 text-sm truncate">{item.baby}</h4>
                                                <Badge className={`text-[9px] uppercase tracking-wider font-black ${item.priority === 'High' ? 'bg-red-500' :
                                                    item.priority === 'Medium' ? 'bg-orange-400' : 'bg-green-500'
                                                    }`}>
                                                    {item.priority}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 font-bold mb-1">{item.vaccine}</p>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {item.due}</span>
                                                <span className="flex items-center gap-1"><CheckCircle2 size={12} /> {item.mother}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.status !== 'Administered' ? (
                                                <>
                                                    <Button size="sm" className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-[11px] font-black uppercase tracking-wider">
                                                        Log Dose
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl text-slate-400 hover:bg-slate-100">
                                                        <Clock size={16} />
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2 text-green-600 font-bold text-xs pr-4">
                                                    <CheckCircle2 size={16} /> Administered
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Stats & Distribution */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="glass border-none shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -mr-16 -mt-16" />
                        <CardHeader>
                            <CardTitle className="text-xl font-normal font-primary text-slate-800">Compliance Hub</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ComplianceStat label="Scheduled Doses" value="324" total="500" progress={65} color="bg-primary" />
                            <ComplianceStat label="Coverage Rate" value="94%" total="100%" progress={94} color="bg-green-500" />
                            <ComplianceStat label="Drop-out Risk" value="12" total="100" progress={12} color="bg-red-400" />

                            <Button className="w-full mt-2 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 rounded-xl h-12 text-xs font-bold uppercase tracking-widest transition-all">
                                Export Govt Reports
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="glass border-none shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-normal text-slate-800 font-primary">Stock Alert</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <StockItem label="BCG Vaccine" level="Low" count="12 doses left" />
                                <StockItem label="DPT-HepB-Hib" level="Good" count="142 doses left" />
                                <StockItem label="OPV Stocks" level="Critical" count="2 doses left" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function ComplianceStat({ label, value, total, progress, color }: { label: string, value: string, total: string, progress: number, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
                <p className="text-lg font-black">{value}</p>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
}

function StockItem({ label, level, count }: { label: string, level: 'Good' | 'Low' | 'Critical', count: string }) {
    const levelColors = {
        Good: 'text-green-600 bg-green-50',
        Low: 'text-orange-600 bg-orange-50',
        Critical: 'text-red-600 bg-red-50'
    };

    return (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
            <div>
                <p className="text-sm font-bold text-slate-800">{label}</p>
                <p className="text-[10px] text-slate-500 font-medium">{count}</p>
            </div>
            <Badge variant="outline" className={`font-bold text-[9px] uppercase border-none px-2 ${levelColors[level]}`}>
                {level}
            </Badge>
        </div>
    );
}
