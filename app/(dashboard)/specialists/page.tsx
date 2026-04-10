"use client";

import React, { useState } from "react";
import {
    Search,
    Video,
    Calendar,
    MessageCircle,
    Star,
    Clock,
    MapPin,
    Filter,
    ArrowRight,
    Stethoscope,
    ShieldCheck,
    Award
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const specialistCategories = [
    { id: "all", label: "All Specialists", count: 24 },
    { id: "pediatrician", label: "Pediatricians", count: 12 },
    { id: "nutritionist", label: "Nutritionists", count: 5 },
    { id: "lactation", label: "Lactation", count: 4 },
    { id: "psychologist", label: "Psychologists", count: 3 },
];

const specialists = [
    {
        id: "1",
        name: "Dr. Sarita Sharma",
        specialty: "Senior Pediatrician",
        experience: "12+ Years",
        rating: 4.9,
        reviews: 420,
        availability: "Available Today",
        price: "₹1,200",
        image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200",
        location: "Mumbai Healthcare",
        isVerified: true,
        tags: ["Neonatal Care", "Vaccination Expert"]
    },
    {
        id: "2",
        name: "Dr. Rajesh Khanna",
        specialty: "Pediatric Nutritionist",
        experience: "8 Years",
        rating: 4.8,
        reviews: 156,
        availability: "Tomorrow",
        price: "₹800",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200",
        location: "Metis Virtual Clinic",
        isVerified: true,
        tags: ["Growth Tracking", "Diet Planning"]
    },
    {
        id: "3",
        name: "Priya Iyer",
        specialty: "Lactation Consultant",
        experience: "15+ Years",
        rating: 5.0,
        reviews: 890,
        availability: "Available Today",
        price: "₹1,500",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200",
        location: "Home Visit / Virtual",
        isVerified: true,
        tags: ["Breastfeeding Support", "Postpartum Care"]
    },
    {
        id: "4",
        name: "Dr. Amit Varma",
        specialty: "Child Psychologist",
        experience: "10 Years",
        rating: 4.7,
        reviews: 210,
        availability: "Feb 12, Thu",
        price: "₹1,000",
        image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
        location: "Metis Virtual Clinic",
        isVerified: true,
        tags: ["Behavioral Therapy", "Parental Support"]
    }
];

export default function SpecialistsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    return (
        <div className="flex flex-col gap-8 pb-12">
            <DashboardHeader
                title="Specialists"
                subtitle="Expert guidance for Leo whenever you need it"
            />

            {/* Premium Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between z-20">
                <div className="relative w-full md:max-w-md lg:max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Search by name, specialty, or health concern..."
                        className="pl-12 h-12 bg-white/60 backdrop-blur-xl border-white/60 rounded-2xl shadow-sm focus:ring-primary/20 transition-all font-secondary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-white/60 bg-white/40 backdrop-blur-md font-bold text-xs uppercase tracking-widest text-slate-600 gap-2 flex-1 md:flex-none hover:bg-white/60 transition-colors">
                        <Filter size={16} /> Filter
                    </Button>
                    <Button className="h-12 px-8 rounded-2xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-200 gap-3 flex-1 md:flex-none hover:bg-slate-800 transition-all active:scale-95">
                        Book Emergency Call
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Categories Sidebar */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex flex-col gap-3 font-secondary">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-2 mb-2">Expert Categories</h3>
                        {specialistCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center justify-between p-5 rounded-[22px] transition-all cursor-pointer ${selectedCategory === cat.id
                                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-[1.03]"
                                    : "bg-white/40 hover:bg-white/60 text-slate-600 border border-white/40 shadow-sm"
                                    }`}
                            >
                                <span className={`font-bold text-sm tracking-tight ${selectedCategory === cat.id ? "text-white" : "text-slate-900"}`}>
                                    {cat.label}
                                </span>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-white/80 text-primary"
                                    }`}>
                                    {cat.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Promo Card */}
                    <Card className="glass border-none shadow-xl overflow-hidden group relative">
                        <div className="absolute -top-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                            <Stethoscope size={120} className="-rotate-12" />
                        </div>
                        <CardContent className="p-8 text-center space-y-6 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto group-hover:scale-110 transition-transform duration-500">
                                <Award size={28} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-normal text-slate-900 font-primary leading-tight">Metis Premium Consultations</h4>
                                <p className="text-slate-600 text-xs font-medium leading-relaxed font-secondary">
                                    Get unlimited 24/7 priority access to top pediatricians for just ₹999/month.
                                </p>
                            </div>
                            <Button className="w-full h-12 rounded-2xl bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-xl border-none transition-all active:scale-95">
                                Upgrade Now
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9 space-y-6 font-secondary">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-normal text-slate-900 font-primary italic">Featured Specialists</h2>
                        <span className="text-slate-400 text-xs font-medium tracking-tight">Showing {specialists.length} available experts</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {specialists.map((doc) => (
                            <motion.div
                                key={doc.id}
                                whileHover={{ y: -5 }}
                                className="glass bg-white/40 hover:bg-white/60 transition-all rounded-[32px] border-none shadow-md overflow-hidden flex flex-col group p-2"
                            >
                                <div className="p-6 space-y-6">
                                    <div className="flex items-start gap-5">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-[22px] overflow-hidden shadow-lg border-2 border-white ring-4 ring-primary/5">
                                                <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm">
                                                <ShieldCheck size={12} fill="currentColor" className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-slate-900 text-lg group-hover:text-primary transition-colors truncate">
                                                    {doc.name}
                                                </h4>
                                            </div>
                                            <p className="text-primary text-xs font-black uppercase tracking-widest leading-none mb-2">{doc.specialty}</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 text-amber-500">
                                                    <Star size={14} fill="currentColor" />
                                                    <span className="text-xs font-bold">{doc.rating}</span>
                                                </div>
                                                <span className="text-slate-400 text-xs font-medium">({doc.reviews} reviews)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {doc.tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="bg-white/50 text-slate-500 border-white/40 font-bold text-[9px] uppercase tracking-wider px-3 py-1 rounded-lg">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-white/40">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <Clock size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Experience</span>
                                                <span className="text-xs font-bold text-slate-700">{doc.experience}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <MapPin size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Location</span>
                                                <span className="text-xs font-bold text-slate-700 truncate">{doc.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/20 backdrop-blur-md rounded-[28px] flex items-center justify-between gap-4 mt-auto">
                                    <div className="pl-4">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Consultation</p>
                                        <p className="text-lg font-normal text-slate-900 font-primary leading-tight">
                                            {doc.price} <span className="text-[10px] font-medium text-slate-500 tracking-normal font-secondary italic">/ session</span>
                                        </p>
                                    </div>
                                    <Button className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 gap-2 cursor-pointer group/btn ml-auto">
                                        Book Now <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex justify-center pt-8">
                        <Button variant="ghost" className="text-slate-400 font-bold text-xs uppercase tracking-[0.25em] hover:text-primary transition-colors cursor-pointer gap-3">
                            View All {specialistCategories.find(c => c.id === selectedCategory)?.label || "Specialists"} <ArrowRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

