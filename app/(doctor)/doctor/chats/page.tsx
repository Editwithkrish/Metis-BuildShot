"use client";

import React from "react";
import { DoctorHeader } from "@/components/doctor/header";
import { MessageSquare, Search, Send, Paperclip, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function ChatsPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] gap-4">
            <DoctorHeader title="Clinical Messaging" subtitle="Secure HIPAA-compliant mother communication" />

            <div className="flex-1 min-h-0 flex gap-6">
                {/* Conversations List */}
                <div className="w-80 flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            className="w-full h-11 bg-white border border-slate-100 rounded-2xl pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <div key={i} className={`p-4 rounded-[24px] cursor-pointer transition-all border ${i === 0 ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-white/40 border-transparent hover:bg-white hover:shadow-md'}`}>
                                <div className="flex gap-4">
                                    <Avatar className="h-10 w-10 rounded-xl shadow-sm ring-2 ring-white">
                                        <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                                        <AvatarFallback>M</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h4 className="font-bold text-slate-800 text-sm truncate">Sarah Wilson</h4>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">12:42 PM</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1">Leo (6m)</p>
                                        <p className="text-[11px] text-slate-400 truncate font-medium italic">"Is it normal to have a small rash after the DPT dose?"</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Window Container */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex-1 glass border-none shadow-xl rounded-[40px] flex flex-col overflow-hidden">
                        {/* Chat Header */}
                        <div className="p-6 border-b border-white flex justify-between items-center bg-white/20">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 rounded-2xl ring-4 ring-white shadow-lg">
                                    <AvatarImage src="https://i.pravatar.cc/150?u=0" />
                                    <AvatarFallback>S</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-black text-slate-800 text-lg leading-none mb-1">Sarah Wilson</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-slate-100 hover:text-primary transition-all">
                                    <Phone size={18} />
                                </Button>
                                <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-slate-100 hover:text-indigo-600 transition-all">
                                    <Video size={18} />
                                </Button>
                                <Button className="h-11 px-6 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest ml-2 transition-all shadow-lg shadow-primary/20">
                                    View Records
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar bg-slate-50/30">
                            <div className="flex justify-center">
                                <span className="px-4 py-1.5 rounded-full bg-slate-100/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">Today</span>
                            </div>
                            <div className="flex gap-4">
                                <Avatar className="h-8 w-8 rounded-lg outline outline-2 outline-white">
                                    <AvatarImage src="https://i.pravatar.cc/150?u=0" />
                                    <AvatarFallback>S</AvatarFallback>
                                </Avatar>
                                <div className="max-w-[70%] p-5 rounded-[24px] rounded-tl-none bg-white border border-slate-100 shadow-sm">
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                        Dr. Miller, Leo has a small red rash on his leg where he got the shot this morning. Should I be worried?
                                    </p>
                                    <span className="text-[9px] font-bold text-slate-400 mt-3 block uppercase">12:40 PM</span>
                                </div>
                            </div>
                            <div className="flex gap-4 flex-row-reverse">
                                <div className="max-w-[70%] p-5 rounded-[32px] rounded-tr-none bg-[#5C7CFA] text-white shadow-2xl shadow-blue-500/40 border border-blue-400/20">
                                    <p className="text-[15px] font-bold leading-relaxed">
                                        It&apos;s quite common to see some redness or a small bump at the injection site. Is he having any fever or excessive crying?
                                    </p>
                                    <div className="flex items-center justify-end gap-2 mt-3 opacity-90">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-50">SENT · 12:42 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-white bg-white/40">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Type clinical advice..."
                                    className="w-full h-14 bg-white border border-slate-100 rounded-3xl pl-6 pr-32 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <button className="h-10 w-10 text-slate-400 hover:text-primary transition-colors flex items-center justify-center">
                                        <Paperclip size={20} />
                                    </button>
                                    <Button className="h-10 w-10 p-0 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                                        <Send size={18} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
