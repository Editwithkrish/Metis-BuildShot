"use client";

import React from "react";
import { DoctorHeader } from "@/components/doctor/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight, ArrowDownRight, Users, Syringe, Activity, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const trendData = [
    { month: "Sep", malnutrition: 12, vaccines: 92 },
    { month: "Oct", malnutrition: 10, vaccines: 94 },
    { month: "Nov", malnutrition: 15, vaccines: 89 },
    { month: "Dec", malnutrition: 14, vaccines: 91 },
    { month: "Jan", malnutrition: 11, vaccines: 95 },
    { month: "Feb", malnutrition: 9, vaccines: 97 },
];

const riskDistribution = [
    { name: "Normal", value: 65, color: "#10b981" },
    { name: "Moderate", value: 25, color: "#f59e0b" },
    { name: "Critical", value: 10, color: "#ef4444" },
];

export default function AnalyticsPage() {
    return (
        <>
            <DoctorHeader title="Population Insights" subtitle="Macro trends across your patient network" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-secondary">
                <StatCard label="Network Health Score" value="94.2" trend="+1.2%" up={true} icon={<Activity />} />
                <StatCard label="Avg Vaccination Rate" value="89%" trend="-2.4%" up={false} icon={<Syringe />} />
                <StatCard label="Total Monitored" value="1,240" trend="+42" up={true} icon={<Users />} />
                <StatCard label="Active SOS Clusters" value="0" trend="Stable" up={true} icon={<Globe />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8 font-secondary">

                {/* Long-term Trends */}
                <Card className="lg:col-span-8 glass border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-normal text-slate-800 font-primary">Longitudinal Trends</CardTitle>
                        <p className="text-xs text-slate-500 font-medium font-secondary">Malnutrition vs Vaccination completion over 6 months</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#5C7CFA" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#5C7CFA" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="vaccines" stroke="#5C7CFA" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                                    <Area type="monotone" dataKey="malnutrition" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Risk Distribution */}
                <Card className="lg:col-span-4 glass border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-normal text-slate-800 font-primary">Risk Distribution</CardTitle>
                        <p className="text-xs text-slate-500 font-medium font-secondary">Population clinical risk segmentation</p>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="h-[250px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={riskDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {riskDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-2xl font-black text-slate-800">1,240</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Infants</p>
                            </div>
                        </div>
                        <div className="w-full space-y-3 mt-6">
                            {riskDistribution.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs font-bold text-slate-700">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-900">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full mt-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs h-12 rounded-2xl shadow-xl shadow-primary/20">
                            Download Census Report
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function StatCard({ label, value, trend, up, icon }: { label: string, value: string, trend: string, up: boolean, icon: React.ReactNode }) {
    return (
        <Card className="glass border-none shadow-lg">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900">
                        {icon}
                    </div>
                    <div className={`flex items-center gap-1 text-[11px] font-black ${up ? 'text-green-500' : 'text-red-500'}`}>
                        {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {trend}
                    </div>
                </div>
                <p className="text-3xl font-black text-slate-900 leading-none">{value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">{label}</p>
            </CardContent>
        </Card>
    );
}
