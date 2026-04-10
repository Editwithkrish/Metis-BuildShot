"use client";

import React from "react";
import { DoctorHeader } from "@/components/doctor/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Clock, Search, Filter, History } from "lucide-react";

export default function RecordsPage() {
    return (
        <>
            <DoctorHeader title="Clinical Repository" subtitle="Centralized access to infant health records & EHRs" />

            <div className="flex flex-col gap-6 pb-8">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Patient Name, ID, or Mother..."
                            className="w-full h-12 bg-white border border-slate-100 rounded-2xl pl-12 pr-4 text-sm font-medium focus:outline-none shadow-sm focus:ring-2 focus:ring-primary/10 transition-all font-secondary"
                        />
                    </div>
                    <Button variant="outline" className="h-12 rounded-2xl border-slate-200 px-6 font-bold gap-2">
                        <Filter size={18} /> Category
                    </Button>
                    <Button className="h-12 rounded-2xl bg-primary text-white px-6 font-bold gap-2 shadow-lg shadow-primary/20">
                        Upload Record
                    </Button>
                </div>

                <Card className="glass border-none shadow-xl overflow-hidden">
                    <CardHeader className="bg-white/20 pb-4">
                        <CardTitle className="text-2xl font-normal text-slate-800 font-primary italic flex items-center gap-3">
                            <History size={24} className="text-primary" />
                            Recent Document Access
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100/50">
                            {[1, 2, 3, 4].map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:scale-110 transition-transform">
                                            <FileText size={28} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg mb-0.5">Vaccination Certificate - Dose 2</h4>
                                            <p className="text-sm font-medium text-slate-500 mb-1">Patient: Baby Zoe · Added Jan 15, 2026</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-slate-50 text-slate-500 border-none text-[9px] font-black uppercase tracking-widest px-2">PDF</Badge>
                                                <Badge variant="outline" className="bg-green-50 text-green-600 border-none text-[9px] font-black uppercase tracking-widest px-2">Verified</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-slate-400 hover:text-primary hover:bg-primary/5">
                                            <Eye size={20} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-slate-400 hover:text-primary hover:bg-primary/5">
                                            <Download size={20} />
                                        </Button>
                                        <Button variant="outline" className="h-11 rounded-xl border-slate-200 text-xs font-bold px-4 hover:bg-slate-900 hover:text-white transition-all">
                                            Clinical Review
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
