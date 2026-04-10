"use client";

import React from "react";
import {
    Users,
    Activity,
    Syringe,
    MessageSquare,
    AlertCircle,
    ChevronRight,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DoctorHeader } from "@/components/doctor/header";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const patients = [
    { name: "Baby Leo", age: "6m", weight: "Normal", vaccines: "Up to date", risk: "Low", lastActivity: "2h ago", mother: "Sarah Wilson", image: "https://images.unsplash.com/photo-1519689689378-430c00ad1fae?auto=format&fit=crop&q=80&w=150" },
    { name: "Baby Amara", age: "3m", weight: "Underweight", vaccines: "1 Overdue", risk: "High", lastActivity: "15m ago", mother: "Jane Doe", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150" },
    { name: "Baby Noah", age: "9m", weight: "Normal", vaccines: "Up to date", risk: "Low", lastActivity: "5h ago", mother: "Emily Blunt", image: "https://images.unsplash.com/photo-1544126592-807daa2b569b?auto=format&fit=crop&q=80&w=150" },
    { name: "Baby Zoe", age: "12m", weight: "Normal", vaccines: "Due Today", risk: "Moderate", lastActivity: "1h ago", mother: "Olivia Wilde", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" },
];

export default function DoctorDashboard() {
    return (
        <>
            <DoctorHeader title="Clinical Overview" subtitle="Good morning, Dr. Miller" />

            {/* Snapshot Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 font-secondary">
                <SnapshotWidget
                    icon={<Users size={20} />}
                    label="Monitoring"
                    value="42"
                    subValue="+3 today"
                    color="bg-blue-50 text-blue-600"
                />
                <Link href="/doctor/sos" className="block">
                    <SnapshotWidget
                        icon={<AlertCircle size={20} />}
                        label="SOS Alerts"
                        value="2"
                        subValue="Live Alerts"
                        color="bg-red-600 text-white shadow-lg shadow-red-600/20"
                    />
                </Link>
                <SnapshotWidget
                    icon={<Syringe size={20} />}
                    label="Vaccines"
                    value="8"
                    subValue="Due today"
                    color="bg-yellow-50 text-yellow-600"
                />
                <SnapshotWidget
                    icon={<MessageSquare size={20} />}
                    label="Chats"
                    value="12"
                    subValue="Unread"
                    color="bg-indigo-50 text-indigo-600"
                />
                <SnapshotWidget
                    icon={<Activity size={20} />}
                    label="High Risk"
                    value="3"
                    subValue="Requires action"
                    color="bg-orange-50 text-orange-600"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">

                {/* Patient List Table */}
                <Card className="lg:col-span-8 glass border-none shadow-xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between bg-white/20 pb-4">
                        <div>
                            <CardTitle className="text-2xl font-normal text-slate-800 font-primary">Patient Monitoring</CardTitle>
                            <CardDescription className="text-slate-500 font-medium text-xs">Live status of connected infants</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 text-xs font-bold gap-2">
                                <Filter size={14} /> Filters
                            </Button>
                            <Button size="sm" className="h-9 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold gap-2">
                                <Search size={14} /> Search
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-100 hover:bg-transparent">
                                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] pl-6">Baby Name</TableHead>
                                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Age</TableHead>
                                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Weight</TableHead>
                                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Immuno</TableHead>
                                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Risk</TableHead>
                                    <TableHead className="text-right pr-6 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {patients.map((patient) => (
                                    <TableRow key={patient.name} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 rounded-xl ring-2 ring-white shadow-sm">
                                                    <AvatarImage src={patient.image} />
                                                    <AvatarFallback>{patient.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{patient.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">Mother: {patient.mother}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-bold text-slate-600">{patient.age}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`font-bold text-[10px] uppercase border-none px-2 ${patient.weight === 'Normal' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                                {patient.weight}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-slate-500">{patient.vaccines}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${patient.risk === 'High' ? 'bg-red-500' : patient.risk === 'Moderate' ? 'bg-orange-500' : 'bg-green-500'}`} />
                                                <span className="text-xs font-bold text-slate-700">{patient.risk}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                                                <ChevronRight size={18} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* AI Risk Alerts & SOS */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* AI Alerts Card */}
                    <Card className="glass border-none shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -mr-16 -mt-16" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-normal font-primary flex items-center gap-2 text-slate-800">
                                <Activity size={20} className="text-primary" />
                                AI Risk Engine
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <AlertItem
                                    label="Underweight Anomaly"
                                    baby="Baby Amara"
                                    desc="Weight gain stalled for 14 days."
                                    priority="High"
                                />
                                <AlertItem
                                    label="Excessive Crying"
                                    baby="Baby Noah"
                                    desc="3 episodes > 45m detected."
                                    priority="Moderate"
                                />
                                <AlertItem
                                    label="Vaccine Overdue"
                                    baby="Baby Zoe"
                                    desc="Measles dose late by 5 days."
                                    priority="Moderate"
                                />
                            </div>
                            <Button className="w-full mt-6 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 rounded-xl h-11 text-xs font-bold uppercase tracking-widest transition-all">
                                View Intelligence Hub
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Population Insights Quick Stats */}
                    <Card className="glass border-none shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-normal text-slate-800 font-primary">Macro Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <InsightStat
                                label="Avg Weight (6m)"
                                value="7.2kg"
                                trend="up"
                                trendVal="+0.4"
                            />
                            <InsightStat
                                label="Vaccination Completion"
                                value="94%"
                                trend="down"
                                trendVal="-2%"
                            />
                            <InsightStat
                                label="High Risk Clusters"
                                value="1"
                                trend="neutral"
                                trendVal="Stable"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function SnapshotWidget({ icon, label, value, subValue, color }: { icon: React.ReactNode, label: string, value: string, subValue: string, color: string }) {
    return (
        <Card className="glass border-none shadow-md hover:scale-[1.02] transition-transform cursor-default">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">
                    {subValue}
                </div>
            </CardContent>
        </Card>
    );
}

function AlertItem({ label, baby, desc, priority }: { label: string, baby: string, desc: string, priority: 'High' | 'Moderate' | 'Normal' }) {
    const priorityColors = {
        High: 'text-red-600 bg-red-50',
        Moderate: 'text-orange-600 bg-orange-50',
        Normal: 'text-green-600 bg-green-50'
    };

    return (
        <div className="p-3 rounded-2xl bg-white/40 border border-white hover:bg-white hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors">{label}</p>
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${priorityColors[priority]}`}>
                    {priority}
                </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                <span className="text-slate-900 font-bold">{baby}:</span> {desc}
            </p>
        </div>
    );
}

function InsightStat({ label, value, trend, trendVal }: { label: string, value: string, trend: 'up' | 'down' | 'neutral', trendVal: string }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
                {trend === 'up' ? <ArrowUpRight size={14} /> : trend === 'down' ? <ArrowDownRight size={14} /> : null}
                {trendVal}
            </div>
        </div>
    );
}
