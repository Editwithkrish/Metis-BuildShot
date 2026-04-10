"use client";

import React, { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Orb } from "@/components/ui/orb";
import { ImagePlus, Calendar as CalendarIcon, Send, Loader2, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface AddLogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddLogModal({ isOpen, onClose }: AddLogModalProps) {
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<'pending' | 'completed'>('completed');
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const [formData, setFormData] = useState({
        activityName: "",
        date: new Date().toISOString().split('T')[0],
        notes: "",
        imageUrl: "",
        cloudinaryPublicId: ""
    });

    const handleStatusChange = (newStatus: 'pending' | 'completed') => {
        setStatus(newStatus);
        if (newStatus === 'completed') {
            setFormData(prev => ({
                ...prev,
                date: new Date().toISOString().split('T')[0]
            }));
        } else {
            setFormData(prev => ({ ...prev, date: "" }));
        }
    };

    const toggleVoice = () => {
        const nextState = !isVoiceEnabled;
        setIsVoiceEnabled(nextState);
        setIsListening(nextState);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

            if (!cloudName || !uploadPreset || cloudName === "your_cloud_name" || uploadPreset === "your_upload_preset") {
                throw new Error("Cloudinary configuration missing. Please update your .env.local with a valid Cloud Name and an UNSIGNED Upload Preset.");
            }

            const uploadData = new FormData();
            uploadData.append("file", file);
            uploadData.append("upload_preset", uploadPreset);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                { method: "POST", body: uploadData }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error("Cloudinary Error:", data);
                throw new Error(data.error?.message || "Cloudinary upload failed");
            }

            if (data.secure_url) {
                setFormData(prev => ({
                    ...prev,
                    imageUrl: data.secure_url,
                    cloudinaryPublicId: data.public_id
                }));
                toast.success("Image uploaded successfully");
            }
        } catch (error: any) {
            console.error("Upload process error:", error);
            toast.error(error.message || "Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.activityName || !formData.date) {
            toast.error("Activity name and date are required");
            return;
        }

        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { error } = await supabase
                .from('activity_log')
                .insert({
                    profile_id: user.id,
                    activity_name: formData.activityName,
                    category: 'manual',
                    status: status,
                    scheduled_date: status === 'pending' ? formData.date : null,
                    completed_date: status === 'completed' ? formData.date : null,
                    notes: formData.notes,
                    image_url: formData.imageUrl,
                    cloudinary_public_id: formData.cloudinaryPublicId
                });

            if (error) {
                console.error("Supabase Error:", error);
                throw new Error(error.message || "Failed to save activity to database");
            }

            toast.success("Activity logged successfully!");
            onClose();
            // Reset form
            setFormData({
                activityName: "",
                date: new Date().toISOString().split('T')[0],
                notes: "",
                imageUrl: "",
                cloudinaryPublicId: ""
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to log activity");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton
                className="max-w-full md:max-w-[1000px] w-[calc(100%-2rem)] p-0 overflow-hidden border-none bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] rounded-[32px] font-secondary"
            >
                <div className="flex flex-col md:flex-row min-h-[500px] md:h-[650px] relative">

                    {/* Left Section: Voice Interaction */}
                    <div
                        onClick={toggleVoice}
                        className="w-full md:w-[38%] relative flex flex-col items-center justify-between p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/40 transition-all duration-500 group overflow-hidden cursor-pointer hover:bg-slate-100/80"
                    >
                        <div className="space-y-3 text-center w-full relative z-10 transition-all duration-500">
                            <h3 className="text-4xl font-normal text-slate-900 tracking-tight leading-tight font-primary">Talk to Hestia</h3>
                            <p className="text-slate-500 text-xs leading-relaxed max-w-[240px] mx-auto italic font-medium opacity-80">
                                {isVoiceEnabled ? '"Add a growth milestone: Leo started crawling today"' : "Click to wake up Hestia and start speaking"}
                            </p>
                        </div>

                        {/* Orb Container to match Onboarding Modal appearance */}
                        <div className="flex-1 flex items-center justify-center w-full my-6 md:my-0">
                            <div className="relative group">
                                <div className="aspect-square w-[180px] lg:w-[220px] relative transition-transform duration-700 hover:scale-105">
                                    <Orb
                                        agentState={isListening ? "listening" : "thinking"}
                                        colors={["#1e40af", "#60a5fa"]}
                                        className="w-full h-full"
                                        disabled={!isVoiceEnabled}
                                    />
                                </div>

                                {/* Floating Hover Label */}
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
                                    <div className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border border-white/10">
                                        Tap to {isVoiceEnabled ? "disable" : "enable"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-16 flex flex-col items-center justify-center gap-2">
                            <p className={`text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-500 ${isVoiceEnabled ? 'text-primary/60 animate-pulse' : 'text-slate-400'}`}>
                                {isVoiceEnabled ? "Hestia is listening..." : "Tap to speak"}
                            </p>
                            {!isVoiceEnabled && (
                                <div className="h-[1px] w-8 bg-slate-200" />
                            )}
                        </div>
                    </div>

                    {/* Right Section: Form Experience */}
                    <div className="flex-1 bg-white p-8 md:p-14 no-scrollbar relative flex flex-col justify-center">
                        <div className="max-w-[500px] mx-auto w-full">
                            <DialogHeader className="mb-8 text-left">
                                <DialogTitle className="text-4xl font-normal text-slate-900 tracking-tight leading-tight font-primary">Activity Log</DialogTitle>
                                <DialogDescription className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mt-1 opacity-60">Capture a new milestone or health record</DialogDescription>
                            </DialogHeader>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="space-y-6">
                                    {/* Activity Name - Full Width */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Activity Name</Label>
                                        <Input
                                            placeholder="What happened? (e.g., First Steps, Vaccination)"
                                            value={formData.activityName}
                                            onChange={(e) => setFormData(p => ({ ...p, activityName: e.target.value }))}
                                            className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl text-base text-slate-900 placeholder:text-slate-400 focus:bg-white transition-all px-5 shadow-none border-2 focus:border-primary/20"
                                        />
                                    </div>

                                    {/* Status & Date - Two Columns */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Status</Label>
                                            <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100 h-14 items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange('pending')}
                                                    className={`flex-1 flex items-center justify-center h-full rounded-xl text-[11px] font-bold transition-all ${status === 'pending' ? 'bg-white text-slate-900 shadow-md border border-slate-100/50' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    Upcoming
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange('completed')}
                                                    className={`flex-1 flex items-center justify-center h-full rounded-xl text-[11px] font-bold transition-all ${status === 'completed' ? 'bg-white text-slate-900 shadow-md border border-slate-100/50' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    Done
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Date</Label>
                                            <div className="relative group h-14">
                                                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" size={18} />
                                                <Input
                                                    type="date"
                                                    required
                                                    value={formData.date}
                                                    onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                                                    className="h-full bg-slate-50/50 border-slate-200 rounded-2xl pl-12 pr-4 text-sm text-slate-900 transition-all border-2 focus:border-primary/20 [color-scheme:light]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image & Notes - Integrated */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Photo</Label>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="group relative h-[120px] rounded-2xl bg-slate-50/80 border-2 border-dashed border-slate-200 hover:border-primary/40 hover:bg-slate-100/50 transition-all duration-500 flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden shadow-inner"
                                            >
                                                {isUploading ? (
                                                    <Loader2 className="animate-spin text-primary" size={24} />
                                                ) : formData.imageUrl ? (
                                                    <div className="relative w-full h-full">
                                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            <X className="text-white" size={20} onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFormData(p => ({ ...p, imageUrl: "", cloudinaryPublicId: "" }));
                                                            }} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <ImagePlus size={24} className="text-slate-300 group-hover:text-primary transition-all" />
                                                        <span className="text-[10px] text-slate-400 group-hover:text-slate-600 font-bold uppercase tracking-[0.1em]">Attach Image</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Notes (Optional)</Label>
                                            <Textarea
                                                placeholder="Add details about this moment..."
                                                value={formData.notes}
                                                onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                                                className="bg-slate-50/50 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 min-h-[120px] focus:bg-white resize-none px-5 py-4 text-sm leading-relaxed transition-all border-2 focus:border-primary/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        disabled={isLoading || isUploading}
                                        className="h-14 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-900 font-bold text-xs uppercase tracking-[0.3em] transition-all hover:translate-y-[-1px] active:translate-y-[1px] shadow-xl shadow-slate-200 flex items-center justify-center gap-3 border-none"
                                    >
                                        {isLoading ? "Saving..." : <><span className="flex items-center gap-2 font-primary text-sm normal-case tracking-normal italic">Save to Timeline <Send size={18} /></span></>}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
