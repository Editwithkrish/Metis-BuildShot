"use client";

import React from "react";
import { DoctorHeader } from "@/components/doctor/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, ChevronRight, Filter, Search } from "lucide-react";

const patients = [
    { name: "Baby Leo", age: "6m", weight: "Normal", vaccines: "Up to date", risk: "Low", lastActivity: "2h ago", mother: "Sarah Wilson", image: "https://images.unsplash.com/photo-1519689689378-430c00ad1fae?auto=format&fit=crop&q=80&w=150", status: "Active" },
    { name: "Baby Amara", age: "3m", weight: "Underweight", vaccines: "1 Overdue", risk: "High", lastActivity: "15m ago", mother: "Jane Doe", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150", status: "Priority" },
    { name: "Baby Noah", age: "9m", weight: "Normal", vaccines: "Up to date", risk: "Low", lastActivity: "5h ago", mother: "Emily Blunt", image: "https://images.unsplash.com/photo-1544126592-807daa2b569b?auto=format&fit=crop&q=80&w=150", status: "Active" },
    { name: "Baby Zoe", age: "12m", weight: "Normal", vaccines: "Due Today", risk: "Moderate", lastActivity: "1h ago", mother: "Olivia Wilde", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", status: "Attention" },
    { name: "Baby Kai", age: "1m", weight: "Normal", vaccines: "Up to date", risk: "Low", lastActivity: "Just now", mother: "Mia Khalifa", image: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&q=80&w=150", status: "New" },
];

export default function PatientsPage() {
    return (
        <>
            <DoctorHeader title="Patient Directory" subtitle="Manage your clinical patient list" />

            <div className="flex flex-col gap-6 font-secondary">
                <Card className="glass border-none shadow-xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between bg-white/20 pb-4 px-6 pt-6">
                        <div className="flex items-center gap-4">
                            <div className="relative group w-72">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name, ID..."
                                    className="w-full h-11 bg-white/60 border border-slate-200 rounded-xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                />
                            </div>
                            <Button variant="outline" className="h-11 rounded-xl border-slate-200 text-xs font-bold gap-2 bg-white/60">
                                <Filter size={16} /> Advanced Filters
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border-none px-3 py-1.5 rounded-lg font-bold">Total: 142 Parents</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-100 hover:bg-transparent">
                                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px] pl-6 h-12">Patient Profile</TableHead>
                                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Age / Dev</TableHead>
                                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Clinical Status</TableHead>
                                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Risk Alert</TableHead>
                                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Connected EHR</TableHead>
                                    <TableHead className="text-right pr-6 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Management</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {patients.map((patient) => (
                                    <TableRow key={patient.name} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                        <TableCell className="pl-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12 rounded-2xl ring-2 ring-white shadow-md">
                                                    <AvatarImage src={patient.image} />
                                                    <AvatarFallback>{patient.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm leading-none mb-1">{patient.name}</p>
                                                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide">ID: MET-{Math.floor(Math.random() * 9000) + 1000}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-bold text-slate-700 text-sm">{patient.age}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Month Milestone</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`font-bold text-[10px] uppercase border-none px-2 py-1 ${patient.status === 'Priority' ? 'bg-red-100 text-red-700' :
                                                    patient.status === 'Attention' ? 'bg-orange-100 text-orange-700' :
                                                        patient.status === 'New' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {patient.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${patient.risk === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : patient.risk === 'Moderate' ? 'bg-orange-500' : 'bg-green-500'}`} />
                                                <span className="text-xs font-bold text-slate-700">{patient.risk} Profile</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <FileText size={14} className="text-slate-400" />
                                                <span className="text-xs font-medium">14 indexed</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 transition-all font-bold text-[10px] uppercase tracking-wider">
                                                    <MessageSquare size={14} className="mr-1.5" /> Chat
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl hover:bg-primary/10 hover:text-primary text-slate-400 hover:scale-105 transition-all">
                                                    <ChevronRight size={20} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
