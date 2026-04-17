"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Patient {
  id: string;
  full_name: string;
  dob: string;
  gender: string;
  initial_weight: string;
  initial_height: string;
  relationship_type: string;
}

interface PatientContextType {
  activePatient: Patient | null;
  patients: Patient[];
  setActivePatient: (patient: Patient) => void;
  refreshPatients: () => Promise<void>;
  isLoading: boolean;
  userRole: string | null;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatientState] = useState<Patient | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const refreshPatients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [patientsRes, profileRes] = await Promise.all([
        supabase
          .from("patients")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
      ]);

      if (patientsRes.error) throw patientsRes.error;
      if (profileRes.data) setUserRole(profileRes.data.role);
      
      const data = patientsRes.data;
      setPatients(data || []);
      
      // Auto-select patient from localStorage or default to first one
      const savedId = localStorage.getItem("metis_active_patient_id");
      const savedPatient = data?.find((p: Patient) => p.id === savedId);
      
      if (savedPatient) {
        setActivePatientState(savedPatient);
      } else if (data && data.length > 0) {
        setActivePatientState(data[0]);
        localStorage.setItem("metis_active_patient_id", data[0].id);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const setActivePatient = (patient: Patient) => {
    setActivePatientState(patient);
    localStorage.setItem("metis_active_patient_id", patient.id);
  };

  useEffect(() => {
    refreshPatients();
  }, []);

  return (
    <PatientContext.Provider value={{ activePatient, patients, setActivePatient, refreshPatients, isLoading, userRole }}>
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
