"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, Stethoscope, Calendar, Scale, Ruler, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { usePatient } from "@/lib/context/patient-context";

interface EnrollPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnrollPatientModal({ isOpen, onClose }: EnrollPatientModalProps) {
  const { refreshPatients, setActivePatient, userRole } = usePatient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    weight: "",
    height: "",
    relationshipType: userRole === 'mother' ? 'child' : 'patient'
  });

  // Required for createPortal — ensures we are on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.gender) {
      toast.error("Name and Gender are required.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      const { data, error } = await supabase
        .from('patients')
        .insert({
          owner_id: user.id,
          full_name: formData.name,
          dob: formData.dob || null,
          gender: formData.gender,
          initial_weight: formData.weight,
          initial_height: formData.height,
          relationship_type: formData.relationshipType
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`${userRole === 'mother' ? 'Baby' : 'Patient'} enrolled successfully!`);
      await refreshPatients();
      if (data) setActivePatient(data);
      onClose();
      setFormData({
        name: "",
        dob: "",
        gender: "",
        weight: "",
        height: "",
        relationshipType: userRole === 'mother' ? 'child' : 'patient'
      });
    } catch (error: any) {
      console.error("Enrollment error:", error.message);
      toast.error("Failed to enroll patient.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const isMother = userRole === 'mother';

  // Rendered via portal — bypasses ALL parent stacking contexts
  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      {/* Full-page backdrop — covers 100% of screen */}
      <div
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Modal card */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '480px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}>
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Patient Registry</p>
            <h3 className="text-xl font-display text-white">
              Enroll {isMother ? "Baby" : "Patient"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white/5 hover:text-[#86efac] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="enroll-form" onSubmit={handleSubmit} className="space-y-6">

            {!isMother && (
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Relationship Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'patient', label: 'Patient', icon: Stethoscope },
                    { id: 'self', label: 'Self', icon: User },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({...formData, relationshipType: item.id})}
                      className={`flex items-center gap-3 px-4 py-3 border text-left transition-all ${
                        formData.relationshipType === item.id
                          ? "border-[#86efac] bg-[#86efac]/5 text-white"
                          : "border-white/5 text-muted-foreground hover:border-white/20"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${formData.relationshipType === item.id ? "text-[#86efac]" : ""}`} />
                      <span className="text-[11px] font-mono uppercase">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                {isMother ? "Baby's Full Name" : "Full Name"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86efac]/40" />
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/10 pl-10 pr-4 py-3 text-white focus:border-[#86efac]/50 focus:outline-none transition-colors font-mono text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86efac]/40 pointer-events-none" />
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 pl-10 pr-4 py-3 text-white focus:border-[#86efac]/50 focus:outline-none transition-colors font-mono text-sm [color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Gender</label>
                <div className="grid grid-cols-2 gap-2" style={{ height: '50px' }}>
                  {['Male', 'Female'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({...formData, gender: g})}
                      className={`flex items-center justify-center border text-[11px] font-mono transition-all h-full ${
                        formData.gender === g
                          ? "border-[#86efac] text-[#86efac] bg-[#86efac]/5"
                          : "border-white/10 text-muted-foreground hover:border-white/30"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Weight (kg)</label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86efac]/40" />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 pl-10 pr-4 py-3 text-white focus:border-[#86efac]/50 focus:outline-none transition-colors font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Height (cm)</label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86efac]/40" />
                  <input
                    type="number"
                    step="0.5"
                    placeholder="0"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 pl-10 pr-4 py-3 text-white focus:border-[#86efac]/50 focus:outline-none transition-colors font-mono text-sm"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 shrink-0">
          <button
            type="submit"
            form="enroll-form"
            disabled={isSubmitting}
            className="w-full h-14 bg-[#86efac] hover:bg-[#86efac]/90 text-black font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Confirm Enrollment
              </>
            )}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
