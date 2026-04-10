"use client";

import React from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from "recharts";
import {
    Plus,
    ChevronRight,
    Baby,
    Activity,
    Droplets,
    Calendar
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/header";


const weightData = [
    { month: "Jan", weight: 3.2 },
    { month: "Feb", weight: 4.1 },
    { month: "Mar", weight: 5.0 },
    { month: "Apr", weight: 5.8 },
    { month: "May", weight: 6.5 },
    { month: "Jun", weight: 7.1 },
];

const feedingData = [
    { time: "6am", amount: 120 },
    { time: "9am", amount: 100 },
    { time: "12pm", amount: 130 },
    { time: "3pm", amount: 110 },
    { time: "6pm", amount: 140 },
    { time: "9pm", amount: 90 },
];

export default function DashboardPage() {
    return (
        <>
            <DashboardHeader title="Dashboard" subtitle="Welcome back, Sarah" />

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8 font-secondary">

                {/* Left Column: Stats & Feeding */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Weight Graph Card */}
                    <Card className="glass overflow-hidden border-none shadow-xl border border-white/60">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-white/20">
                            <div>
                                <CardTitle className="text-3xl font-normal text-slate-800/90 font-primary">Growth Track</CardTitle>
                                <CardDescription className="text-slate-500 font-medium text-xs mt-1">Leo's weight progress over 6 months</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm font-semibold backdrop-blur-md">
                                Normal Range
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={weightData}>
                                        <defs>
                                            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#5C7CFA" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#5C7CFA" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94A3B8', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94A3B8', fontSize: 12 }}
                                            label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', style: { fill: '#94A3B8', fontSize: 12 } }}
                                        />
                                        <Tooltip
                                            content={<CustomTooltip />}
                                            cursor={{ stroke: '#5C7CFA', strokeWidth: 2, strokeDasharray: '5 5' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="weight"
                                            stroke="#5C7CFA"
                                            strokeWidth={4}
                                            dot={{ r: 6, fill: '#5C7CFA', strokeWidth: 3, stroke: '#fff' }}
                                            activeDot={{ r: 8, strokeWidth: 0 }}
                                            animationDuration={1500}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Feeding Summary Card */}
                        <Card className="glass border-none shadow-lg">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Droplets className="text-indigo-400" size={20} />
                                    <CardTitle className="text-2xl font-normal text-slate-800 font-primary">Feeding Log</CardTitle>
                                </div>
                                <CardDescription className="text-xs">Daily intake summary</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[180px] w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={feedingData}>
                                            <XAxis dataKey="time" hide />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(92, 124, 250, 0.05)' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-slate-100 shadow-sm text-xs font-semibold">
                                                                {payload[0].value}ml
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar
                                                dataKey="amount"
                                                radius={[6, 6, 6, 6]}
                                                barSize={20}
                                            >
                                                {feedingData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 4 ? '#5C7CFA' : '#E2E8F0'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-between items-end mt-4">
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">760ml</p>
                                        <p className="text-xs text-slate-500 font-medium">Total today</p>
                                    </div>
                                    <Button variant="ghost" className="text-primary hover:text-primary/80 h-8 px-2 text-xs font-semibold cursor-pointer">
                                        View full log <ChevronRight size={14} className="ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Summary Card */}
                        <Card className="glass border-none shadow-lg">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Activity className="text-metis-teal" size={20} />
                                    <CardTitle className="text-2xl font-normal text-slate-800 font-primary">Activity</CardTitle>
                                </div>
                                <CardDescription className="text-xs">Movement and sleep</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 py-2">
                                    <ActivityItem label="Sleep" value="12h 45m" status="optimal" />
                                    <ActivityItem label="Tummy Time" value="25m" status="average" />
                                    <ActivityItem label="Naps" value="3 today" status="optimal" />
                                </div>
                                <Button className="w-full mt-4 bg-primary hover:bg-primary/90 rounded-xl h-11 shadow-md shadow-primary/20 text-white font-semibold cursor-pointer">
                                    <Plus size={18} className="mr-2" /> Log Activity
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Key Alerts & Appointments */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* Vaccine Next Due Card */}
                    <Card className="bg-white/80 backdrop-blur-xl border-none shadow-xl border-l-4 border-l-metis-yellow">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <Badge className="bg-metis-yellow/20 text-yellow-800 hover:bg-metis-yellow/30 border-none px-2 rounded-md font-bold uppercase tracking-wider text-[10px]">
                                    Upcoming Vaccine
                                </Badge>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In 4 days</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-metis-yellow/10 flex items-center justify-center text-metis-yellow shrink-0">
                                    <Baby size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-normal text-slate-900 font-primary mb-0.5">DPT Booster 1</h3>
                                    <p className="text-xs text-slate-500 font-medium">6 Month Milestone Immunization</p>
                                    <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-600">
                                        <Calendar size={12} className="text-slate-400" />
                                        Feb 12, 2026 • 10:30 AM
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full rounded-xl border-slate-200 hover:bg-slate-50 font-semibold h-11 cursor-pointer text-slate-700">
                                Reschedule
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Appointment List */}
                    <Card className="glass flex-1 border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl font-normal flex items-center justify-between text-slate-800 font-primary">
                                Consultations
                                <Button variant="ghost" size="sm" className="text-xs text-primary font-bold cursor-pointer font-secondary">See all</Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <ConsultationItem
                                    doctor="Dr. Emily Carter"
                                    specialty="Pediatrician"
                                    time="9:00 AM"
                                    image="https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=150"
                                />
                                <ConsultationItem
                                    doctor="Dr. Max Smith"
                                    specialty="Nutritionist"
                                    time="1:45 PM"
                                    image="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150"
                                />
                                <ConsultationItem
                                    doctor="Sarah Collins"
                                    specialty="Lactation Coach"
                                    time="Tomorrow"
                                    image="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=150"
                                />
                            </div>

                            <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                <p className="text-sm font-bold text-slate-800 mb-1">Health Tip</p>
                                <p className="text-xs text-slate-600 leading-relaxed italic">
                                    "Consistent tummy time helps Leo develop strong neck and shoulder muscles."
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function ActivityItem({ label, value, status }: { label: string, value: string, status: 'optimal' | 'average' | 'low' }) {
    const statusColors = {
        optimal: 'bg-green-100 text-green-700',
        average: 'bg-yellow-100 text-yellow-700',
        low: 'bg-red-100 text-red-700'
    };

    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-bold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 font-medium">{value}</p>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[status]}`}>
                {status}
            </div>
        </div>
    );
}

function ConsultationItem({ doctor, specialty, time, image }: { doctor: string, specialty: string, time: string, image: string }) {
    return (
        <div className="flex items-center gap-4 group cursor-pointer">
            <Avatar className="h-11 w-11 rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                <AvatarImage src={image} />
                <AvatarFallback>{doctor[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm truncate">{doctor}</h4>
                <p className="text-xs text-slate-500 truncate font-medium">{specialty}</p>
            </div>
            <Badge variant="secondary" className="bg-slate-50 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors text-[10px] font-bold">
                {time}
            </Badge>
        </div>
    );
}

function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-3 px-4 rounded-2xl shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-xl font-black text-primary">
                    {payload[0].value} <span className="text-sm font-medium">kg</span>
                </p>
            </div>
        );
    }
    return null;
}
