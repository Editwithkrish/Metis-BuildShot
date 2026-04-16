"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  History, 
  Calendar, 
  Filter, 
  ChevronLeft, 
  ArrowRight,
  TrendingUp,
  Clock,
  Search,
  ArrowUpDown,
  FileText,
  Utensils
} from "lucide-react";

export default function NutritionLogsPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchLogs();
  }, [sortOrder]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('profile_id', user.id)
        .order('logged_at', { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setLogs(data || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = filterType === "All" 
    ? logs 
    : logs.filter(log => log.meal_type === filterType);

  // Grouping by date
  const groupedLogs = filteredLogs.reduce((acc: any, log: any) => {
    const date = new Date(log.logged_at).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  const mealTypes = ["All", "Breakfast", "Lunch", "Dinner", "Snacks", "Late Night", "Supplements"];

  return (
    <div className="max-w-[1000px] mx-auto animate-in fade-in duration-500 pb-20">
      {/* Header & Nav */}
      <div className="flex items-center gap-4 mb-8">
        <a href="/dashboard/nutrition" className="p-2 border border-foreground/10 hover:bg-foreground/5 transition-colors">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </a>
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-[#86efac] uppercase tracking-widest">Metadata Repository</span>
            </div>
            <h2 className="text-3xl font-display text-white">Nutrition Log</h2>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-10">
        <div className="md:col-span-8 flex flex-wrap gap-2">
            {mealTypes.map(type => (
                <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest border transition-all ${
                        filterType === type 
                        ? "bg-[#86efac]/10 border-[#86efac] text-[#86efac]" 
                        : "bg-foreground/[0.02] border-foreground/10 text-muted-foreground hover:border-foreground/30"
                    }`}
                >
                    {type}
                </button>
            ))}
        </div>
        <div className="md:col-span-4 flex justify-end">
            <button 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 px-4 py-2 border border-foreground/10 bg-foreground/[0.02] text-[10px] font-mono text-muted-foreground uppercase tracking-widest hover:border-foreground/30 transition-all"
            >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
            </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-2 border-[#86efac]/10 border-t-[#86efac] rounded-full animate-spin" />
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Parsing Historical Data...</p>
        </div>
      ) : Object.keys(groupedLogs).length === 0 ? (
        <div className="border border-foreground/10 bg-foreground/[0.02] p-20 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Registry is currently empty</p>
        </div>
      ) : (
        <div className="space-y-12">
            {Object.entries(groupedLogs).map(([date, items]: [string, any]) => (
                <div key={date} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <h3 className="text-[11px] font-mono text-white/50 uppercase tracking-[0.2em] bg-foreground/5 px-3 py-1">{date}</h3>
                        <div className="h-px flex-1 bg-foreground/10" />
                        <span className="text-[10px] font-mono text-muted-foreground">{items.length} records identified</span>
                    </div>

                    <div className="grid gap-4">
                        {items.map((log: any, idx: number) => (
                            <div key={idx} className="group border border-foreground/10 bg-foreground/[0.02] p-6 hover:bg-foreground/[0.04] transition-all hover:border-[#86efac]/20">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex gap-5">
                                        <div className="w-12 h-12 border border-foreground/10 flex items-center justify-center bg-black group-hover:border-[#86efac]/30 transition-colors">
                                            <Utensils className="w-5 h-5 text-muted-foreground group-hover:text-[#86efac] transition-colors" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-mono py-0.5 px-2 border border-[#86efac]/20 text-[#86efac] uppercase">{log.meal_type}</span>
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[10px] font-mono">{new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                            <p className="text-lg font-display text-white tracking-tight">{log.food_name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono text-muted-foreground uppercase">Quantity:</span>
                                                <span className="text-[10px] font-mono text-white/70">{log.quantity}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 md:text-right">
                                        <div className="px-5 py-3 border border-foreground/5 bg-black/40 min-w-[80px]">
                                            <p className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Energy</p>
                                            <p className="text-lg font-mono text-white">{log.calories}<span className="text-[10px] ml-1 opacity-50 font-normal">kcal</span></p>
                                        </div>
                                        <div className="px-5 py-3 border border-foreground/5 bg-black/40 min-w-[80px]">
                                            <p className="text-[9px] font-mono text-muted-foreground uppercase mb-1">PRO</p>
                                            <p className="text-lg font-mono text-white">{log.protein || 0}<span className="text-[10px] ml-1 opacity-50 font-normal">g</span></p>
                                        </div>
                                        <div className="px-5 py-3 border border-foreground/5 bg-black/40 min-w-[80px]">
                                            <p className="text-[9px] font-mono text-muted-foreground uppercase mb-1">CHO</p>
                                            <p className="text-lg font-mono text-white">{log.carbs || 0}<span className="text-[10px] ml-1 opacity-50 font-normal">g</span></p>
                                        </div>
                                        <div className="px-5 py-3 border border-foreground/5 bg-black/40 min-w-[80px]">
                                            <p className="text-[9px] font-mono text-muted-foreground uppercase mb-1">FAT</p>
                                            <p className="text-lg font-mono text-white">{log.fats || 0}<span className="text-[10px] ml-1 opacity-50 font-normal">g</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}
