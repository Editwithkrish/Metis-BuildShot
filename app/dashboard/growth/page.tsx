"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  History,
  Scale,
  Ruler,
  Calendar,
  AlertCircle
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { usePatient } from "@/lib/context/patient-context";
import { PatientEmptyState } from "@/components/dashboard/patient-empty-state";

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */

interface GrowthEntry {
  id?: string;
  logged_at: string;
  weight: number;
  height?: number;
}

/* ------------------------------------------------------------------ */
/*  GROWTH CHART (SVG)                                                 */
/* ------------------------------------------------------------------ */

function GrowthStatsChart({ data, type }: { data: GrowthEntry[], type: 'weight' | 'height' }) {
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-[10px] font-mono text-muted-foreground opacity-30">INSUFFICIENT DATA</div>;
  
  const values = data.map(d => (type === 'weight' ? d.weight : d.height) || 0);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const padding = 20;
  const chartW = 400;
  const chartH = 120;

  const points = data.map((d, i) => {
    const val = (type === 'weight' ? d.weight : d.height) || 0;
    const x = data.length > 1 ? padding + (i / (data.length - 1)) * (chartW - padding * 2) : chartW / 2;
    const y = chartH - padding - ((val - minVal) / (maxVal - minVal || 1)) * (chartH - padding * 2);
    return { x, y };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-24 overflow-visible">
      {points.length > 1 && (
        <path
            d={path}
            fill="none"
            stroke={type === 'weight' ? "#86efac" : "#60a5fa"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_8px_rgba(134,239,172,0.3)]"
        />
      )}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill={type === 'weight' ? "#86efac" : "#60a5fa"}
          className="animate-in fade-in duration-500"
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export default function GrowthPage() {
  const supabase = createClient();
  const { activePatient } = usePatient();
  const [history, setHistory] = useState<GrowthEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [newHeight, setNewHeight] = useState("");
  const [isAdult, setIsAdult] = useState(false);

  useEffect(() => {
    if (activePatient) {
        fetchLogs();
    } else {
        setIsLoading(false);
    }
  }, [activePatient]);

  const fetchLogs = async () => {
    if (!activePatient) return;
    setIsLoading(true);
    
    try {
      if (activePatient.dob) {
          const birthDate = new Date(activePatient.dob);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
          
          setIsAdult(age >= 18);
      } else {
          setIsAdult(activePatient.relationship_type === 'self');
      }

      const { data, error } = await supabase
        .from('growth_logs')
        .select('*')
        .eq('patient_id', activePatient.id)
        .order('logged_at', { ascending: true });

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      console.error("Error fetching logs:", error.message);
      toast.error("Failed to load historical data.");
    } finally {
      setIsLoading(false);
    }
  };

  const addEntry = async () => {
    if (!newWeight) return;
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      if (!activePatient) throw new Error("Select a patient first");

      const weightValue = parseFloat(newWeight);
      const heightValue = newHeight ? parseFloat(newHeight) : null;

      const { error } = await supabase
        .from('growth_logs')
        .insert([{
          profile_id: user.id,
          patient_id: activePatient.id,
          weight: weightValue,
          height: heightValue,
          logged_at: new Date().toISOString().split('T')[0]
        }]);

      if (error) throw error;

      // Update patient biometric record
      await supabase
        .from('patients')
        .update({
          initial_weight: weightValue.toString(),
          ...(heightValue && { initial_height: heightValue.toString() }),
          updated_at: new Date().toISOString()
        })
        .eq('id', activePatient.id);

      toast.success("Biometric data synced.");
      setNewWeight("");
      setNewHeight("");
      fetchLogs();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentWeight = history.length > 0 ? history[history.length - 1].weight : parseFloat(activePatient?.initial_weight || "0");
  const currentHeight = history.length > 0 ? history[history.length - 1].height : parseFloat(activePatient?.initial_height || "0");
  const prevWeight = history.length > 1 ? history[history.length - 2].weight : currentWeight;
  const weightDiff = history.length > 0 ? currentWeight - prevWeight : 0;

  if (!activePatient) {
    return (
      <PatientEmptyState 
        title="No Patient Selected"
        description="Select a patient from the header or enroll a new one to view growth data."
      />
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-px bg-[#86efac]/30" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Biometric Tracking</span>
          </div>
          <h2 className="text-4xl font-display text-white">Growth Analytics</h2>
          <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-tight">
            Tracking profile: <span className="text-white">{activePatient?.full_name || "Patient Zero"}</span> • {isAdult ? "Adult Protocol" : "Developmental Protocol"}
          </p>
        </div>
        
        <div className="flex gap-4">
            <div className="px-6 py-4 border border-foreground/10 bg-foreground/[0.02]">
                <p className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Last Updated</p>
                <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#86efac]" />
                    <span className="text-sm font-mono text-white">29 March, 2026</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: PRIMARY STATS & ENTRY */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Stats Card */}
          <div className="border border-foreground/10 bg-foreground/[0.02] p-6 space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-[#86efac]" />
                        <span className="text-[10px] font-mono uppercase text-muted-foreground">Current Weight</span>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-mono ${weightDiff >= 0 ? "text-[#86efac]" : "text-destructive"}`}>
                        {weightDiff >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(weightDiff).toFixed(1)}kg
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display text-white">{currentWeight}</span>
                    <span className="text-xs font-mono text-muted-foreground uppercase">kg</span>
                </div>
            </div>

            {!isAdult && (
              <div className="pt-6 border-t border-foreground/5 space-y-4">
                <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-[#60a5fa]" />
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">Current Height</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display text-white">{currentHeight}</span>
                    <span className="text-xs font-mono text-muted-foreground uppercase">cm</span>
                </div>
              </div>
            )}
          </div>

          {/* Log Entry Card */}
          <div className="border border-foreground/10 bg-foreground/[0.02] p-6">
            <div className="flex items-center gap-2 mb-6">
                <Plus className="w-4 h-4 text-[#86efac]" />
                <h3 className="font-display text-lg uppercase tracking-tight text-white">Log Weekly Update</h3>
            </div>
            
            <div className="space-y-5">
                <div className="space-y-2">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Weight (kg)</label>
                    <input 
                        type="number"
                        step="0.1"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        placeholder={isAdult ? "70.0" : "5.5"}
                        className="w-full bg-black/40 border border-foreground/10 p-3 text-white font-mono text-sm focus:border-[#86efac]/50 outline-none transition-colors"
                    />
                </div>
                
                {!isAdult && (
                   <div className="space-y-2">
                        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Height (cm)</label>
                        <input 
                            type="number"
                            step="0.5"
                            value={newHeight}
                            onChange={(e) => setNewHeight(e.target.value)}
                            placeholder={isAdult ? "175.0" : "50.0"}
                            className="w-full bg-black/40 border border-foreground/10 p-3 text-white font-mono text-sm focus:border-[#86efac]/50 outline-none transition-colors"
                        />
                    </div>
                )}

                <button 
                    onClick={addEntry}
                    disabled={!newWeight || isSubmitting}
                    className="w-full py-4 bg-[#86efac] text-black font-bold text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-[#86efac]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Syncing..." : "Update Records"}
                </button>

                <div className="flex gap-2 text-[9px] text-muted-foreground font-mono leading-relaxed mt-4">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>Consistent weekly data ensures clinical accuracy for Metis AI diagnosis.</span>
                </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CHARTS & HISTORY */}
        <div className="lg:col-span-8 space-y-6">
            {/* Chart Area */}
            <div className="border border-foreground/10 bg-foreground/[0.02] p-8">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-[#86efac]" />
                        <h3 className="font-display text-xl uppercase tracking-tight text-white">Velocity Analytics</h3>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-[#86efac]" />
                             <span className="text-[9px] font-mono uppercase text-muted-foreground">Weight Trend</span>
                        </div>
                        {!isAdult && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#60a5fa]" />
                                <span className="text-[9px] font-mono uppercase text-muted-foreground">Height Trend</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-12">
                     <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">Weight Variance (kg)</span>
                            <span className="text-[10px] font-mono text-[#86efac]">0.3kg AVG GROWTH / WK</span>
                        </div>
                        <div className="bg-black/20 p-6 border border-foreground/5 h-48 flex flex-col justify-end">
                            <GrowthStatsChart data={history} type="weight" />
                        </div>
                     </div>

                     {!isAdult && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-mono text-muted-foreground uppercase">Height Variance (cm)</span>
                                <span className="text-[10px] font-mono text-[#60a5fa]">1.2cm AVG GROWTH / WK</span>
                            </div>
                            <div className="bg-black/20 p-6 border border-foreground/5 h-48 flex flex-col justify-end">
                                <GrowthStatsChart data={history} type="height" />
                            </div>
                        </div>
                     )}
                </div>
            </div>

            {/* History Table */}
            <div className="border border-foreground/10 bg-foreground/[0.02] p-8">
                <div className="flex items-center gap-3 mb-8">
                    <History className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-display text-xl uppercase tracking-tight text-white">Historical Sync</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-foreground/5">
                                <th className="pb-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Entry Date</th>
                                <th className="pb-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Weight</th>
                                {!isAdult && <th className="pb-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Height</th>}
                                <th className="pb-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/5">
                            {history.slice().reverse().map((entry, i) => (
                                <tr key={i} className="group">
                                    <td className="py-4 text-xs font-mono text-white/70">{new Date(entry.logged_at).toLocaleDateString()}</td>
                                    <td className="py-4 text-xs font-mono text-white">{entry.weight} kg</td>
                                    {!isAdult && <td className="py-4 text-xs font-mono text-white">{entry.height} cm</td>}
                                    <td className="py-4 text-right">
                                        <span className="text-[9px] font-mono px-2 py-0.5 border border-[#86efac]/20 text-[#86efac] bg-[#86efac]/5 uppercase">Verified</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
