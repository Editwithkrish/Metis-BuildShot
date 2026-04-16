"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, ArrowRight, CheckCircle2, Globe, Heart, Shield, User, Users, Microscope, Baby, HeartPulse } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Identity", description: "Tell us who you are" },
  { id: 2, title: "Region", description: "Set your location" },
  { id: 3, title: "Health Details", description: "Basic health information" },
  { id: 4, title: "Preferences", description: "How we'll stay in touch" },
  { id: 5, title: "Goals", description: "What are your health priorities?" },
  { id: 6, title: "Complete", description: "Finalizing your profile" },
];



export default function OnBoardingPage() {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    detail: "",
    language: "English",
    alertType: "SMS",
    dataSource: "Manual",
    weight: "",
    height: "",
    age: "",
    feedingStatus: "Exclusive",
    clinicalLoad: "Standard",
    isPregnant: false,
    gender: "",
  });
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeOnboarding = async () => {
    setIsSubmitting(true);
    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.name,
          role: selectedRole,
          detail: formData.detail,
          language: formData.language,
          alert_type: formData.alertType,
          data_source: formData.dataSource,
          weight: formData.weight,
          height: formData.height,
          age: formData.age,
          feeding_status: formData.feedingStatus,
          clinical_load: formData.clinicalLoad,
          goal: selectedGoal,
          is_pregnant: formData.isPregnant,
          gender: formData.gender,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success("Profile completed!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Onboarding saving error:", error.message);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("metis_onboarding_data", JSON.stringify({
        ...formData,
        role: selectedRole,
        goal: selectedGoal
      }));
    }
  }, [formData, selectedRole, selectedGoal]);

  const progress = (currentStep / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length) {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsVisible(true);
      }, 300);
    }
  };

  return (
    <main className="min-h-screen bg-background noise-overlay flex flex-col items-center justify-center p-4 lg:p-12 overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#86efac]/20 to-transparent" />
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#86efac]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#86efac]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="mb-6 lg:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3 lg:mb-4">
              <span className="w-8 h-px bg-[#86efac]/30" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Getting Started</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-display text-white flex items-center gap-2 lg:gap-3">
              {t.onboarding.welcome} <img src="/logo.png" alt="METIS Logo" className="h-8 lg:h-12" />
            </h1>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Setup Progress</span>
            <Progress value={progress} className="w-full md:w-48 h-1 bg-foreground/10" />
          </div>
        </div>

        {/* Dynamic Card Container */}
        <div 
          className={`transition-all duration-500 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Card className="bg-card border-foreground/10 overflow-hidden relative group backdrop-blur-sm">
            <div className="grid lg:grid-cols-12">
              {/* Left Side: Step Indicator */}
              <div className="lg:col-span-3 bg-foreground/[0.02] border-b lg:border-b-0 lg:border-r border-foreground/10 p-4 lg:p-10">
                <div className="flex lg:flex-col gap-3 lg:gap-6 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0">
                  {steps.map((step) => (
                    <div 
                      key={step.id} 
                      className={`flex gap-4 transition-all duration-300 ${
                        currentStep >= step.id ? "opacity-100" : "opacity-30"
                      }`}
                    >
                        <div className={`w-6 h-6 lg:w-7 lg:h-7 rounded-full border flex items-center justify-center font-mono text-[9px] lg:text-[10px] shrink-0 ${
                          currentStep === step.id ? "border-[#86efac] text-[#86efac] bg-[#86efac]/10" : 
                          currentStep > step.id ? "border-[#86efac] bg-[#86efac] text-black" : "border-foreground/20 text-muted-foreground"
                        }`}>
                          {currentStep > step.id ? <CheckCircle2 className="w-3 h-3" /> : step.id}
                        </div>
                        <div className="hidden lg:block min-w-0">
                          <p className="text-xs font-medium text-white truncate">{step.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{step.description}</p>
                        </div>
                      </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Content */}
              <div className="lg:col-span-9 p-5 lg:p-12 min-h-[400px] flex flex-col">
                {currentStep === 1 && (
                  <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="text-2xl font-display text-white mb-8">Who are you representing?</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { id: 'mother', label: 'Mother', sub: 'Maternal health tracking', icon: Baby },
                        { id: 'ind', label: 'Individual', sub: 'Monitoring self or family', icon: User },
                        { id: 'caregiver', label: 'Caregiver', sub: 'Assisting family health', icon: HeartPulse },
                        { id: 'doc', label: 'Medical Doctor', sub: 'Clinical patient tracking', icon: Activity },
                        { id: 'hworker', label: 'Health Worker', sub: 'Regional fieldwork', icon: Users },
                        { id: 'res', label: 'Researcher', sub: 'Clinical data analysis', icon: Microscope },
                      ].map((role) => (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRole(role.id)}
                          className={`p-4 lg:p-5 border text-left transition-all group ${
                            selectedRole === role.id 
                              ? "border-[#86efac] bg-[#86efac]/5" 
                              : "border-foreground/10 hover:border-[#86efac]/30 hover:bg-foreground/[0.02]"
                          }`}
                        >
                          <role.icon className={`w-4 h-4 lg:w-5 lg:h-5 mb-2 lg:mb-3 transition-colors ${selectedRole === role.id ? "text-[#86efac]" : "text-muted-foreground"}`} />
                          <p className="font-medium text-white text-[13px] lg:text-sm">{role.label}</p>
                          <p className="text-[9px] lg:text-[10px] text-muted-foreground mt-0.5">{role.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="text-2xl font-display text-white mb-8">Your Region</h2>
                    <p className="text-muted-foreground mb-8 text-sm">Select your primary geographical region to load relevant nutritional metadata and government scheme datasets.</p>
                    <div className="space-y-4">
                      <div className="p-6 border border-[#86efac] bg-[#86efac]/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Globe className="text-[#86efac] w-5 h-5" />
                          <div>
                            <p className="text-white font-medium">South Asia (India/Maharashtra)</p>
                            <p className="text-xs text-[#86efac]/70">Datasets: NFHS-5, POSHAN Abhiyaan</p>
                          </div>
                        </div>
                        <CheckCircle2 className="text-[#86efac] w-5 h-5" />
                      </div>
                      <p className="text-xs text-muted-foreground italic font-mono uppercase tracking-tight text-center mt-4 opacity-50">More regions being synchronized currently...</p>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="text-2xl font-display text-white mb-8">Health Details</h2>
                    
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="Enter your name..."
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-foreground/[0.03] border border-foreground/10 px-4 py-3 text-white focus:border-[#86efac]/50 focus:outline-none transition-colors font-mono text-xs"
                        />
                      </div>

                      {(selectedRole === 'mother' || selectedRole === 'ind' || selectedRole === 'caregiver') ? (
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Age {selectedRole === 'mother' ? '(Baby)' : ''}</label>
                            <input 
                              type="text" 
                              placeholder="e.g. 6m / 28y"
                              value={formData.age}
                              onChange={(e) => setFormData({...formData, age: e.target.value})}
                              className="w-full bg-foreground/[0.03] border border-foreground/10 px-4 py-3 text-white focus:border-[#86efac]/50 focus:outline-none transition-colors font-mono text-xs"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Weight (kg)</label>
                            <input 
                              type="text" 
                              placeholder="7.5"
                              value={formData.weight}
                              onChange={(e) => setFormData({...formData, weight: e.target.value})}
                              className="w-full bg-foreground/[0.03] border border-foreground/10 px-4 py-3 text-white focus:border-[#86efac]/50 focus:outline-none transition-colors font-mono text-xs"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Height (cm)</label>
                            <input 
                              type="text" 
                              placeholder="65"
                              value={formData.height}
                              onChange={(e) => setFormData({...formData, height: e.target.value})}
                              className="w-full bg-foreground/[0.03] border border-foreground/10 px-4 py-3 text-white focus:border-[#86efac]/50 focus:outline-none transition-colors font-mono text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Facility / Organization</label>
                          <input 
                            type="text" 
                            placeholder="Enter clinic name..."
                            value={formData.detail}
                            onChange={(e) => setFormData({...formData, detail: e.target.value})}
                            className="w-full bg-foreground/[0.03] border border-foreground/10 px-4 py-3 text-white focus:border-[#86efac]/50 focus:outline-none transition-colors font-mono text-xs"
                          />
                        </div>
                      )}
                      
                      {selectedRole === 'mother' && (
                        <div className="space-y-3">
                          <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Current Status</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: true, label: 'Pregnant' },
                              { id: false, label: 'Post-natal / Baby' }
                            ].map(status => (
                              <button
                                key={status.label}
                                onClick={() => setFormData({...formData, isPregnant: status.id})}
                                className={`py-2 text-[10px] border font-mono transition-all ${
                                  formData.isPregnant === status.id 
                                    ? "border-[#86efac] text-[#86efac] bg-[#86efac]/5" 
                                    : "border-foreground/10 text-muted-foreground hover:border-foreground/30"
                                }`}
                              >
                                {status.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {((selectedRole === 'mother' && !formData.isPregnant) || selectedRole === 'ind') && (
                        <div className="space-y-3">
                          <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                            {selectedRole === 'mother' ? "Baby's Gender" : "Gender"}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {['Male', 'Female'].map(g => (
                              <button
                                key={g}
                                onClick={() => setFormData({...formData, gender: g})}
                                className={`py-2 text-[10px] border font-mono transition-all ${
                                  formData.gender === g 
                                    ? "border-[#86efac] text-[#86efac] bg-[#86efac]/5" 
                                    : "border-foreground/10 text-muted-foreground hover:border-foreground/30"
                                }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedRole === 'mother' && !formData.isPregnant && (
                        <div className="space-y-3">
                          <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Breastfeeding Status</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['Exclusive', 'Partial', 'Formula'].map(status => (
                              <button
                                key={status}
                                onClick={() => setFormData({...formData, feedingStatus: status})}
                                className={`py-2 text-[10px] border font-mono transition-all ${
                                  formData.feedingStatus === status 
                                    ? "border-[#86efac] text-[#86efac] bg-[#86efac]/5" 
                                    : "border-foreground/10 text-muted-foreground hover:border-foreground/30"
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {(selectedRole === 'doc' || selectedRole === 'hworker') && (
                        <div className="space-y-3">
                          <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Daily Patient Load</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['Standard', 'High', 'Critical'].map(load => (
                              <button
                                key={load}
                                onClick={() => setFormData({...formData, clinicalLoad: load})}
                                className={`py-2 text-[10px] border font-mono transition-all ${
                                  formData.clinicalLoad === load 
                                    ? "border-[#86efac] text-[#86efac] bg-[#86efac]/5" 
                                    : "border-foreground/10 text-muted-foreground hover:border-foreground/30"
                                }`}
                              >
                                {load}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-foreground/5">
                        <div className="flex items-center gap-3 text-[10px] text-[#86efac]/60 font-mono">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#86efac] animate-pulse" />
                          <span>Secure Health Sync Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="text-2xl font-display text-white mb-8">Your Preferences</h2>
                    
                    <div className="space-y-6">
                      {/* Language selection */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Select Language</label>
                        <div className="flex flex-wrap gap-2">
                          {['English', 'Hindi', 'Marathi', 'Bengali'].map(lang => (
                            <button
                              key={lang}
                              onClick={() => setFormData({...formData, language: lang})}
                              className={`px-4 py-2 text-xs border font-mono transition-all ${
                                formData.language === lang 
                                  ? "border-[#86efac] text-[#86efac] bg-[#86efac]/5" 
                                  : "border-foreground/10 text-muted-foreground hover:border-foreground/30"
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Alert type */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Notification Method</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'In-App', label: 'Standard', sub: 'In-App Only' },
                            { id: 'SMS', label: 'Urgent', sub: 'SMS Protocol' },
                            { id: 'Call', label: 'Critical', sub: 'Automated Call' },
                          ].map(type => (
                            <button
                              key={type.id}
                              onClick={() => setFormData({...formData, alertType: type.id})}
                              className={`p-3 border text-left transition-all ${
                                formData.alertType === type.id 
                                  ? "border-[#86efac] bg-[#86efac]/5" 
                                  : "border-foreground/10 hover:border-foreground/20"
                              }`}
                            >
                              <p className={`text-[10px] font-bold ${formData.alertType === type.id ? "text-white" : "text-muted-foreground"}`}>{type.label}</p>
                              <p className="text-[9px] text-muted-foreground mt-1">{type.sub}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Data Source */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Data Entry Method</label>
                        <select 
                          value={formData.dataSource}
                          onChange={(e) => setFormData({...formData, dataSource: e.target.value})}
                          className="w-full bg-foreground/[0.03] border border-foreground/10 px-4 py-3 text-white focus:border-[#86efac]/50 focus:outline-none transition-colors font-mono text-xs appearance-none"
                        >
                          <option value="Manual">Manual Entry (Visual Self-Check)</option>
                          <option value="Volunteer">Health Volunteer Linked</option>
                          <option value="IoT">IoT Wearable Integration</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="text-2xl font-display text-white mb-8">What are your monitoring goals?</h2>
                    <div className="space-y-3">
                      {[
                        { label: 'Malnutrition Early Detection', detail: 'CNN-based visual analysis', icon: Shield },
                        { label: 'Personalized Nutrition Planning', detail: 'LLM-driven dietary guidance', icon: Heart },
                        { label: 'Pediatric Growth Tracking', detail: 'Clinical WHO standards', icon: Activity },
                      ].map((goal) => (
                        <div 
                          key={goal.label} 
                          onClick={() => setSelectedGoal(goal.label)}
                          className={`p-4 border flex items-center gap-4 transition-all cursor-pointer ${
                            selectedGoal === goal.label 
                              ? "border-[#86efac] bg-[#86efac]/5" 
                              : "border-foreground/10 hover:border-foreground/30"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            selectedGoal === goal.label ? "bg-[#86efac]/20" : "bg-foreground/5"
                          }`}>
                            <goal.icon className={`w-5 h-5 ${selectedGoal === goal.label ? "text-[#86efac]" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${selectedGoal === goal.label ? "text-white" : "text-white/80"}`}>{goal.label}</p>
                            <p className="text-xs text-muted-foreground">{goal.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-700">
                    <div className="w-20 h-20 rounded-full bg-[#86efac]/10 flex items-center justify-center mb-8 relative">
                      <div className="absolute inset-0 rounded-full border border-[#86efac] animate-ping opacity-20" />
                      <CheckCircle2 className="w-10 h-10 text-[#86efac]" />
                    </div>
                    <h2 className="text-3xl font-display text-white mb-4">Setup Complete!</h2>
                    <p className="text-[#86efac] font-mono text-sm mb-2 opacity-80">PROFILE VERIFIED: {formData.name || 'USER_ID_NULL'}</p>
                    <p className="text-muted-foreground max-w-sm mb-2">Welcome to Metis.</p>
                    <p className="text-muted-foreground max-w-sm mb-8 text-sm px-6">Your health profile and preferences have been successfully saved.</p>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="mt-auto pt-6 lg:pt-10 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-foreground/10">
                  <span className="text-[10px] font-mono text-muted-foreground tracking-tighter overflow-hidden whitespace-nowrap opacity-50 order-2 sm:order-1">
                    PROFILE: {selectedRole?.toUpperCase() || "PENDING"} • LANG: {formData.language.substring(0,3).toUpperCase()} • STEP 0{currentStep}
                  </span>
                  <div className="w-full sm:w-auto order-1 sm:order-2">
                    {currentStep < 6 ? (
                      <Button 
                        onClick={nextStep}
                        disabled={
                          (currentStep === 1 && !selectedRole) || 
                          (currentStep === 3 && (
                            !formData.name || 
                            (selectedRole === 'ind' && !formData.gender) ||
                            (selectedRole === 'mother' && !formData.isPregnant && !formData.gender)
                          )) ||
                          (currentStep === 5 && !selectedGoal)
                        }
                        className="w-full sm:w-auto bg-[#86efac] hover:bg-[#86efac]/90 text-black font-bold px-8 rounded-full shadow-[0_0_20px_rgba(134,239,172,0.2)] transition-all active:scale-95 h-12 lg:h-14"
                      >
                        {t.onboarding.continue}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button 
                        onClick={completeOnboarding}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-[#86efac] hover:bg-[#86efac]/90 text-black font-bold px-8 rounded-full shadow-[0_0_20px_rgba(134,239,172,0.2)] transition-all active:scale-95 h-12 lg:h-14"
                      >
                        {isSubmitting ? "Saving..." : t.onboarding.launchDashboard}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <style jsx global>{`
        .noise-overlay {
          position: relative;
        }
          z-index: 100;
          pointer-events: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
