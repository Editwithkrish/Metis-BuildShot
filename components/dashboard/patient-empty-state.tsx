"use client";

import React, { useState } from "react";
import { UserX, PlusCircle } from "lucide-react";
import { EnrollPatientModal } from "./enroll-patient-modal";

interface PatientEmptyStateProps {
  title?: string;
  description?: string;
}

export function PatientEmptyState({ 
  title = "No Patient Selected", 
  description = "Enroll or select a patient to get started."
}: PatientEmptyStateProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
      <EnrollPatientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <UserX className="w-10 h-10 text-foreground/20 mb-6" />

      <h2 className="text-xl font-display text-white mb-2">{title}</h2>
      <p className="text-muted-foreground text-sm max-w-xs mb-8 leading-relaxed">
        {description}
      </p>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-6 py-3 border border-foreground/10 hover:border-[#86efac]/40 hover:bg-[#86efac]/5 transition-all text-[11px] font-mono uppercase tracking-widest text-white"
      >
        <PlusCircle className="w-3.5 h-3.5 text-[#86efac]" />
        Enroll Patient
      </button>
    </div>
  );
}
