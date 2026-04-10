import { DashboardHeader } from "@/components/dashboard/header";
import { CalendarView } from "@/components/dashboard/calendar/calendar-view";

export default function CalendarPage() {
    return (
        <div className="flex flex-col gap-8 h-[calc(100vh-120px)]">
            <DashboardHeader
                title="Growth & Logs"
                subtitle="Tracking Leo's health and milestones"
            />

            <div className="flex-1 min-h-0">
                <CalendarView />
            </div>
        </div>
    );
}
