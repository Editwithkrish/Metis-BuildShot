"use client";

import React from "react";
import { DoctorHeader } from "@/components/doctor/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Bell, Shield, Globe, Clock, CreditCard, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
    return (
        <>
            <DoctorHeader title="Portal Settings" subtitle="Preferences and account security" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8 font-secondary">
                {/* Left Column: Account Profile */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="glass border-none shadow-xl overflow-hidden relative">
                        <div className="h-32 bg-primary/10 w-full" />
                        <CardContent className="px-8 pb-8 -mt-12 text-center">
                            <Avatar className="h-28 w-28 rounded-[40px] ring-8 ring-white shadow-2xl mx-auto mb-4 border border-slate-100">
                                <AvatarImage src="https://i.pravatar.cc/150?u=doc" />
                                <AvatarFallback>DR</AvatarFallback>
                            </Avatar>
                            <h3 className="text-2xl font-black text-slate-800 leading-none mb-2">Dr. Emily Miller</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Senior Pediatrician</p>
                            <Button className="w-full rounded-2xl bg-primary text-white font-bold text-xs h-12 shadow-lg shadow-primary/20">
                                Edit Clinical Profile
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="glass border-none shadow-lg">
                        <CardContent className="p-4 space-y-1">
                            <SettingNavItem icon={<User />} label="Profile Info" active />
                            <SettingNavItem icon={<Bell />} label="Triage Alerts" />
                            <SettingNavItem icon={<Shield />} label="Data & Security" />
                            <SettingNavItem icon={<Clock />} label="Clinic Hours" />
                            <SettingNavItem icon={<Globe />} label="Network Status" />
                            <SettingNavItem icon={<CreditCard />} label="Membership" />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Active Setting Panel */}
                <div className="lg:col-span-8">
                    <Card className="glass border-none shadow-xl min-h-[600px]">
                        <CardHeader className="p-8 border-b border-white">
                            <CardTitle className="text-2xl font-normal text-slate-800 font-primary italic">Clinic Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-10">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Availability</h4>
                                <div className="space-y-4">
                                    <ToggleSetting label="Enable SOS High-Priority Alerts" desc="Allow live emergency notifications from local clusters" defaultChecked />
                                    <ToggleSetting label="Auto-Sync EHR Records" desc="Automatically pull latest logs when a mother opens the app" defaultChecked />
                                    <ToggleSetting label="Virtual Consultations" desc="Enable the telemedicine link button for mothers" />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Notification Volume</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-6 rounded-[32px] bg-slate-50 border border-slate-100">
                                        <div>
                                            <p className="font-bold text-slate-800">Alert Confidence Threshold</p>
                                            <p className="text-xs text-slate-500 font-medium">Only notify for AI risks above 85% confidence</p>
                                        </div>
                                        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100">
                                            <span className="text-xs font-black text-primary px-3">85%</span>
                                            <ChevronRight size={16} className="text-slate-200" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function SettingNavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <div className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}>
            <span className={active ? 'text-white' : 'text-slate-400'}>{React.cloneElement(icon as React.ReactElement<{ size: number }>, { size: 18 })}</span>
            <span className="text-sm font-bold truncate">{label}</span>
        </div>
    );
}

function ToggleSetting({ label, desc, defaultChecked = false }: { label: string, desc: string, defaultChecked?: boolean }) {
    return (
        <div className="flex items-center justify-between p-6 rounded-[32px] bg-white border border-slate-100 hover:shadow-md transition-all">
            <div className="max-w-[80%]">
                <p className="font-bold text-slate-800 text-sm">{label}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">{desc}</p>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${defaultChecked ? 'bg-primary' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${defaultChecked ? 'translate-x-6' : ''}`} />
            </div>
        </div>
    );
}
