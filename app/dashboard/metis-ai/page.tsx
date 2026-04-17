"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Paperclip, 
  Mic, 
  MoreHorizontal,
  ChevronRight,
  Loader2,
  BrainCircuit,
  Database,
  ShieldCheck,
  Languages,
  PlusCircle,
  History
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { usePatient } from "@/lib/context/patient-context";
import { useLanguage } from "@/lib/i18n-context";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
}

export default function MetisAIPage() {
  const supabase = createClient();
  const { activePatient } = usePatient();
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>(crypto.randomUUID());
  const [historySessions, setHistorySessions] = useState<{id: string, title: string}[]>([]);
  const [userRole, setUserRole] = useState<string>("individual");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const data = localStorage.getItem("metis_onboarding_data");
    if (data) {
      const parsed = JSON.parse(data);
      setUserRole(parsed.role || "individual");
    }
    fetchHistory();
  }, [activePatient]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_messages")
        .select("session_id, content, created_at")
        .eq("profile_id", user.id)
        .eq("role", "user")
        .order("created_at", { ascending: false });

      if (error && error.code !== 'PGRST205') throw error;

      const sessionsMap = new Map();
      (data || []).forEach((msg: any) => {
        if (msg.session_id && !sessionsMap.has(msg.session_id)) {
          sessionsMap.set(msg.session_id, {
            id: msg.session_id,
            title: msg.content.substring(0, 40) + (msg.content.length > 40 ? "..." : "")
          });
        }
      });
      setHistorySessions(Array.from(sessionsMap.values()));
    } catch (err: any) {
      console.error("History fetch error:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const loadSession = async (sid: string) => {
    setIsLoading(true);
    setSessionId(sid);
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sid)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      toast.error("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(crypto.randomUUID());
    setInput("");
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/metis-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })),
          patientId: activePatient?.id,
          language: language,
          sessionId: sessionId
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content
      };
      setMessages(prev => [...prev, aiMsg]);
      fetchHistory();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const isInitialState = messages.length === 0 && !isLoading;

  const getRolePrompts = () => {
    switch(userRole) {
      case 'mother':
        return [
          { label: "ANALYSIS", text: "Analyze my baby's growth trends", prompt: "How is the baby's growth looking based on recent logs?" },
          { label: "SCHEDULE", text: "Check pending vaccinations", prompt: "What vaccinations are due for my baby?" },
          { label: "LOGGING", text: "Log 200ml milk for the baby", prompt: "Log 200ml milk for the active patient" }
        ];
      case 'doc':
        return [
          { label: "CLINICAL", text: "Patient health summary", prompt: "Give me a clinical summary for the current active patient." },
          { label: "NUTRITION", text: "Log caloric intake", prompt: "Log nutrition: 500kcal balanced meal for current patient." },
          { label: "ALERTS", text: "Check growth alerts", prompt: "Are there any abnormal growth patterns detected in the logs?" }
        ];
      default:
        return [
          { label: "NUTRITION", text: "Check my nutrition logs", prompt: "Show me my recent nutrition log summary." },
          { label: "GROWTH", text: "Analyze my BMI/Growth", prompt: "How is my growth trend recently?" },
          { label: "TASKS", text: "What can you do?", prompt: "List all clinical and logging tasks you can perform for me." }
        ];
    }
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] gap-4 animate-in fade-in duration-700">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative border border-white/5 rounded-2xl overflow-hidden">
        
        {/* Messages Volume - Hidden scrollbar */}
        <div 
          ref={scrollRef}
          className={`flex-1 overflow-y-auto ${isInitialState ? 'hidden' : 'block'} p-6 md:p-12 space-y-8 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}
        >
          <div className="max-w-3xl mx-auto space-y-10 pb-10">
            {messages.map((msg, i) => (
              <div 
                key={msg.id} 
                className={`flex gap-6 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`p-4 rounded-2xl ${
                    msg.role === "user" 
                    ? "bg-foreground/5 text-white/90 rounded-tr-none px-6" 
                    : "text-white/95 leading-relaxed"
                  }`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full border border-[#86efac]/20 bg-[#86efac]/10 flex items-center justify-center mb-4">
                        <BrainCircuit className="w-4 h-4 text-[#86efac]" />
                      </div>
                    )}
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    ) : (
                      <div className="metis-markdown">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-6 justify-start animate-pulse">
                <div className="space-y-3 pt-2">
                  <div className="h-2 w-48 bg-[#86efac]/10 rounded-full" />
                  <div className="h-2 w-32 bg-[#86efac]/5 rounded-full" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Initial Center State */}
        {isInitialState && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-[#86efac]/5 border border-[#86efac]/10 flex items-center justify-center rounded-2xl mb-8 group hover:border-[#86efac]/30 transition-all">
                <BrainCircuit className="w-8 h-8 text-[#86efac] group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-3xl font-display text-white mb-10 tracking-tight">How can Metis assist you today?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-3xl">
                {getRolePrompts().map((p, idx) => (
                  <button key={idx} onClick={() => setInput(p.prompt)} className="p-4 border border-white/5 hover:border-white/10 hover:bg-white/[0.02] text-left transition-all rounded-xl group/btn">
                      <p className="text-[10px] font-mono text-[#86efac] mb-1 opacity-50 uppercase">{p.label}</p>
                      <p className="text-xs text-muted-foreground group-hover/btn:text-white transition-colors">"{p.text}"</p>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Input Terminal */}
        <div className={`p-6 md:p-12 transition-all duration-500 ${isInitialState ? 'mt-auto' : 'bg-background border-t border-white/5'}`}>
          <div className="max-w-3xl mx-auto relative">
            <form onSubmit={sendMessage} className="relative group">
               <div className="relative flex items-center gap-3 bg-card border border-white/10 focus-within:border-white/20 p-2 pl-5 rounded-2xl transition-all shadow-2xl">
                  <label className="cursor-pointer text-muted-foreground hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5">
                      <Paperclip className="w-5 h-5 transition-transform group-hover:rotate-12" />
                      <input type="file" className="hidden" ref={fileInputRef} />
                  </label>
                  
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-1 bg-transparent text-base h-12 outline-none text-white placeholder:text-muted-foreground/30 font-mono"
                  />
                  
                  <div className="flex items-center gap-2 pr-1">
                      <button type="button" className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors rounded-xl hover:bg-white/5">
                          <Mic className="w-5 h-5" />
                      </button>
                      <button 
                          type="submit" 
                          disabled={!input.trim() || isLoading}
                          className={`w-10 h-10 flex items-center justify-center transition-all rounded-xl ${
                              input.trim() && !isLoading 
                              ? "bg-white text-black hover:bg-white/90 scale-100" 
                              : "text-muted-foreground bg-white/5 scale-95"
                          }`}
                      >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                  </div>
               </div>
            </form>
            <p className="text-[10px] text-center text-muted-foreground/20 mt-4 tracking-widest font-mono uppercase">Clinical AI Guardrails Active</p>
          </div>
        </div>
      </div>

      {/* Right Sidebar - History */}
      <aside className="w-72 bg-card/30 border border-white/5 rounded-2xl overflow-hidden flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">History</h3>
            </div>
            <button onClick={startNewChat} className="text-muted-foreground hover:text-white transition-colors" title="New Chat">
                <PlusCircle className="w-4 h-4" />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {isHistoryLoading ? (
                <div className="flex flex-col items-center justify-center p-10 gap-3 opacity-20">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[8px] font-mono uppercase">Syncing</span>
                </div>
            ) : historySessions.length === 0 ? (
                <div className="py-20 text-center space-y-2 opacity-20">
                    <History className="w-8 h-8 mx-auto" />
                    <p className="text-[10px] font-mono uppercase tracking-widest px-6 italic">No recent health history</p>
                </div>
            ) : (
                historySessions.map((session) => (
                    <button 
                        key={session.id}
                        onClick={() => loadSession(session.id)}
                        className={`w-full p-3 text-left text-xs transition-all rounded-lg truncate group flex items-center justify-between border ${sessionId === session.id ? "bg-white/5 border-white/10 text-white" : "border-transparent text-muted-foreground hover:text-white hover:bg-white/5"}`}
                    >
                        <span className="truncate">{session.title}</span>
                        <ChevronRight className={`w-3 h-3 transition-opacity ${sessionId === session.id ? 'opacity-40' : 'opacity-0 group-hover:opacity-40'}`} />
                    </button>
                ))
            )}
        </div>
      </aside>
    </div>
  );
}
