"use client";

import React from "react";
import { DoctorHeader } from "@/components/doctor/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Activity, ChevronRight, Filter } from "lucide-react";

export default function RiskAlertsPage() {
    return (
        <>
            <DoctorHeader title="AI Risk Intelligence" subtitle="Predictive anomaly detection across patients" />

            <div className="grid grid-cols-1 gap-6 pb-8">
                <Card className="glass border-none shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-normal text-slate-800 font-primary italic">Critical Anomalies</CardTitle>
                            <p className="text-xs text-slate-500 font-medium font-secondary">High-priority alerts requiring clinical review</p>
                        </div>
                        <Button variant="outline" className="h-9 rounded-xl border-slate-200 text-xs font-bold gap-2">
                            <Filter size={14} /> Intelligence Filter
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-6 rounded-[32px] bg-white border border-slate-100 hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shadow-sm border border-red-100">
                                            <AlertCircle size={28} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-black text-slate-800 text-lg">Underweight Trend Detected</h4>
                                                <Badge className="bg-red-500 text-white border-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5">High Priority</Badge>
                                            </div>
                                            <p className="text-sm font-medium text-slate-500">Patient: Baby Amara · Identified 14h ago via Smart Scale sync</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right mr-4">
                                            <p className="text-xs font-black text-slate-800 uppercase tracking-widest">94% Confidence</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">AI Recommendation: In-person Checkup</p>
                                        </div>
                                        <Button className="h-11 rounded-xl bg-slate-900 text-white font-bold text-xs px-6">
                                            Take Action
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
