"use client";

import React from "react";
import { DoctorHeader } from "@/components/doctor/header";
import { DoctorCalendarView } from "@/components/doctor/calendar/doctor-calendar-view";

export default function AppointmentsPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-64px)]">
            <DoctorHeader
                title="Clinical Schedule"
                subtitle="Manage your patient consultations and follow-ups"
            />

            <div className="flex-1 min-h-0">
                <DoctorCalendarView />
            </div>
        </div>
    );
}
