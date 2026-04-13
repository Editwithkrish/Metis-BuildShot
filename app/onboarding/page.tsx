"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, ArrowRight, CheckCircle2, Globe, Heart, Shield, User, Users, Microscope } from "lucide-react";
import Link from "next/link";

const steps = [
  { id: 1, title: "Identity", description: "Define your role within the ecosystem" },
  { id: 2, title: "Context", description: "Provide localized clinical environment" },
  { id: 3, title: "Priorities", description: "Select primary health monitoring goals" },
  { id: 4, title: "Finalize", description: "Synchronizing with METIS cloud" },
];

export default function OnBoardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
    <main className="min-h-screen bg-background noise-overlay flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#86efac]/20 to-transparent" />
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#86efac]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#86efac]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-px bg-[#86efac]/30" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Initialization Phase</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-display text-white">
              Welcome to <span className="text-[#86efac]">METIS</span>
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">System Readiness</span>
            <Progress value={progress} className="w-48 h-1 bg-foreground/10" />
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
              <div className="lg:col-span-4 bg-foreground/[0.02] border-r border-foreground/10 p-8 lg:p-10">
                <div className="flex flex-col gap-8">
                  {steps.map((step) => (
                    <div 
                      key={step.id} 
                      className={`flex gap-4 transition-all duration-300 ${
                        currentStep >= step.id ? "opacity-100" : "opacity-30"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-sm shrink-0 ${
                        currentStep === step.id ? "border-[#86efac] text-[#86efac] bg-[#86efac]/10" : 
                        currentStep > step.id ? "border-[#86efac] bg-[#86efac] text-black" : "border-foreground/20 text-muted-foreground"
                      }`}>
                        {currentStep > step.id ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{step.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Content */}
              <div className="lg:col-span-8 p-8 lg:p-12 min-h-[450px] flex flex-col">
                {currentStep === 1 && (
                  <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="text-2xl font-display text-white mb-8">Who are you representing?</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { id: 'ind', label: 'Individual', sub: 'Monitoring self or family', icon: User },
                        { id: 'doc', label: 'Medical Doctor', sub: 'Clinical patient tracking', icon: Activity },
                        { id: 'hworker', label: 'Health Worker', sub: 'Regional fieldwork', icon: Users },
                        { id: 'res', label: 'Researcher', sub: 'Clinical data analysis', icon: Microscope },
                      ].map((role) => (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRole(role.id)}
                          className={`p-6 border text-left transition-all group ${
                            selectedRole === role.id 
                              ? "border-[#86efac] bg-[#86efac]/5" 
                              : "border-foreground/10 hover:border-[#86efac]/30 hover:bg-foreground/[0.02]"
                          }`}
                        >
                          <role.icon className={`w-6 h-6 mb-4 transition-colors ${selectedRole === role.id ? "text-[#86efac]" : "text-muted-foreground"}`} />
                          <p className="font-medium text-white">{role.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{role.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="text-2xl font-display text-white mb-8">Localized Precision</h2>
                    <p className="text-muted-foreground mb-8">Select your primary geographical region to load relevant nutritional metadata and government scheme datasets.</p>
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
                      <p className="text-xs text-muted-foreground italic font-mono uppercase tracking-tight text-center mt-4">More regions being synchronized currently...</p>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
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

                {currentStep === 4 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-700">
                    <div className="w-20 h-20 rounded-full bg-[#86efac]/10 flex items-center justify-center mb-8 relative">
                      <div className="absolute inset-0 rounded-full border border-[#86efac] animate-ping opacity-20" />
                      <CheckCircle2 className="w-10 h-10 text-[#86efac]" />
                    </div>
                    <h2 className="text-3xl font-display text-white mb-4">Configuration Complete</h2>
                    <p className="text-muted-foreground max-w-sm mb-8">Your clinical profile has been established. METIS is ready to begin real-time monitoring.</p>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="mt-auto pt-10 flex justify-between items-center border-t border-foreground/10">
                  <span className="text-xs font-mono text-muted-foreground">step_0{currentStep}.sys</span>
                  {currentStep < 4 ? (
                    <Button 
                      onClick={nextStep}
                      disabled={
                        (currentStep === 1 && !selectedRole) || 
                        (currentStep === 3 && !selectedGoal)
                      }
                      className="bg-[#86efac] hover:bg-[#86efac]/90 text-black font-bold px-8 rounded-full shadow-[0_0_20px_rgba(134,239,172,0.2)]"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Link href="/">
                      <Button className="bg-[#86efac] hover:bg-[#86efac]/90 text-black font-bold px-8 rounded-full shadow-[0_0_20px_rgba(134,239,172,0.2)]">
                        Launch Dashboard
                      </Button>
                    </Link>
                  )}
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
        .noise-overlay::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          z-index: 100;
        }
      `}</style>
    </main>
  );
}
