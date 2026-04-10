"use client";

import React, { useState, useEffect } from "react";
import {
    Utensils,
    ChevronRight,
    Apple,
    Droplets,
    AlertTriangle,
    MapPin,
    Camera,
    Info,
    CheckCircle2,
    RefreshCcw,
    ChefHat,
    Scale,
    Loader2,
    Shield,
    Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { differenceInMonths, parseISO } from "date-fns";

// Mock Data for Nutrition Plans
const dietPlans = {
    "0-6m": {
        title: "Liquid Gold Phase",
        guidance: "Exclusive breastfeeding or formula only. No water or solids needed yet.",
        meals: [
            { time: "On Demand", meal: "Breast Milk / Formula", icon: <Droplets size={18} className="text-blue-500" /> },
        ],
        alerts: ["Avoid all solids and honey.", "Monitor nursing patterns."]
    },
    "6-8m": {
        title: "Introduction to Solids",
        guidance: "Focus on single-ingredient purees. Continue 4-5 breast/formula feeds daily.",
        meals: [
            { time: "08:00 AM", meal: "Breast Milk / Formula", icon: <Droplets size={18} className="text-blue-500" /> },
            { time: "11:00 AM", meal: "Mashed Papaya / Banana", icon: <Apple size={18} className="text-orange-500" /> },
            { time: "02:00 PM", meal: "Rice Porridge (Kanji)", icon: <Utensils size={18} className="text-yellow-600" /> },
        ],
        alerts: ["No honey or salt before 12 months.", "Monitor for skin rashes."]
    },
    "9-12m": {
        title: "Transition to Table Foods",
        guidance: "Chopped soft foods. Baby can join family meals (low spice).",
        meals: [
            { time: "08:30 AM", meal: "Oats with Steamed Apple", icon: <Apple size={18} className="text-red-500" /> },
            { time: "12:30 PM", meal: "Khichdi with Minced Spinach", icon: <Utensils size={18} className="text-green-600" /> },
            { time: "04:30 PM", meal: "Dahi (Yogurt) with Berries", icon: <Droplets size={18} className="text-indigo-500" /> },
        ],
        alerts: ["Encourage self-feeding.", "Introduce varied textures."]
    },
    "1y+": {
        title: "Family Pot Phase",
        guidance: "Balanced meals including all food groups. Limit added sugar.",
        meals: [
            { time: "Breakfast", meal: "Idli / Poha with Veggies", icon: <Utensils size={18} className="text-emerald-500" /> },
            { time: "Lunch", meal: "Roti, Dal & Seasonal Sabzi", icon: <Utensils size={18} className="text-orange-600" /> },
            { time: "Dinner", meal: "Vegetable Pulao", icon: <Utensils size={18} className="text-yellow-600" /> },
        ],
        alerts: ["Toddler sized portions.", "Consistent meal timings."]
    }
};

export default function NutritionPage() {
    const [step, setStep] = useState(1);
    const [feedingType, setFeedingType] = useState("");
    const [dietaryPreference, setDietaryPreference] = useState("Vegetarian");
    const [focusArea, setFocusArea] = useState("Balanced Growth");
    const [ageGroup, setAgeGroup] = useState("");
    const [babyName, setBabyName] = useState("");
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchBabyData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('dob, baby_name')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setBabyName(profile.baby_name);
                    const months = differenceInMonths(new Date(), parseISO(profile.dob));
                    if (months < 6) setAgeGroup("0-6m");
                    else if (months < 9) setAgeGroup("6-8m");
                    else if (months < 13) setAgeGroup("9-12m");
                    else setAgeGroup("1y+");
                }
            }
            setLoading(false);
        };

        fetchBabyData();
    }, []);

    const handleGenerate = () => {
        setStep(2);
        setTimeout(() => {
            const basePlan = dietPlans[ageGroup as keyof typeof dietPlans] || dietPlans["6-8m"];
            // Add custom flags based on inputs (Only for 6m+)
            if (ageGroup !== "0-6m") {
                setPlan({
                    ...basePlan,
                    customNotes: `Precision sync active for ${dietaryPreference} diet with a focus on ${focusArea}.`,
                    focusIcon: focusArea === "Weight Gain" ? <Scale size={20} /> : focusArea === "Immunity" ? <Shield size={20} /> : <Activity size={20} />
                });
            } else {
                setPlan({
                    ...basePlan,
                    customNotes: "Liquid nutrition synchronization active.",
                    focusIcon: <Droplets size={20} />
                });
            }
            setStep(3);
        }, 1500);
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Background Aesthetic Elements */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[100px]" />
            </div>

            <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-20 px-4 relative z-0">
                {/* Header */}
                <header className="flex flex-col gap-2">
                    <h1 className="text-5xl font-normal text-slate-900 font-primary italic border-b border-slate-200 pb-4">
                        Nutrition <span className="opacity-40">Planner</span>
                    </h1>
                    <p className="text-slate-500 font-medium font-secondary uppercase text-[10px] tracking-[0.2em]">Pediatric Precision Engine • {babyName || "Metis Baby"}</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Main Workflow Column */}
                    <div className="lg:col-span-8 space-y-6">
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <Card className="glass border-none shadow-2xl overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-primary/10" />
                                    <CardHeader className="p-8 bg-white/40">
                                        <div className="flex justify-between items-center relative">
                                            <div>
                                                <CardTitle className="text-3xl font-normal text-slate-800 font-primary">Plan Configuration</CardTitle>
                                                <CardDescription className="text-slate-500 font-medium font-secondary flex items-center gap-2 mt-1">
                                                    Current age: <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{ageGroup === "0-6m" ? "Neonatal (0-6m)" : ageGroup}</Badge>
                                                </CardDescription>
                                            </div>
                                            <Badge className="bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Step 1/1</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-10">
                                        {/* Feeding Type */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 ml-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">1. Selection of Feeding Modal</label>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {["Exclusive Breastfeeding", "Formula Only", "Mixed Feeding"].map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setFeedingType(type)}
                                                        className={`p-6 rounded-[28px] border-2 transition-all text-center flex flex-col items-center justify-center gap-2 ${feedingType === type ? 'border-primary bg-primary/5 text-primary shadow-xl shadow-primary/5 scale-[1.02]' : 'border-white bg-white/40 text-slate-400 hover:border-primary/20 hover:bg-white'}`}
                                                    >
                                                        <Droplets size={24} className={feedingType === type ? "text-primary" : "text-slate-300"} />
                                                        <span className="text-[10px] font-black uppercase tracking-tight">{type}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {ageGroup !== "0-6m" ? (
                                            <>
                                                {/* Dietary Preference */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 ml-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">2. Dietary Preference Framework</label>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {["Vegetarian", "Eggitarian", "Non-Veg"].map((type) => (
                                                            <button
                                                                key={type}
                                                                onClick={() => setDietaryPreference(type)}
                                                                className={`p-5 rounded-[24px] border-2 transition-all font-black text-[11px] uppercase tracking-widest ${dietaryPreference === type ? 'border-slate-900 bg-slate-900 text-white shadow-xl' : 'border-slate-50 bg-white/50 text-slate-500 hover:bg-white hover:border-slate-200'}`}
                                                            >
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Focus Area */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 ml-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">3. Clinical Focus Area</label>
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                        {["Balanced Growth", "Weight Gain", "Immunity", "Brain Dev"].map((goal) => (
                                                            <button
                                                                key={goal}
                                                                onClick={() => setFocusArea(goal)}
                                                                className={`p-4 rounded-[22px] border-2 transition-all font-black text-[9px] uppercase tracking-widest ${focusArea === goal ? 'border-primary bg-primary/10 text-primary shadow-lg' : 'border-slate-50 bg-white/40 text-slate-500 hover:bg-white hover:border-slate-200'}`}
                                                            >
                                                                {goal}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10 flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                                                    <Shield size={24} className="text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-1">Newborn Safety Protocol</p>
                                                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                                                        Clinical restrictions are active for ages under 6 months. Dietary customizations will unlock during the transition to solids.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            onClick={handleGenerate}
                                            disabled={!feedingType}
                                            className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-[28px] text-lg font-black uppercase tracking-tighter flex items-center justify-center gap-3 shadow-xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-30 mt-4 group"
                                        >
                                            Generate Precision Plan <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Intelligence Grid to fill space */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="glass p-8 rounded-[40px] border-none shadow-sm flex flex-col justify-between min-h-[180px] bg-white/20">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                                <Info size={20} />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Clinical Fact</p>
                                        </div>
                                        <p className="text-[14px] text-slate-600 font-bold italic leading-relaxed">
                                            "A baby's stomach at birth is only the size of a cherry. Precision timing is more critical than volume."
                                        </p>
                                    </div>
                                    <div className="glass p-8 rounded-[40px] border-none shadow-sm flex flex-col justify-between min-h-[180px] bg-white/20">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                                <Activity size={20} />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Engine Tip</p>
                                        </div>
                                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                                            Selecting your primary health goal allows Metis to prioritize specific micronutrients in your daily meal recommendations.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="h-[400px] glass flex flex-col items-center justify-center text-center p-12 animate-in fade-in zoom-in duration-500 rounded-[40px]">
                                <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-8" />
                                <h2 className="text-3xl font-normal text-slate-800 font-primary italic">Assembling Clinical Grid...</h2>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Personalizing for {ageGroup} age group</p>
                            </div>
                        )}

                        {step === 3 && plan && (
                            <Card className="glass border-none shadow-2xl overflow-hidden rounded-[40px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                <CardHeader className="p-8 bg-primary/5 border-b border-white/60">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Badge className="bg-primary text-white border-none font-black text-[9px] uppercase tracking-widest px-4 py-1 mb-2">Primary Guidance</Badge>
                                            <CardTitle className="text-5xl font-normal text-slate-800 font-primary italic leading-tight">{plan.title}</CardTitle>
                                        </div>
                                        <div className="text-right bg-white/40 px-5 py-3 rounded-2xl border border-white shadow-sm">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Age Range</p>
                                            <p className="text-2xl font-black text-slate-900 leading-none">{ageGroup}</p>
                                        </div>
                                    </div>
                                    <div className="mt-8 flex flex-col gap-4">
                                        <div className="bg-white/60 p-6 rounded-[28px] border border-white shadow-sm flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                                                <Info size={20} />
                                            </div>
                                            <p className="text-slate-600 font-bold text-base leading-relaxed italic">
                                                "{plan.guidance}"
                                            </p>
                                        </div>

                                        {ageGroup !== "0-6m" && (
                                            <div className="flex items-center gap-4 bg-slate-900 p-5 rounded-[28px] shadow-lg shadow-slate-900/20">
                                                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0">
                                                    {plan.focusIcon}
                                                </div>
                                                <p className="text-[12px] font-bold uppercase text-white tracking-wide">
                                                    {plan.customNotes}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mt-8">
                                        {[
                                            { icon: <ChefHat className="text-blue-500" />, title: "Regional", sub: "Indian Base" },
                                            { icon: <Scale className="text-green-500" />, title: "Balanced", sub: "Macro-sync" },
                                            { icon: <AlertTriangle className="text-orange-500" />, title: "Safety", sub: "Allergy Layer" }
                                        ].map((item, i) => (
                                            <div key={item.title} className="p-4 rounded-[28px] bg-white/40 border border-white text-center hover:bg-white/60 transition-colors">
                                                <div className="mb-2 flex justify-center">{item.icon}</div>
                                                <p className="text-xs font-black text-slate-800">{item.title}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">{item.sub}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardHeader>

                                <CardContent className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between px-2">
                                                <h3 className="text-2xl font-normal text-slate-800 font-primary italic">Structured Day Plan</h3>
                                                <Badge variant="outline" className="border-slate-200 text-slate-400 font-black text-[9px] uppercase tracking-widest px-3">24h Schedule</Badge>
                                            </div>

                                            <div className="grid gap-3">
                                                {plan.meals.map((meal: any, idx: number) => (
                                                    <div key={idx} className="glass p-5 rounded-[32px] border-none shadow-sm flex items-center justify-between group bg-white/40 hover:bg-white transition-all cursor-default w-full">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                                {meal.icon}
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.15em] mb-1">{meal.time}</p>
                                                                <p className="text-xl font-bold text-slate-800 leading-tight tracking-tight">{meal.meal}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between px-2">
                                                <h3 className="text-2xl font-normal text-slate-800 font-primary italic">Clinical Insights</h3>
                                                <Badge variant="outline" className="border-emerald-100 text-emerald-600 font-black text-[9px] uppercase tracking-widest px-3">Growth Layer</Badge>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="p-6 rounded-[32px] bg-white/50 border border-white space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                                            <Shield size={16} />
                                                        </div>
                                                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Gut Microbiome Sync</p>
                                                    </div>
                                                    <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                                                        Current focus is on establishing stable gut flora through liquid nutrition. No supplementary probiotics needed at this stage.
                                                    </p>
                                                </div>

                                                <div className="p-6 rounded-[32px] bg-white/50 border border-white space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                                            <Activity size={16} />
                                                        </div>
                                                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Hydration Control</p>
                                                    </div>
                                                    <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                                                        Daily water requirement fulfilled via breastmilk/formula. Zero supplementary water intake is recommended to maintain renal balance.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {ageGroup === "0-6m" && (
                                        <div className="p-8 rounded-[32px] border-2 border-dashed border-slate-100 bg-slate-50/30 flex flex-col items-center justify-center text-center gap-2">
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest italic opacity-40">Phase 0: Metabolic Priming</p>
                                            <p className="text-[12px] text-slate-400 font-medium max-w-[400px] leading-relaxed">
                                                Solids intake is clinically locked until the 6-month milestone.
                                                We are currently monitoring growth velocity and feeding frequency.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Main Shared Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Live System Sync */}
                        <div className="px-6 py-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-lg shadow-slate-900/10">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-widest">System Live</p>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Sync: Active</p>
                        </div>

                        {/* Meal Scanner Card */}
                        <Card className="glass border-none shadow-xl rounded-[32px] overflow-hidden group">
                            <CardHeader className="p-6 bg-white/40 pb-4">
                                <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase tracking-widest px-3 w-fit mb-3">AI Engine Beta</Badge>
                                <CardTitle className="text-2xl font-normal font-primary italic">Meal <span className="text-primary font-bold">Scanner</span></CardTitle>
                                <p className="text-[11px] text-slate-500 font-medium">Auto-calculate nutrition from photos</p>
                            </CardHeader>
                            <CardContent className="p-6 pt-0">
                                <div className="w-full aspect-video rounded-[24px] border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-2 bg-primary/5 group-hover:bg-primary/10 transition-all cursor-pointer">
                                    <Camera size={32} className="text-primary/40 group-hover:scale-110 transition-all" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Upload Meal Image</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Regional Mapping */}
                        <Card className="glass border-none shadow-xl rounded-[32px] overflow-hidden">
                            <CardHeader className="p-5 bg-white/60 border-b border-white">
                                <CardTitle className="text-lg font-normal font-primary italic flex items-center gap-2">
                                    <MapPin size={18} className="text-primary" />
                                    Regional Mapping
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                                    <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                                        Plan mapped to <span className="text-primary font-bold">Maharashtra, IN</span>.
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-tighter">
                                        <CheckCircle2 size={14} /> 12 Local Foods Sync
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Allergy Radar */}
                        <Card className="glass border-none shadow-xl rounded-[32px] overflow-hidden">
                            <CardHeader className="p-5 bg-red-50/50 border-b border-red-100">
                                <CardTitle className="text-lg font-normal font-primary italic flex items-center gap-2 text-red-600">
                                    <AlertTriangle size={18} />
                                    Allergy Radar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-3">
                                <div className="space-y-2">
                                    {plan?.alerts?.map((alert: string, i: number) => (
                                        <div key={i} className="flex gap-2 items-start text-[11px] font-bold text-slate-600 bg-white/40 p-3 rounded-2xl border border-white">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 shrink-0" />
                                            {alert}
                                        </div>
                                    )) || (
                                            <p className="text-[11px] font-bold text-slate-400 uppercase italic px-2">Awaiting selection...</p>
                                        )}
                                </div>
                                <Button className="w-full h-9 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest mt-2 hover:bg-slate-800 transition-colors">
                                    Global Registry
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Bottom Decorative Element */}
                        <div className="p-8 rounded-[40px] border-2 border-dashed border-slate-200/50 flex flex-col items-center justify-center text-center gap-3 opacity-40 hover:opacity-100 transition-opacity group cursor-default">
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Bio-Metrics</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
