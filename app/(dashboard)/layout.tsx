import React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingWrapper } from "../../components/dashboard/onboarding-wrapper";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/onboarding");
    }

    // Check if profile exists
    const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

    const showOnboarding = !profile?.onboarding_completed;

    return (
        <div className="h-screen metis-gradient flex text-slate-800 font-secondary relative overflow-hidden">
            <OnboardingWrapper initiallyOpen={showOnboarding} />
            {/* Sidebar Container */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 ml-20 md:ml-24 relative h-screen overflow-y-auto overflow-x-hidden custom-scrollbar">
                {/* Decorative Blobs - Optimized for performance */}
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
