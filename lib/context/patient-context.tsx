"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { localRequest } from "@/lib/local/request";
import { type Patient, type Profile } from "@/lib/local/records";

interface PatientContextType {
  activePatient: Patient | null;
  patients: Patient[];
  setActivePatient: (patient: Patient) => void;
  refreshPatients: () => Promise<void>;
  isLoading: boolean;
  profile: Profile | null;
  userRole: string | null;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatientState] = useState<Patient | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshPatients = useCallback(async () => {
    try {
      const data = await localRequest<{ patients: Patient[]; profile: Profile | null }>("/api/patients");
      setProfile(data.profile);
      setPatients(data.patients);

      const savedId = localStorage.getItem("metis_active_patient_id");
      const selected = data.patients.find((patient) => patient.id === savedId) ?? data.patients[0] ?? null;
      setActivePatientState(selected);
      if (selected) localStorage.setItem("metis_active_patient_id", selected.id);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setActivePatient = (patient: Patient) => {
    setActivePatientState(patient);
    localStorage.setItem("metis_active_patient_id", patient.id);
  };

  useEffect(() => {
    refreshPatients();
  }, [refreshPatients]);

  return (
    <PatientContext.Provider value={{ activePatient, patients, setActivePatient, refreshPatients, isLoading, profile, userRole: profile?.role ?? null }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error("usePatient must be used within a PatientProvider");
  }
  return context;
}
