"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Orb } from "@/components/ui/orb";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Baby,
    Calendar as CalendarIcon,
    Weight,
    Ruler,
    Heart
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
    differenceInWeeks,
    differenceInMonths,
    differenceInYears,
    parseISO,
    addWeeks
} from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

const VACCINATION_SCHEDULE = [
    { id: 'birth', label: 'At Birth', minAgeWeeks: 0, vaccines: ['BCG', 'OPV-0', 'Hepatitis B birth dose'] },
    { id: '6weeks', label: '6 Weeks', minAgeWeeks: 6, vaccines: ['OPV-1', 'Pentavalent-1 (DPT+HepB+Hib)', 'RVV-1', 'fIPV-1', 'PCV-1*'] },
    { id: '10weeks', label: '10 Weeks', minAgeWeeks: 10, vaccines: ['OPV-2', 'Pentavalent-2', 'RVV-2'] },
    { id: '14weeks', label: '14 Weeks', minAgeWeeks: 14, vaccines: ['OPV-3', 'Pentavalent-3', 'fIPV-2', 'RVV-3', 'PCV-2*'] },
    { id: '9-12months', label: '9-12 Months', minAgeWeeks: 39, vaccines: ['MR-1 (Measles-Rubella)', 'JE-1*', 'PCV-Booster', 'Vitamin A (1st dose)'] },
    { id: '16-24 months', label: '16-24 Months', minAgeWeeks: 69, vaccines: ['MR-2', 'JE-2**', 'DPT Booster-1', 'OPV Booster', 'Vitamin A (2nd dose)'] },
    { id: '5-6years', label: '5-6 Years', minAgeWeeks: 260, vaccines: ['DPT Booster-2'] },
];

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
    const [step, setStep] = useState<Step>(1);
    const [formData, setFormData] = useState({
        babyName: "",
        gender: "",
        dob: "",
        weight: "",
        weightUnit: "kg",
        height: "",
        heightUnit: "cm",
        vaccinations: [] as string[],
        conditions: ""
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isOrbEnabled, setIsOrbEnabled] = useState(true);
    const supabase = createClient();

    // Load data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem("metis_onboarding_data");
        const savedStep = localStorage.getItem("metis_onboarding_step");

        if (savedData) {
            try {
                setFormData(JSON.parse(savedData));
            } catch (e) {
                console.error("Failed to parse saved onboarding data", e);
            }
        }

        if (savedStep) {
            const stepNum = parseInt(savedStep);
            if (stepNum >= 1 && stepNum <= 5) {
                setStep(stepNum as Step);
            }
        }
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("metis_onboarding_data", JSON.stringify(formData));
        localStorage.setItem("metis_onboarding_step", step.toString());
    }, [formData, step]);

    const nextStep = () => {
        if (isStepValid()) {
            setStep((prev) => (prev < 5 ? (prev + 1) as Step : prev));
        } else {
            toast.error("Please fill in all fields to continue");
        }
    };
    const prevStep = () => setStep((prev) => (prev > 1 ? (prev - 1) as Step : prev));

    const isStepValid = () => {
        switch (step) {
            case 1:
                return formData.babyName.trim() !== "" && formData.gender !== "";
            case 2:
                return formData.dob !== "";
            case 3:
                return formData.weight !== "" && formData.height !== "";
            case 4:
                return true; // Vaccinations are optional to check
            case 5:
                return true; // Optional field
            default:
                return false;
        }
    };

    const getBabyAgeInWeeks = () => {
        if (!formData.dob) return 0;
        return differenceInWeeks(new Date(), parseISO(formData.dob));
    };

    const getAvailableVaccines = () => {
        const ageInWeeks = getBabyAgeInWeeks();
        return VACCINATION_SCHEDULE.filter(period => ageInWeeks >= period.minAgeWeeks);
    };

    const handleComplete = async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("No user found");

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    baby_name: formData.babyName,
                    gender: formData.gender,
                    dob: formData.dob,
                    initial_weight: formData.weight ? parseFloat(formData.weight) : null,
                    weight_unit: formData.weightUnit,
                    initial_height: formData.height ? parseFloat(formData.height) : null,
                    height_unit: formData.heightUnit,
                    completed_vaccinations: formData.vaccinations,
                    medical_conditions: formData.conditions,
                    onboarding_completed: true
                });

            if (error) throw error;

            // 2. Prepare all vaccinations for the activity_log
            const dob = parseISO(formData.dob);
            const allActivityLogs: any[] = [];

            VACCINATION_SCHEDULE.forEach(period => {
                const scheduledDate = addWeeks(dob, period.minAgeWeeks);

                period.vaccines.forEach(v => {
                    const isCompleted = formData.vaccinations.includes(v);
                    allActivityLogs.push({
                        profile_id: user.id,
                        activity_name: v,
                        category: 'vaccination',
                        status: isCompleted ? 'completed' : 'pending',
                        scheduled_date: scheduledDate.toISOString().split('T')[0],
                        completed_date: isCompleted ? new Date().toISOString().split('T')[0] : null,
                        notes: isCompleted ? 'Marked as completed during onboarding' : 'Scheduled based on birth date'
                    });
                });
            });

            // 3. Batch insert into activity_log
            const { error: logError } = await supabase
                .from('activity_log')
                .insert(allActivityLogs);

            if (logError) {
                console.error("Failed to seed activity log:", logError);
                // We don't throw here to avoid blocking completion, but we log it
            }

            // Clear localStorage on success
            localStorage.removeItem("metis_onboarding_data");
            localStorage.removeItem("metis_onboarding_step");

            toast.success("Welcome to Metis! Profile created.");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to save profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getAgentMessage = () => {
        switch (step) {
            case 1: return "Hello! I'm Hestia, your AI companion. Let's start by getting to know your little one. What's their name?";
            case 2: return `A beautiful name! And when did ${formData.babyName || 'the little one'} join the family?`;
            case 3: return "Great. Now, let's record some initial measurements for tracking growth trends.";
            case 4: return "Health preservation is key. Which of these standard vaccinations has your baby already received?";
            case 5: return "Almost there! Is there anything specific like allergies or conditions I should keep an eye on?";
            default: return "";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            // Prevent closing if it's open and we haven't finished
            if (!open) return;
            onClose();
        }}>
            <DialogContent
                showCloseButton={false}
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="max-w-full md:max-w-[1000px] w-[calc(100%-2rem)] p-0 overflow-hidden border-none bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] rounded-[32px] font-secondary"
            >
                <div className="flex flex-col md:flex-row min-h-[500px] md:h-[650px] relative">

                    {/* Left Section: AI Agent Interaction */}
                    <div className="w-full md:w-[38%] relative flex flex-col items-center justify-between p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/40 transition-all duration-500 overflow-hidden">
                        <div className="space-y-4 text-center w-full relative z-10">
                            <VisuallyHidden>
                                <DialogTitle>Onboarding with Hestia</DialogTitle>
                            </VisuallyHidden>
                            <h3 className="text-3xl font-normal text-slate-900 tracking-tight leading-tight font-primary flex items-center justify-center gap-3">
                                <img src="/logo.svg" alt="Metis" className="w-8 h-8" /> Meet Hestia
                            </h3>
                            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <p className="text-slate-600 text-[13px] leading-relaxed font-medium">
                                    {getAgentMessage()}
                                </p>
                            </div>
                        </div>

                        {/* Animated Orb Component */}
                        <div className="flex-1 flex items-center justify-center w-full my-6 md:my-0">
                            <div className="relative group">
                                <div
                                    onClick={() => setIsOrbEnabled(!isOrbEnabled)}
                                    className="aspect-square w-[180px] lg:w-[220px] relative transition-transform duration-700 hover:scale-105 cursor-pointer"
                                >
                                    <Orb
                                        agentState="thinking"
                                        colors={["#1e40af", "#60a5fa"]}
                                        className="w-full h-full"
                                        disabled={!isOrbEnabled}
                                    />
                                </div>

                                {/* Custom Floating Hover Label */}
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
                                    <div className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border border-white/10">
                                        Tap to {isOrbEnabled ? "disable" : "enable"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full flex flex-col items-center gap-4">
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-slate-900' : 'w-2 bg-slate-200'}`}
                                    />
                                ))}
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Step {step} of 5</p>
                        </div>
                    </div>

                    {/* Right Section: Multi-step Form */}
                    <div className="flex-1 bg-white p-8 md:p-14 relative flex flex-col justify-center overflow-y-auto no-scrollbar">
                        <div className="max-w-[440px] mx-auto w-full py-6">

                            {/* Step 1: Baby Name & Gender */}
                            {step === 1 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h2 className="text-4xl font-normal text-slate-900 tracking-tight leading-tight font-primary">Basics</h2>
                                        <p className="text-slate-400 text-sm font-medium">Let's start with the very basics.</p>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Baby's Full Name</Label>
                                            <div className="relative group">
                                                <Baby className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                                <Input
                                                    placeholder="e.g. Leo Alexander"
                                                    value={formData.babyName}
                                                    onChange={(e) => handleInputChange("babyName", e.target.value)}
                                                    className="h-14 bg-slate-50 border-slate-100 rounded-xl pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white transition-all shadow-none border-2 focus:border-primary/20"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Gender</Label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['Boy', 'Girl', 'Other'].map((g) => (
                                                    <button
                                                        key={g}
                                                        type="button"
                                                        onClick={() => handleInputChange("gender", g)}
                                                        className={`h-12 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border-2 ${formData.gender === g ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-50 hover:border-slate-200'}`}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Date of Birth */}
                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h2 className="text-4xl font-normal text-slate-900 tracking-tight leading-tight font-primary">Important Date</h2>
                                        <p className="text-slate-400 text-sm font-medium">We'll use this for developmental milestones.</p>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Date of Birth</Label>
                                        <div className="relative group">
                                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" size={18} />
                                            <Input
                                                type="date"
                                                value={formData.dob}
                                                onChange={(e) => handleInputChange("dob", e.target.value)}
                                                className="h-14 bg-slate-50 border-slate-100 rounded-xl pl-12 pr-4 text-sm text-slate-900 [color-scheme:light] transition-all shadow-none border-2 focus:border-primary/20"
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-400 px-1 italic">Note: This helps Hestia provide age-appropriate advice.</p>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Weight & Height */}
                            {step === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h2 className="text-4xl font-normal text-slate-900 tracking-tight leading-tight font-primary">Measurements</h2>
                                        <p className="text-slate-400 text-sm font-medium">Current weight and height at time of setup.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Weight ({formData.weightUnit})</Label>
                                            <div className="relative group">
                                                <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                                <Input
                                                    type="number"
                                                    placeholder="0.0"
                                                    value={formData.weight}
                                                    onChange={(e) => handleInputChange("weight", e.target.value)}
                                                    className="h-14 bg-slate-50 border-slate-100 rounded-xl pl-12 pr-4 text-sm text-slate-900 transition-all shadow-none border-2 focus:border-primary/20"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Height ({formData.heightUnit})</Label>
                                            <div className="relative group">
                                                <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={formData.height}
                                                    onChange={(e) => handleInputChange("height", e.target.value)}
                                                    className="h-14 bg-slate-50 border-slate-100 rounded-xl pl-12 pr-4 text-sm text-slate-900 transition-all shadow-none border-2 focus:border-primary/20"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Vaccinations */}
                            {step === 4 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full max-h-[480px]">
                                    <div className="space-y-2 shrink-0">
                                        <h2 className="text-4xl font-normal text-slate-900 tracking-tight leading-tight font-primary">Vaccinations</h2>
                                        <p className="text-slate-400 text-sm font-medium">Select the doses already administered.</p>
                                    </div>
                                    <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                        {getAvailableVaccines().length > 0 ? (
                                            getAvailableVaccines().map((period) => (
                                                <div key={period.id} className="space-y-3 pt-2 first:pt-0">
                                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{period.label}</h4>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {period.vaccines.map((v) => (
                                                            <div
                                                                key={v}
                                                                onClick={() => {
                                                                    const current = [...formData.vaccinations];
                                                                    if (current.includes(v)) {
                                                                        handleInputChange("vaccinations", current.filter(item => item !== v) as any);
                                                                    } else {
                                                                        handleInputChange("vaccinations", [...current, v] as any);
                                                                    }
                                                                }}
                                                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.vaccinations.includes(v) ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-50 hover:border-slate-100'}`}
                                                            >
                                                                <Checkbox
                                                                    checked={formData.vaccinations.includes(v)}
                                                                    className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                />
                                                                <span className={`text-sm font-medium ${formData.vaccinations.includes(v) ? 'text-primary' : 'text-slate-600'}`}>{v}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-slate-400 text-sm">No vaccinations scheduled yet for this age.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Final Questions */}
                            {step === 5 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h2 className="text-4xl font-normal text-slate-900 tracking-tight leading-tight font-primary">Final Details</h2>
                                        <p className="text-slate-400 text-sm font-medium">Anything else worth mentioning?</p>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Allergies or Conditions</Label>
                                        <textarea
                                            placeholder="e.g. Milk allergy, G6PD deficiency..."
                                            value={formData.conditions}
                                            onChange={(e) => handleInputChange("conditions", e.target.value)}
                                            className="w-full min-h-[140px] bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white transition-all shadow-none focus:border-primary/20 outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex items-center gap-4 mt-12 pt-6 border-t border-slate-100">
                                {step > 1 && (
                                    <Button
                                        variant="outline"
                                        onClick={prevStep}
                                        className="h-14 flex-1 rounded-2xl border-2 border-slate-100 text-slate-600 font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all gap-2"
                                    >
                                        <ArrowLeft size={16} /> Back
                                    </Button>
                                )}
                                <Button
                                    disabled={isLoading || !isStepValid()}
                                    onClick={step === 5 ? handleComplete : nextStep}
                                    className="h-14 flex-[2] rounded-2xl bg-slate-950 text-white hover:bg-slate-800 font-bold text-xs uppercase tracking-[0.3em] shadow-xl hover:translate-y-[-2px] transition-all gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        "Saving..."
                                    ) : step === 5 ? (
                                        <>Complete Setup <Check size={16} /></>
                                    ) : (
                                        <>Next Step <ArrowRight size={16} /></>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
