import React from "react";
import { DoctorSidebar } from "@/components/doctor/sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DoctorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // In a real app, we would also check if the user has a 'doctor' role
    if (!user) {
        redirect("/onboarding");
    }

    return (
        <div className="h-screen metis-gradient flex text-slate-800 font-secondary relative overflow-hidden">
            {/* Sidebar Container */}
            <DoctorSidebar />

            {/* Main Content Area */}
            <div className="flex-1 ml-20 md:ml-24 relative h-screen overflow-y-auto overflow-x-hidden custom-scrollbar">
                {/* Decorative Blobs */}
                <div className="fixed top-[-5%] left-[-5%] w-[50%] h-[50%] bg-[#BBDDFF]/20 rounded-full blur-[80px] pointer-events-none z-0" />
                <div className="fixed bottom-[-5%] right-[-5%] w-[60%] h-[60%] bg-[#A5C8FF]/30 rounded-full blur-[100px] pointer-events-none z-0" />
                <div className="fixed top-[25%] right-[10%] w-[30%] h-[30%] bg-[#DCE6FF]/20 rounded-full blur-[80px] pointer-events-none z-0" />
                <div className="fixed bottom-[20%] left-[10%] w-[30%] h-[30%] bg-[#D0E1FF]/20 rounded-full blur-[80px] pointer-events-none z-0" />

                <main className="flex flex-col p-4 md:p-8 gap-8 relative z-10 min-h-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
