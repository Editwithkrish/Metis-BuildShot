"use client";

import React, { useState } from "react";
import { usePatient } from "@/lib/context/patient-context";
import { 
  Users, 
  ChevronDown, 
  Check, 
  PlusCircle, 
  Baby, 
  User, 
  Stethoscope,
  Search
} from "lucide-react";
import { EnrollPatientModal } from "./enroll-patient-modal";

export function PatientSwitcher() {
  const { activePatient, patients, setActivePatient, isLoading, userRole } = usePatient();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // Helper to get role-specific labels
  const getSubjectLabel = () => userRole === 'mother' ? "Baby" : "Patient";
  const getEnrollLabel = () => userRole === 'mother' ? "Enroll New Baby" : "Enroll New Patient";

  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return (
    <div className="h-10 w-48 bg-foreground/5 animate-pulse border border-foreground/10" />
  );

  return (
    <div className="relative">
      <EnrollPatientModal 
        isOpen={isEnrollModalOpen} 
        onClose={() => setIsEnrollModalOpen(false)} 
      />
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 border border-foreground/10 hover:border-[#86efac]/30 hover:bg-[#86efac]/5 transition-all text-sm font-display group"
      >
        <div className="w-6 h-6 border border-foreground/10 flex items-center justify-center bg-foreground/5 group-hover:bg-[#86efac]/10 group-hover:text-[#86efac] transition-colors">
          {activePatient?.relationship_type === 'self' ? <User className="w-3.5 h-3.5" /> : 
           activePatient?.relationship_type === 'child' ? <Baby className="w-3.5 h-3.5" /> : 
           <Stethoscope className="w-3.5 h-3.5" />}
        </div>
        <div className="text-left hidden md:block">
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter leading-none mb-0.5">Active {getSubjectLabel()}</p>
            <p className="text-xs font-display text-white">{activePatient?.full_name || "No Subject Selected"}</p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 ml-2 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-foreground/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-3 border-b border-foreground/10">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <input 
                        type="text" 
                        placeholder="Search profiles..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-foreground/5 border border-foreground/10 py-1.5 pl-7 pr-3 text-[10px] font-mono focus:outline-none focus:border-[#86efac]/50"
                    />
                </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {filteredPatients.length === 0 && (
                <p className="text-[10px] font-mono text-muted-foreground text-center py-6 opacity-50 px-4">
                  {patients.length === 0 ? "No patients enrolled yet." : "No results found."}
                </p>
              )}
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => {
                    setActivePatient(patient);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-foreground/5 transition-colors ${
                    activePatient?.id === patient.id ? "bg-[#86efac]/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 border flex items-center justify-center ${
                         activePatient?.id === patient.id ? "bg-[#86efac]/10 border-[#86efac]/30" : "bg-foreground/5 border-foreground/10"
                    }`}>
                         {patient.relationship_type === 'self' ? <User className="w-4 h-4 text-muted-foreground" /> : 
                          patient.relationship_type === 'child' ? <Baby className="w-4 h-4 text-[#86efac]" /> : 
                          <Stethoscope className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div className="text-left">
                      <p className={`text-xs font-display ${activePatient?.id === patient.id ? "text-[#86efac]" : "text-white"}`}>
                        {patient.full_name}
                      </p>
                      <p className="text-[9px] text-muted-foreground font-mono uppercase">
                        {patient.relationship_type === 'child' && userRole === 'mother' ? "Baby" : (patient.relationship_type || "Subject")}
                      </p>
                    </div>
                  </div>
                  {activePatient?.id === patient.id && (
                    <Check className="w-3.5 h-3.5 text-[#86efac]" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-2 border-t border-foreground/10">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setIsEnrollModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-[#86efac] hover:bg-[#86efac]/5 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {getEnrollLabel()}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
