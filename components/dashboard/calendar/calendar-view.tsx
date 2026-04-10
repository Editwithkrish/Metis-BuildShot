"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    Syringe,
    Baby,
    Stethoscope,
    Plus,
    Loader2,
    Image as ImageIcon
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddLogModal } from "./add-log-modal";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface BabyEvent {
    id: string;
    activity_name: string;
    date: string;
    category: string;
    status: 'pending' | 'completed';
    notes?: string;
    image_url?: string;
}

export function CalendarView() {
    const supabase = createClient();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDayInfo, setSelectedDayInfo] = useState<{ day: number, events: BabyEvent[] } | null>(null);
    const [events, setEvents] = useState<BabyEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchEvents = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('activity_log')
                .select('*')
                .eq('profile_id', user.id)
                .order('scheduled_date', { ascending: true });

            if (error) throw error;

            // Map database fields to UI component fields
            const mappedEvents = data.map((item: any) => ({
                id: item.id,
                activity_name: item.activity_name,
                date: item.scheduled_date || item.completed_date,
                category: item.category,
                status: item.status,
                notes: item.notes,
                image_url: item.image_url
            }));

            setEvents(mappedEvents);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

    const monthName = currentMonth.toLocaleString('default', { month: 'long' });
    const year = currentMonth.getFullYear();

    const totalDays = daysInMonth(currentMonth.getMonth(), year);
    const startDay = firstDayOfMonth(currentMonth.getMonth(), year);

    const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
    const paddingArray = Array.from({ length: startDay }, (_, i) => null);

    const getEventsForDay = (day: number) => {
        const dateStr = `${year}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.date === dateStr);
    };

    const toggleEventStatus = useCallback(async (eventId: string) => {
        // Optimistically update UI
        setEvents(prev => prev.map(e =>
            e.id === eventId ? { ...e, status: e.status === 'pending' ? 'completed' : 'pending' } : e
        ));

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const targetEvent = events.find(e => e.id === eventId);
            const newStatus = targetEvent?.status === 'pending' ? 'completed' : 'pending';

            const { error } = await supabase
                .from('activity_log')
                .update({
                    status: newStatus,
                    completed_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null
                })
                .eq('id', eventId);

            if (error) throw error;
        } catch (error) {
            console.error("Error updating event status:", error);
            // Revert on error
            fetchEvents();
            toast.error("Failed to update status. Please try again.");
        }
    }, [events, supabase, fetchEvents]);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full font-secondary">
            {/* Left Column: Date Grid */}
            <div className="lg:col-span-8 h-full">
                <Card className="glass border-none shadow-2xl overflow-hidden h-full flex flex-col">
                    <div className="p-6 border-b border-white/20 bg-white/10 flex items-center justify-between shrink-0">
                        <div>
                            <h3 className="text-2xl font-medium text-slate-900/80 font-primary italic">
                                {monthName} <span className="opacity-40">{year}</span>
                            </h3>
                            <p className="text-slate-500 font-medium text-[10px] uppercase tracking-wider mt-1">Leo's Journey Timeline</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handlePrevMonth}
                                className="p-2 hover:bg-white/40 rounded-xl transition-all cursor-pointer text-slate-500 hover:text-slate-900 border border-white/20"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={handleNextMonth}
                                className="p-2 hover:bg-white/40 rounded-xl transition-all cursor-pointer text-slate-500 hover:text-slate-900 border border-white/20"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 flex-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="h-10 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/20 border-r border-b border-slate-200/50">
                                {day}
                            </div>
                        ))}
                        {paddingArray.map((_, i) => (
                            <div key={`pad-${i}`} className="bg-white/5 border-r border-b border-slate-200/50" />
                        ))}
                        {daysArray.map(day => {
                            const dayEvents = getEventsForDay(day);
                            const today = new Date();
                            const isToday = day === today.getDate() &&
                                currentMonth.getMonth() === today.getMonth() &&
                                currentMonth.getFullYear() === today.getFullYear();
                            const isBooked = dayEvents.length > 0;
                            const dayWithImage = dayEvents.find(e => e.image_url);

                            return (
                                <div
                                    key={day}
                                    onClick={() => setSelectedDayInfo({ day, events: dayEvents })}
                                    className={`
                                        p-2 border-r border-b border-slate-200/50 relative transition-all min-h-[100px] group overflow-hidden cursor-pointer
                                        ${isToday ? 'bg-primary/5' : 'bg-white/10'}
                                        ${isBooked ? 'bg-white/20' : ''}
                                        hover:shadow-[inset_0_0_0_2px_rgba(var(--primary),0.1)]
                                    `}
                                >
                                    {/* Image Background */}
                                    {dayWithImage && (
                                        <div className="absolute inset-0 z-0">
                                            <img
                                                src={dayWithImage.image_url}
                                                alt="Day entry"
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                            />
                                            {/* Gradient overlay for text readability */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                                        </div>
                                    )}

                                    {isBooked && !dayWithImage && (
                                        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_15px,#000_15px,#000_16px)]"></div>
                                    )}

                                    <div className="flex justify-between items-start relative z-10">
                                        <span className={`text-xs font-bold transition-colors ${dayWithImage ? 'text-white shadow-sm' : isToday ? 'text-primary' : 'text-slate-500'} ${isToday ? 'bg-primary/10 w-6 h-6 flex items-center justify-center rounded-full' : ''}`}>
                                            {day}
                                        </span>
                                    </div>

                                    <div className="mt-2 space-y-1 relative z-10">
                                        {dayEvents.slice(0, 2).map(event => (
                                            <div key={event.id} className={`
                                                    px-2 py-1 rounded-full text-[9px] font-bold border truncate relative backdrop-blur-[2px]
                                                    ${event.category === 'vaccination' ? 'bg-amber-100/90 text-amber-900 border-amber-200' :
                                                    event.category === 'checkup' ? 'bg-blue-100/90 text-blue-900 border-blue-200' :
                                                        'bg-emerald-100/90 text-emerald-900 border-emerald-200'}
                                                `}>
                                                <span className="relative z-10 leading-none">{event.activity_name}</span>
                                            </div>
                                        ))}
                                        {dayEvents.length > 2 && (
                                            <p className={`text-[8px] font-bold ml-1 w-fit px-1 rounded ${dayWithImage ? 'text-white bg-black/40' : 'text-slate-500 bg-white/60'}`}>+{dayEvents.length - 2} more</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Right Column: Unified Event Logs Card */}
            <div className="lg:col-span-4 h-full min-h-0">
                {isLoading ? (
                    <Card className="glass border-none shadow-xl flex flex-col h-full items-center justify-center">
                        <Loader2 className="animate-spin text-primary" size={32} />
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-4">Syncing Records...</p>
                    </Card>
                ) : (
                    <UnifiedLogsCard
                        events={events}
                        onAddClick={() => setIsAddModalOpen(true)}
                        onToggleStatus={toggleEventStatus}
                    />
                )}
            </div>

            <AddLogModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    fetchEvents();
                }}
            />

            {selectedDayInfo && (
                <DayDetailsModal
                    isOpen={!!selectedDayInfo}
                    onClose={() => setSelectedDayInfo(null)}
                    day={selectedDayInfo.day}
                    month={monthName}
                    year={year}
                    events={selectedDayInfo.events}
                    onToggleStatus={toggleEventStatus}
                />
            )}
        </div>
    );
}

function UnifiedLogsCard({ events, onAddClick, onToggleStatus }: { events: BabyEvent[], onAddClick: () => void, onToggleStatus: (id: string) => void }) {
    const [view, setView] = useState<'upcoming' | 'recent'>('upcoming');

    const filteredEvents = useMemo(() => events.filter((e: BabyEvent) =>
        view === 'upcoming' ? e.status === 'pending' : e.status === 'completed'
    ), [events, view]);

    return (
        <Card className="glass border-none shadow-xl flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-white/20 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-lg text-slate-800 flex items-center gap-2 font-primary">
                        {view === 'upcoming' ? <Clock size={16} className="text-primary" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                        Activity Logs
                    </h3>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-[10px] font-bold text-primary hover:bg-primary/5 cursor-pointer px-3 rounded-xl border border-primary/10"
                        onClick={onAddClick}
                    >
                        <Plus size={14} className="mr-1" /> Add New
                    </Button>
                </div>

                <div className="bg-slate-100/50 p-1 rounded-2xl border border-white/40 flex shadow-inner">
                    <button
                        onClick={() => setView('upcoming')}
                        className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all ${view === 'upcoming' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setView('recent')}
                        className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all ${view === 'recent' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Recent
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar min-h-0 bg-white/10 scroll-smooth">
                {filteredEvents.length > 0 ? (
                    filteredEvents.map(event => (
                        <EventCard
                            key={event.id}
                            event={event}
                            dimmed={view === 'recent'}
                            showCheck={view === 'upcoming'}
                            onToggle={() => onToggleStatus(event.id)}
                        />
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 border border-slate-200">
                            <CalendarIcon size={24} className="text-slate-400" />
                        </div>
                        <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500">No {view} events found</p>
                    </div>
                )}
            </div>
        </Card>
    );
}

const EventCard = React.memo(({ event, dimmed, showCheck, onToggle }: { event: BabyEvent, dimmed?: boolean, showCheck?: boolean, onToggle: () => void }) => {
    const icons: Record<string, React.ReactNode> = {
        vaccination: <Syringe size={14} className="text-amber-500" />,
        checkup: <Stethoscope size={14} className="text-blue-500" />,
        milestone: <Baby size={14} className="text-emerald-500" />,
        manual: <Plus size={14} className="text-slate-500" />
    };

    return (
        <div className={`p-4 rounded-2xl border border-white/40 bg-white transition-opacity duration-300 group cursor-pointer relative overflow-hidden shadow-sm ${dimmed ? 'opacity-60 grayscale-[0.4]' : 'hover:shadow-md'}`}>
            <div className="flex items-center gap-3 relative z-10">
                {showCheck && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle();
                        }}
                        className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center text-transparent hover:text-emerald-500 hover:border-emerald-500 transition-all cursor-pointer bg-white shrink-0"
                        title="Mark as done"
                    >
                        <CheckCircle2 size={12} className="group-hover:text-emerald-500" />
                    </button>
                )}

                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${dimmed ? 'bg-slate-100' : 'bg-slate-50 border border-slate-100'}`}>
                    {event.image_url ? (
                        <img src={event.image_url} alt="" className="w-full h-full object-cover transform transition-transform group-hover:scale-110" loading="lazy" />
                    ) : (
                        icons[event.category] || icons.manual
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-xs truncate">{event.activity_name}</h4>
                    <p className="text-slate-400 text-[10px] mt-0.5 font-bold uppercase tracking-tight">{event.date}</p>
                </div>
            </div>

            {event.notes && (
                <div className="mt-2.5 relative z-10 ml-9">
                    <p className="text-[10px] text-slate-400 line-clamp-1 leading-relaxed italic border-l-2 border-slate-100 pl-3">
                        "{event.notes}"
                    </p>
                </div>
            )}
        </div>
    );
});

