"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown,
  Info,
  Clock,
  ArrowUpRight,
  Stethoscope,
  PlusCircle
} from "lucide-react";
import { usePatient } from "@/lib/context/patient-context";
import { PatientEmptyState } from "@/components/dashboard/patient-empty-state";

/* ------------------------------------------------------------------ */
/*  VACCINATION SCHEDULE DATA                                          */
/* ------------------------------------------------------------------ */

interface Vaccine {
  id: string;
  name: string;
  status: 'completed' | 'pending' | 'upcoming';
  description?: string;
}

interface AgeGroup {
  age: string;
  vaccines: Vaccine[];
}

const schedule: AgeGroup[] = [
  {
    age: "At Birth",
    vaccines: [
      { id: "bcg-birth", name: "BCG", status: 'completed' },
      { id: "opv-0-birth", name: "OPV-0", status: 'completed' },
      { id: "hepb-1-birth", name: "Hepatitis B (1st dose)", status: 'completed' },
    ]
  },
  {
    age: "6 Weeks",
    vaccines: [
      { id: "dtp-6w", name: "DTP (1st)", status: 'pending' },
      { id: "hib-6w", name: "Hib (1st)", status: 'pending' },
      { id: "ipv-6w", name: "IPV (1st)", status: 'pending' },
      { id: "rota-6w", name: "Rotavirus (1st)", status: 'pending' },
      { id: "pcv-6w", name: "PCV (1st)", status: 'pending' },
    ]
  },
  {
    age: "10 Weeks",
    vaccines: [
      { id: "dtp-10w", name: "DTP (2nd)", status: 'upcoming' },
      { id: "hib-10w", name: "Hib (2nd)", status: 'upcoming' },
      { id: "ipv-10w", name: "IPV (2nd)", status: 'upcoming' },
      { id: "rota-10w", name: "Rotavirus (2nd)", status: 'upcoming' },
      { id: "pcv-10w", name: "PCV (2nd)", status: 'upcoming' },
    ]
  },
  {
    age: "14 Weeks",
    vaccines: [
      { id: "dtp-14w", name: "DTP (3rd)", status: 'upcoming' },
      { id: "hib-14w", name: "Hib (3rd)", status: 'upcoming' },
      { id: "ipv-14w", name: "IPV (3rd)", status: 'upcoming' },
      { id: "rota-14w", name: "Rotavirus (3rd)", status: 'upcoming' },
      { id: "pcv-14w", name: "PCV (3rd)", status: 'upcoming' },
    ]
  },
  {
    age: "9 Months",
    vaccines: [
      { id: "measles-9m", name: "Measles / MR (1st)", status: 'upcoming' },
      { id: "vita-9m", name: "Vitamin A", status: 'upcoming' },
    ]
  },
  {
    age: "12 Months",
    vaccines: [
      { id: "hepa-12m", name: "Hepatitis A (1st)", status: 'upcoming' },
      { id: "pcv-12m", name: "PCV Booster", status: 'upcoming' },
    ]
  },
  {
    age: "15 Months",
    vaccines: [
      { id: "mmr-15m", name: "MMR (2nd)", status: 'upcoming' },
      { id: "vari-15m", name: "Varicella", status: 'upcoming' },
    ]
  },
  {
    age: "16–18 Months",
    vaccines: [
      { id: "dtp-18m", name: "DTP Booster", status: 'upcoming' },
      { id: "ipv-18m", name: "IPV Booster", status: 'upcoming' },
      { id: "hib-18m", name: "Hib Booster", status: 'upcoming' },
    ]
  }
];

/* ------------------------------------------------------------------ */
/*  COMPONENTS                                                         */
/* ------------------------------------------------------------------ */

function ConfirmationModal({ isOpen, onConfirm, onCancel, vaccineName }: { 
  isOpen: boolean, 
  onConfirm: () => void, 
  onCancel: () => void,
  vaccineName: string 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-card border border-foreground/10 w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 border border-foreground/10 flex items-center justify-center bg-foreground/5">
                <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-xl font-display text-white uppercase tracking-tight">Status Modification</h3>
        </div>
        
        <p className="text-xs text-muted-foreground font-mono leading-relaxed mb-8">
           You are about to modify the completion status for <span className="text-[#86efac]">{vaccineName}</span>. 
           Medical history updates require secondary verification. Proceed with status reversal?
        </p>

        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={onCancel}
                className="py-3 border border-foreground/10 text-[10px] font-mono text-muted-foreground uppercase tracking-widest hover:border-foreground/30 transition-all"
            >
                Cancel
            </button>
            <button 
                onClick={onConfirm}
                className="py-3 bg-[#86efac] text-black text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-[#86efac]/90 transition-all"
            >
                Confirm Reversal
            </button>
        </div>
      </div>
    </div>
  );
}


