"use client";

import React, { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n-context";
import { usePatient } from "@/lib/context/patient-context";
import { PatientEmptyState } from "@/components/dashboard/patient-empty-state";
import { 
  Utensils, 
  Camera, 
  Plus, 
  Trash2, 
  ChevronDown, 
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  History,
  X
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  TYPES & MOCK DATA                                                  */
/* ------------------------------------------------------------------ */

interface FoodEntry {
  id: string;
  name: string;
  quantity: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

interface MealLog {
  id: string;
  type: string;
  time: string;
  items: FoodEntry[];
}

const mealTypes = [
  "Breakfast", "Lunch", "Dinner", "Snacks", "Late Night", "Supplements"
];

/* ------------------------------------------------------------------ */
/*  CAMERA MODAL                                                       */
/* ------------------------------------------------------------------ */

function CameraModal({ isOpen, onClose, onCapture }: { isOpen: boolean, onClose: () => void, onCapture: (img: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Camera error:", err));
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      if (videoRef.current?.srcObject) {
         const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
         tracks.forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL("image/png"));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-card border border-[#86efac]/20 w-full max-w-lg relative overflow-hidden flex flex-col min-h-[500px] shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
        <div className="p-4 border-b border-foreground/10 flex items-center justify-between shrink-0">
           <span className="text-[10px] font-mono text-white uppercase tracking-widest">Visual Analysis Capture</span>
           <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
              <X className="w-4 h-4" />
           </button>
        </div>
        
        <div className="flex-1 bg-black relative flex items-center justify-center min-h-[300px]">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-48 h-48 border border-white/10 relative opacity-50">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#86efac]" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#86efac]" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#86efac]" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#86efac]" />
                </div>
            </div>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
        </div>

        <div className="p-10 flex justify-center bg-card shrink-0">
            <button 
                onClick={takePhoto}
                className="w-16 h-16 rounded-full border-4 border-[#86efac]/20 p-1 group hover:border-[#86efac]/50 transition-all flex items-center justify-center"
            >
                <div className="w-full h-full rounded-full bg-white group-active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
            </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export default function NutritionPage() {
  const supabase = createClient();
  const { activePatient } = usePatient();
  const [selectedMeal, setSelectedMeal] = useState("Breakfast");
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activePatient) {
        fetchData();
    } else {
        setIsLoading(false);
    }
  }, [activePatient]);

  const fetchData = async () => {
    if (!activePatient) return;
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch today's logs for the ACTIVE PATIENT
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: logs, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('patient_id', activePatient.id)
        .gte('logged_at', today.toISOString())
        .order('logged_at', { ascending: false });

      if (error) throw error;
      setDailyLogs(logs || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTargetIntake = () => {
    if (!activePatient || !activePatient.dob) return 2200; // Default fallback

    const weight = parseFloat(activePatient.initial_weight || "70");
    const height = parseFloat(activePatient.initial_height || "170");
    
    // Calculate Age from Patient DOB
    const birthDate = new Date(activePatient.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    // Months for pediatric logic
    const diffMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
    
    // INFANT CALCULATION (Weight-based under 2 years)
    if (activePatient.relationship_type === 'child' && diffMonths < 24) {
        // Average ~90-100 kcal per kg for infants
        return Math.round(weight * 95);
    }

    // ADULT CALCULATION (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    
    if (activePatient.gender === 'Male') bmr += 5;
    else bmr -= 161;

    // Add activity multiplier (Sedentary 1.2)
    let target = bmr * 1.2;

    return Math.round(target);
  };

  const targetIntake = calculateTargetIntake();
  const currentKcal = dailyLogs.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const currentProtein = dailyLogs.reduce((acc, curr) => acc + (curr.protein || 0), 0);

  const addEmptyEntry = () => {
    const newEntry: FoodEntry = { id: Math.random().toString(), name: "", quantity: "" };
    setEntries([...entries, newEntry]);
  };

  const updateEntry = (id: string, field: keyof FoodEntry, value: string | number) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const saveLogs = async () => {
    if (entries.length === 0) return;
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Auth required");

      if (!activePatient) throw new Error("Select a patient first");

      const logsToInsert = entries.map(entry => ({
        profile_id: user.id,
        patient_id: activePatient.id,
        meal_type: selectedMeal,
        food_name: entry.name,
        quantity: entry.quantity,
        calories: entry.calories || 0,
        protein: entry.protein || 0,
        carbs: entry.carbs || 0,
        fats: entry.fats || 0,
        logged_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('nutrition_logs').insert(logsToInsert);
      if (error) throw error;

      toast.success("Nutrition records synchronized.");
      setEntries([]);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const handleCapture = (img: string) => {
    setCapturedImage(img);
    setIsAnalyzing(true);
    
    // Simulate AI Population
    setTimeout(() => {
        const mockResults: FoodEntry[] = [
            { id: Math.random().toString(), name: "Sourdough Bread", quantity: "2 slices", calories: 180, protein: 6, carbs: 32, fats: 1 },
            { id: Math.random().toString(), name: "Avocado", quantity: "1/2 piece", calories: 120, protein: 2, carbs: 6, fats: 11 },
            { id: Math.random().toString(), name: "Poached Egg", quantity: "1 large", calories: 70, protein: 6, carbs: 0, fats: 5 }
        ];
        setEntries(prev => [...prev, ...mockResults]);
        setIsAnalyzing(false);
    }, 2000);
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-10 h-10 border-2 border-[#86efac]/10 border-t-[#86efac] rounded-full animate-spin" />
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Accessing Nutritional Core</p>
        </div>
    );
  }

  if (!activePatient) {
    return (
      <PatientEmptyState 
        title="No Patient Selected"
        description="Enroll or select a patient to access the nutrition planner, calorie logs, and dietary analysis."
      />
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 pb-20">
      <CameraModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)} 
        onCapture={handleCapture}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-px bg-[#86efac]/30" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Nutritional Intelligence</span>
          </div>
          <h2 className="text-4xl font-display text-white">Dietary Log</h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-tight">
            Monitoring caloric velocity and macro distribution
          </p>
        </div>

        <div className="flex gap-4">
            <div className="px-6 py-4 border border-foreground/10 bg-foreground/[0.02]">
                <p className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Target Intake</p>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#86efac]" />
                    <span className="text-sm font-mono text-white">{targetIntake.toLocaleString()} kcal</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: MEAL LOGGING */}
        <div className="lg:col-span-7 space-y-6">
            <div className="border border-foreground/10 bg-foreground/[0.02] p-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <Utensils className="w-5 h-5 text-[#86efac]" />
                <h3 className="font-display text-xl uppercase tracking-tight text-white">Log Entry</h3>
              </div>
            </div>

            <div className="space-y-8">
              {/* Meal Type Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Select Meal Period</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {mealTypes.map(meal => (
                    <button
                      key={meal}
                      onClick={() => setSelectedMeal(meal)}
                      className={`py-3 text-[10px] border font-mono uppercase tracking-widest transition-all ${
                        selectedMeal === meal
                          ? "border-[#86efac] text-[#86efac] bg-[#86efac]/5"
                          : "border-foreground/10 text-muted-foreground hover:border-foreground/30"
                      }`}
                    >
                      {meal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Capture vs Manual */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="flex flex-col items-center justify-center p-8 border border-dashed border-foreground/20 hover:border-[#86efac]/50 hover:bg-[#86efac]/5 transition-all group gap-3"
                >
                  <Camera className="w-6 h-6 text-muted-foreground group-hover:text-[#86efac] transition-colors" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground group-hover:text-white">Visual Recognition</span>
                </button>
                <button
                  onClick={addEmptyEntry}
                  className="flex flex-col items-center justify-center p-8 border border-dashed border-foreground/20 hover:border-[#86efac]/50 hover:bg-[#86efac]/5 transition-all group gap-3"
                >
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-[#86efac] transition-colors" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground group-hover:text-white">Manual Input</span>
                </button>
              </div>

              {/* Analyzing State */}
              {isAnalyzing && (
                <div className="p-6 border border-[#86efac]/20 bg-[#86efac]/5 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-4">
                    <Sparkles className="w-5 h-5 text-[#86efac]" />
                    <span className="text-xs font-mono text-[#86efac] uppercase tracking-widest">AI processing visual data...</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[#86efac] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-[#86efac] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-[#86efac] rounded-full animate-bounce" />
                  </div>
                </div>
              )}

              {/* Food Items Table */}
              {entries.length > 0 && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Identified Items</span>
                    <span className="text-[9px] font-mono text-muted-foreground">{entries.length} items logged</span>
                  </div>

                  <div className="space-y-3">
                    {entries.map((entry) => (
                      <div key={entry.id} className="flex gap-3 group">
                        <div className="flex-1 border border-foreground/10 focus-within:border-[#86efac]/30 transition-colors">
                          {/* Name and Qty Row */}
                          <div className="grid grid-cols-12 border-b border-foreground/10">
                            <input
                                type="text"
                                value={entry.name}
                                onChange={(e) => updateEntry(entry.id, "name", e.target.value)}
                                placeholder="Food name (e.g. Rice)"
                                className="col-span-8 bg-transparent p-4 text-xs text-white border-r border-foreground/10 outline-none placeholder:text-muted-foreground/30 font-mono"
                            />
                            <input
                                type="text"
                                value={entry.quantity}
                                onChange={(e) => updateEntry(entry.id, "quantity", e.target.value)}
                                placeholder="Quantity"
                                className="col-span-4 bg-transparent p-4 text-xs text-white outline-none placeholder:text-muted-foreground/30 font-mono"
                            />
                          </div>
                          {/* Macros Row */}
                          <div className="grid grid-cols-4 bg-white/[0.02]">
                                <div className="border-r border-foreground/5 p-3 flex flex-col items-center">
                                    <span className="text-[8px] font-mono text-muted-foreground uppercase mb-1">kcal</span>
                                    <input 
                                        type="number" 
                                        value={entry.calories || ""} 
                                        onChange={(e) => updateEntry(entry.id, "calories", parseInt(e.target.value))}
                                        className="bg-transparent text-center text-[10px] font-mono text-white outline-none w-full"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="border-r border-foreground/5 p-3 flex flex-col items-center">
                                    <span className="text-[8px] font-mono text-muted-foreground uppercase mb-1">PRO (g)</span>
                                    <input 
                                        type="number" 
                                        value={entry.protein || ""} 
                                        onChange={(e) => updateEntry(entry.id, "protein", parseInt(e.target.value))}
                                        className="bg-transparent text-center text-[10px] font-mono text-[#86efac] outline-none w-full"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="border-r border-foreground/5 p-3 flex flex-col items-center">
                                    <span className="text-[8px] font-mono text-muted-foreground uppercase mb-1">CHO (g)</span>
                                    <input 
                                        type="number" 
                                        value={entry.carbs || ""} 
                                        onChange={(e) => updateEntry(entry.id, "carbs", parseInt(e.target.value))}
                                        className="bg-transparent text-center text-[10px] font-mono text-blue-400 outline-none w-full"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="p-3 flex flex-col items-center text-center">
                                    <span className="text-[8px] font-mono text-muted-foreground uppercase mb-1">FAT (g)</span>
                                    <input 
                                        type="number" 
                                        value={entry.fats || ""} 
                                        onChange={(e) => updateEntry(entry.id, "fats", parseInt(e.target.value))}
                                        className="bg-transparent text-center text-[10px] font-mono text-amber-400 outline-none w-full"
                                        placeholder="0"
                                    />
                                </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeEntry(entry.id)}
                          className="px-4 border border-foreground/10 hover:border-destructive/30 hover:bg-destructive/5 transition-all text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={saveLogs}
                    disabled={isSubmitting || entries.length === 0}
                    className="w-full py-4 bg-[#86efac] text-black font-bold text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-[#86efac]/90 transition-all mt-6 shadow-[0_0_20px_rgba(134,239,172,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Synchronizing..." : "Synchronize Nutrition Log"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT LOGS & STATS */}
        <div className="lg:col-span-5 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-foreground/10 bg-foreground/[0.02] p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#86efac]" />
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Calories</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display text-white">{currentKcal.toLocaleString()}</span>
                <span className="text-[10px] font-mono text-muted-foreground">/ {targetIntake.toLocaleString()}</span>
              </div>
            </div>
            <div className="border border-foreground/10 bg-foreground/[0.02] p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-[10px] font-mono uppercase text-muted-foreground">Protein</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display text-white">{currentProtein}g</span>
                <span className="text-[10px] font-mono text-muted-foreground">/ {Math.round(targetIntake * 0.15 / 4)}g</span>
              </div>
            </div>
          </div>

             {/* Recent History */}
             <div className="border border-foreground/10 bg-foreground/[0.02] p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-muted-foreground" />
                        <h3 className="font-display text-xl uppercase tracking-tight text-white">Recent Meals</h3>
                    </div>
                    <a href="/dashboard/nutrition/logs" className="text-[10px] font-mono text-[#86efac] uppercase tracking-widest hover:underline cursor-pointer">Full Log</a>
                </div>

                <div className="space-y-6">
                    {dailyLogs.length === 0 ? (
                        <p className="text-[10px] font-mono text-muted-foreground uppercase text-center py-4">No data logged today</p>
                    ) : (
                        dailyLogs.slice(0, 5).map((log, i) => (
                            <div key={i} className="flex items-start justify-between group">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 border border-foreground/10 flex items-center justify-center bg-foreground/5 shrink-0">
                                        <Clock className="w-4 h-4 text-muted-foreground group-hover:text-[#86efac] transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-white">{log.meal_type}</p>
                                            <span className="text-[10px] font-mono text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">• {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{log.food_name} ({log.quantity})</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-mono text-white">{log.calories}</p>
                                    <p className="text-[9px] font-mono text-muted-foreground uppercase">kcal</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
             </div>

             {/* Nutrition Tip */}
             <div className="border border-[#86efac]/20 bg-[#86efac]/5 p-8 relative overflow-hidden group">
                <Sparkles className="absolute -right-2 -bottom-2 w-20 h-20 text-[#86efac]/10 group-hover:rotate-12 transition-transform duration-700" />
                <div className="relative z-10">
                    <h3 className="text-xs font-mono text-[#86efac] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        Micro-Insight
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed italic">
                        {currentKcal < targetIntake * 0.5 
                            ? "Your energy intake is currently low. Focus on complex carbohydrates for sustained release."
                            : currentProtein < (targetIntake * 0.15 / 4) * 0.5
                            ? "Protein intake is lagging. Consider adding legumes or lean sources to your next meal."
                            : "Metabolic targets are within optimal range. Continue current synchronization pattern."}
                    </p>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}