const DayDetailsModal = ({
    isOpen,
    onClose,
    day,
    month,
    year,
    events,
    onToggleStatus
}: {
    isOpen: boolean,
    onClose: () => void,
    day: number,
    month: string,
    year: number,
    events: BabyEvent[],
    onToggleStatus: (id: string) => void
}) => {
    const dayWithImage = events.find(e => e.image_url);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-full md:max-w-[1000px] w-[calc(100%-2rem)] p-0 overflow-hidden border-none bg-white rounded-[32px] shadow-2xl font-secondary">
                <VisuallyHidden>
                    <DialogTitle>Details for {month} {day}, {year}</DialogTitle>
                    <DialogDescription>View activities and memories for this specific date.</DialogDescription>
                </VisuallyHidden>
                <div className="flex flex-col md:flex-row md:h-[600px]">
                    {/* Left: Day Media (Image or Date Display) */}
                    <div className="w-full md:w-[38%] relative bg-slate-900 overflow-hidden min-h-[300px] md:min-h-0">
                        {dayWithImage ? (
                            <>
                                <img
                                    src={dayWithImage.image_url}
                                    alt={`Memories from ${month} ${day}`}
                                    className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            </>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                                <div className="text-center">
                                    <CalendarIcon size={64} className="text-slate-100 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No photos captured</p>
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-12 left-12 z-10">
                            <h2 className="text-8xl font-normal text-white font-primary italic leading-none drop-shadow-2xl">{day}</h2>
                            <p className="text-white/60 text-xl font-medium tracking-tight mt-4 uppercase tracking-[0.1em]">{month} {year}</p>
                        </div>
                    </div>

                    {/* Right: Day Activities */}
                    <div className="flex-1 p-8 md:p-14 flex flex-col bg-white">
                        <div className="flex items-center justify-between mb-10">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-normal text-slate-900 font-primary">Day Activities</h3>
                                <p className="text-slate-400 text-xs font-medium">Tracking Leo's growth and milestones.</p>
                            </div>
                            <Badge variant="outline" className="rounded-full border-slate-100 bg-slate-50/50 px-4 py-1.5 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                                {events.length} {events.length === 1 ? 'Entry' : 'Entries'}
                            </Badge>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar min-h-0">
                            {events.length > 0 ? (
                                events.map(event => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        dimmed={event.status === 'completed'}
                                        showCheck={event.status === 'pending'}
                                        onToggle={() => onToggleStatus(event.id)}
                                    />
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                        <Plus className="text-slate-300" size={24} />
                                    </div>
                                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">No activities recorded</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-100">
                            <Button
                                onClick={onClose}
                                className="w-full h-14 rounded-2xl bg-slate-950 text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl hover:translate-y-[-2px]"
                            >
                                Back to Calendar
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