export default function VaccinationsPage() {
  const supabase = createClient();
  const { activePatient } = usePatient();
  const [vaccineGroups, setVaccineGroups] = useState(schedule);
  const [modalState, setModalState] = useState<{ isOpen: boolean, vaccineId: string, vaccineName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activePatient) {
        if (activePatient.dob) {
            initializeSchedule(activePatient.dob);
        }
        setIsLoading(false);
    } else {
        setIsLoading(false);
    }
  }, [activePatient]);

  useEffect(() => {
    if (modalState?.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [modalState?.isOpen]);

  const initializeSchedule = (dobString: string) => {
    const dob = new Date(dobString);
    const now = new Date();
    
    // Total milliseconds lived
    const diffTime = Math.abs(now.getTime() - dob.getTime());
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    const diffMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());

    const updatedGroups = schedule.map(group => {
        const groupAge = group.age.toLowerCase();
        let groupStatus: Vaccine['status'] = 'upcoming';

        // Logic to determine if age group has passed
        if (groupAge === "at birth") {
            groupStatus = 'completed';
        } else if (groupAge.includes("weeks")) {
            const weeksNeeded = parseInt(groupAge);
            if (diffWeeks > weeksNeeded) groupStatus = 'completed';
            else if (diffWeeks === weeksNeeded) groupStatus = 'pending';
        } else if (groupAge.includes("months")) {
            const monthsNeeded = parseInt(groupAge);
            if (diffMonths > monthsNeeded) groupStatus = 'completed';
            else if (diffMonths === monthsNeeded) groupStatus = 'pending';
        }

        return {
            ...group,
            vaccines: group.vaccines.map(v => ({ ...v, status: groupStatus }))
        };
    });

    setVaccineGroups(updatedGroups);
  };

  const toggleStatus = (groupIdx: number, vaccineId: string) => {
    const group = vaccineGroups[groupIdx];
    const vaccine = group.vaccines.find(v => v.id === vaccineId);

    if (vaccine?.status === 'completed') {
        setModalState({ isOpen: true, vaccineId, vaccineName: vaccine.name });
        return;
    }

    const newGroups = [...vaccineGroups];
    const targetGroup = newGroups[groupIdx];
    targetGroup.vaccines = targetGroup.vaccines.map(v => 
        v.id === vaccineId ? { ...v, status: 'completed' } : v
    );
    setVaccineGroups(newGroups);
  };

  const handleConfirmReversal = () => {
    if (!modalState) return;

    const newGroups = vaccineGroups.map(group => ({
        ...group,
        vaccines: group.vaccines.map(v => 
            v.id === modalState.vaccineId ? { ...v, status: 'pending' as const } : v
        )
    }));
    setVaccineGroups(newGroups);
    setModalState(null);
  };

  const completedCount = vaccineGroups.flatMap(g => g.vaccines).filter(v => v.status === 'completed').length;
  const totalCount = vaccineGroups.flatMap(g => g.vaccines).length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  if (!activePatient) {
    return (
      <PatientEmptyState 
        title="No Patient Selected"
        description="Select a patient from the header or enroll a new one to view their vaccination schedule."
      />
    );
  }

  return (
    <>
      <ConfirmationModal 
        isOpen={!!modalState?.isOpen}
        vaccineName={modalState?.vaccineName || ""}
        onConfirm={handleConfirmReversal}
        onCancel={() => setModalState(null)}
      />

      <div className="max-w-[1000px] mx-auto animate-in fade-in duration-500 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-px bg-[#86efac]/30" />
            <span className="text-[10px] font-mono text-[#86efac] uppercase tracking-widest">Immunization Portal</span>
          </div>
          <h2 className="text-4xl font-display text-white">Vaccination Ledger</h2>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-tight italic">
            Coordinated protection registry (Birth – 18 Months)
          </p>
        </div>

        <div className="flex items-center gap-6">
            <div className="text-right">
                <p className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Protection Level</p>
                <p className="text-3xl font-display text-white">{progressPercent}<span className="text-sm ml-1 opacity-50">%</span></p>
            </div>
            <div className="w-32 h-1 bg-foreground/10 relative overflow-hidden">
                <div 
                    className="absolute top-0 left-0 h-full bg-[#86efac] transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
      </div>

      {/* Legend & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-foreground/[0.02] border border-foreground/10 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#86efac]" />
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Completed</span>
            </div>
            <span className="text-sm font-mono text-white">{completedCount}</span>
        </div>
        <div className="bg-foreground/[0.02] border border-foreground/10 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Overdue/Pending</span>
            </div>
            <span className="text-sm font-mono text-white">{vaccineGroups.flatMap(g => g.vaccines).filter(v => v.status === 'pending').length}</span>
        </div>
        <div className="bg-foreground/[0.02] border border-foreground/10 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Upcoming</span>
            </div>
            <span className="text-sm font-mono text-white">{vaccineGroups.flatMap(g => g.vaccines).filter(v => v.status === 'upcoming').length}</span>
        </div>
      </div>

      {/* Schedule Repository */}
      <div className="space-y-12">
        {vaccineGroups.map((group, groupIdx) => (
            <div key={group.age} className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <h3 className="text-xs font-mono text-white uppercase tracking-[0.2em]">{group.age}</h3>
                    </div>
                    <div className="flex-1 h-px bg-foreground/10" />
                </div>

                <div className="grid gap-3">
                    {group.vaccines.map((vaccine) => (
                        <div 
                            key={vaccine.id}
                            onClick={() => toggleStatus(groupIdx, vaccine.id)}
                            className={`group cursor-pointer border p-5 transition-all flex items-center justify-between ${
                                vaccine.status === 'completed' 
                                ? "bg-[#86efac]/5 border-[#86efac]/20" 
                                : vaccine.status === 'pending'
                                ? "bg-amber-500/[0.03] border-amber-500/20"
                                : "bg-foreground/[0.02] border-foreground/10 hover:border-foreground/30"
                            }`}
                        >
                            <div className="flex items-center gap-5">
                                <div className={`w-10 h-10 border flex items-center justify-center transition-colors ${
                                    vaccine.status === 'completed' 
                                    ? "bg-[#86efac]/10 border-[#86efac]/30" 
                                    : vaccine.status === 'pending'
                                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                                    : "bg-foreground/5 border-foreground/10 text-muted-foreground"
                                }`}>
                                    {vaccine.status === 'completed' ? (
                                        <ShieldCheck className="w-5 h-5 text-[#86efac]" />
                                    ) : (
                                        <Circle className="w-4 h-4 opacity-30" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <p className={`text-lg font-display tracking-tight transition-colors ${
                                        vaccine.status === 'completed' ? "text-white/40 line-through" : "text-white"
                                    }`}>
                                        {vaccine.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-mono uppercase tracking-widest ${
                                            vaccine.status === 'completed' ? "text-[#86efac]" : "text-muted-foreground"
                                        }`}>
                                            {vaccine.status === 'completed' ? "Registry Verified" : `Scheduled: ${group.age}`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {vaccine.status === 'completed' && (
                                    <span className="text-[9px] font-mono text-[#86efac] border border-[#86efac]/30 px-2 py-0.5 bg-[#86efac]/5 uppercase animate-in fade-in slide-in-from-right-2">Completed</span>
                                )}
                                {vaccine.status === 'pending' && (
                                    <div className="flex items-center gap-2 text-amber-500 animate-pulse">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span className="text-[9px] font-mono uppercase tracking-widest">Action Required</span>
                                    </div>
                                )}
                                <div className={`w-6 h-6 border flex items-center justify-center transition-all ${
                                     vaccine.status === 'completed' 
                                     ? "border-[#86efac]/50 bg-[#86efac] text-black" 
                                     : "border-foreground/10 text-muted-foreground group-hover:border-foreground/40"
                                }`}>
                                    {vaccine.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>

      {/* Professional Notice */}
      <div className="mt-20 p-10 border border-foreground/5 bg-foreground/[0.01] flex items-center gap-8">
        <div className="w-14 h-14 border border-foreground/10 flex items-center justify-center bg-foreground/5 shrink-0">
            <Info className="w-6 h-6 text-muted-foreground/60" />
        </div>
        <div className="space-y-2">
            <h4 className="text-[10px] font-mono text-white/70 uppercase tracking-[0.2em]">Clinical Advisory</h4>
            <p className="text-xs text-muted-foreground font-mono leading-relaxed max-w-2xl tracking-tight">
                This ledger is synchronized with official healthcare immunization standards. Always consult with a certified pediatric specialist before modifying your vaccination protocol. Metis AI provides registry monitoring but does not replace professional medical intervention.
            </p>
        </div>
      </div>
    </div>
    </>
  );
}
