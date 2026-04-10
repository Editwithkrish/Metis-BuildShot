"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    Baby,
    Syringe,
    Apple,
    Stethoscope,
    MessageCircle,
    FolderLock,
    AlertTriangle,
    Bell,
    ChevronRight,
    Shield,
    Activity,
    LineChart,
    Heart,
    Users,
    Star,
    ArrowRight,
    Menu,
    X,
    Mail,
    Phone,
    Sparkles,
} from "lucide-react"

// --- Premium Design Tokens ---
const COLORS = {
    blue: "#5C7CFA",
    white: "#FFFFFF",
    dark: "#2F3037",
    slate: {
        DEFAULT: "#64748b",
        light: "#94a3b8",
        dark: "#475569"
    }
}

// --- Components ---

function FeatureNavCard({
    title,
    description,
    isActive,
    progress,
    onClick,
}: {
    title: string
    description: string
    isActive: boolean
    progress: number
    onClick: () => void
}) {
    return (
        <div
            className={`relative flex-1 p-6 cursor-pointer transition-all duration-200 group ${isActive ? "bg-white/70 backdrop-blur-md" : "hover:bg-white/20"
                }`}
            onClick={onClick}
        >
            {isActive && (
                <div className="absolute top-0 left-0 w-full h-1 bg-[#5C7CFA]/10">
                    <div
                        className="h-full bg-gradient-to-r from-[#5C7CFA] to-[#A5C8FF] transition-all duration-100 linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
            <h4 className={`text-[13px] font-bold font-sans transition-colors duration-200 ${isActive ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"}`}>
                {title}
            </h4>
            <p className={`text-[11px] font-medium leading-relaxed mt-1 transition-colors duration-200 ${isActive ? "text-slate-600" : "text-slate-400"}`}>
                {description}
            </p>
        </div>
    )
}

export default function LandingPage() {
    const [activeCard, setActiveCard] = useState(0)
    const [progress, setProgress] = useState(0)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const mountedRef = useRef(true)

    useEffect(() => {
        const progressInterval = setInterval(() => {
            if (!mountedRef.current) return
            setProgress((prev) => {
                if (prev >= 100) {
                    setActiveCard((current) => (current + 1) % 3)
                    return 0
                }
                return prev + 5 // Faster progress (2s per card)
            })
        }, 100)
        return () => {
            clearInterval(progressInterval)
            mountedRef.current = false
        }
    }, [])

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleTabSwitch = (idx: number) => {
        setActiveCard(idx)
        setProgress(0)
    }

    const getDashboardContent = () => {
        switch (activeCard) {
            case 0:
                return (
                    <div className="w-full h-full p-10 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center gap-5 mb-12">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50/80 flex items-center justify-center text-[#5C7CFA] shadow-sm">
                                <LineChart size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 font-sans">Growth Velocity</h3>
                                <p className="text-[11px] font-black text-slate-400 font-sans uppercase tracking-[0.2em]">Leo · Month 6</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { label: "Current Weight", val: "7.4kg", sub: "92nd percentile", color: "text-blue-600", bg: "bg-blue-50/30" },
                                { label: "Standing Height", val: "68.2cm", sub: "+2.1cm this month", color: "text-indigo-600", bg: "bg-indigo-50/30" },
                                { label: "Deep Sleep", val: "12.4h", sub: "15% increase", color: "text-blue-600", bg: "bg-blue-50/30" },
                                { label: "Feeding Intake", val: "8 sessions", sub: "Stable patterns", color: "text-amber-600", bg: "bg-amber-50/30" },
                            ].map((item, i) => (
                                <div key={i} className={`p-6 rounded-[32px] ${item.bg} border border-white/80 shadow-sm backdrop-blur-sm`}>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                    <p className={`text-3xl font-extrabold ${item.color} mt-1`}>{item.val}</p>
                                    <p className="text-[11px] font-bold text-slate-500/80 mt-1">{item.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            case 1:
                return (
                    <div className="w-full h-full p-10 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center gap-5 mb-12">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 flex items-center justify-center text-[#5C7CFA] shadow-sm">
                                <Syringe size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 font-sans">Protection Ledger</h3>
                                <p className="text-[11px] font-black text-slate-400 font-sans uppercase tracking-[0.2em]">Immunization Vault</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: "Pneumococcal Conjugate (PCV13)", date: "JAN 12", status: "Administered", done: true },
                                { name: "Diphtheria, Tetanus, Pertussis (DTaP)", date: "FEB 28", status: "Next Appointment", done: false },
                                { name: "Rotavirus Oral Vaccine (RV5)", date: "MAR 15", status: "Confirmed", done: false },
                            ].map((item, i) => (
                                <div key={i} className={`p-6 rounded-[28px] flex items-center justify-between border ${item.done ? "bg-white/80 border-[#5C7CFA]/40 shadow-sm" : "bg-white/40 border-slate-100"}`}>
                                    <div className="flex items-center gap-5">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.done ? "bg-[#5C7CFA] text-white shadow-lg shadow-[#5C7CFA]/20" : "bg-slate-100 text-slate-400"}`}>
                                            {item.done ? <Shield size={18} /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-bold text-slate-800 font-sans">{item.name}</p>
                                            <p className={`text-[11px] font-bold uppercase tracking-wider ${item.done ? "text-[#5C7CFA]" : "text-slate-400"}`}>{item.status}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-slate-400 font-sans">{item.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="w-full h-full p-10 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center gap-5 mb-12">
                            <div className="w-14 h-14 rounded-2xl bg-amber-50/80 flex items-center justify-center text-[#FFD98E] shadow-sm">
                                <Apple size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 font-sans">Nutrition Concierge</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-[11px] font-black text-slate-400 font-sans uppercase tracking-[0.2em]">AI Assistant</p>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 rounded-full border border-green-100">
                                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[9px] font-bold text-green-600 uppercase tracking-wider">Live</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">M</div>
                                <div className="bg-slate-100/80 backdrop-blur-sm py-4 px-6 rounded-[24px] rounded-tl-sm text-sm font-medium text-slate-700 max-w-[80%] shadow-sm">
                                    When should I start iron-rich solids?
                                </div>
                            </div>
                            <div className="flex gap-4 flex-row-reverse">
                                <div className="w-10 h-10 rounded-full bg-[#5C7CFA] flex items-center justify-center text-white shadow-lg shadow-[#5C7CFA]/20"><Baby size={20} /></div>
                                <div className="bg-white py-4 px-6 rounded-[24px] rounded-tr-sm border border-[#5C7CFA]/20 text-sm font-bold text-slate-800 leading-relaxed max-w-[80%] shadow-lg shadow-[#5C7CFA]/5">
                                    Typically around 6 months. We recommend starting with pureed spinach. 🥬
                                </div>
                            </div>
                        </div>
                    </div>
                )
            default: return null
        }
    }

    return (
        <div className="w-full min-h-screen font-sans selection:bg-[#5C7CFA]/10 selection:text-[#5C7CFA] bg-[#fbfdff]">

            {/* --- High Fidelity Background --- */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#E3F0FF]/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[40%] bg-[#F5F9FF]/60 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#A5C8FF]/10 rounded-full blur-[140px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center">

                {/* --- Unified Navigation --- */}
                <header className={`w-full fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${scrolled ? 'pt-4' : 'pt-8'}`}>
                    <nav className={`mx-auto transition-all duration-500 ease-in-out flex items-center justify-between
                        ${scrolled
                            ? 'max-w-[1000px] h-14 px-6 bg-white/80 backdrop-blur-2xl rounded-full border border-white/40 shadow-[0_12px_48px_rgba(92,124,250,0.08)] ring-1 ring-slate-200/50'
                            : 'max-w-[1200px] h-12 px-8 bg-transparent border-transparent shadow-none'
                        }`}>
                        <div className="flex items-center gap-10">
                            <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
                                <div className="relative w-8 h-8 group-hover:animate-wheel">
                                    <Image
                                        src="/logo.svg"
                                        alt="Metis Logo"
                                        width={32}
                                        height={32}
                                        className="object-contain"
                                    />
                                </div>
                                <span className={`text-xl font-normal tracking-tight font-serif transition-colors duration-300 ${scrolled ? 'text-slate-900' : 'text-slate-800'}`}>Metis</span>
                            </Link>

                            <div className="hidden lg:flex items-center gap-10">
                                {["Features", "Doctors", "Safety"].map((item) => (
                                    <a key={item} href={`#${item.toLowerCase()}`} className={`text-[12px] font-bold transition-all duration-300 uppercase tracking-[0.15em] ${scrolled ? 'text-slate-500 hover:text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>
                                        {item}
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <Link href="/onboarding" className={`hidden sm:block text-[12px] font-bold transition-colors duration-300 uppercase tracking-[0.1em] ${scrolled ? 'text-slate-500 hover:text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>
                                Log in
                            </Link>
                            <Link href="/onboarding" className={`px-6 transition-all duration-300 text-[12px] font-bold rounded-full shadow-lg shadow-[#5C7CFA]/10 flex items-center justify-center uppercase tracking-[0.1em]
                                ${scrolled
                                    ? 'h-9 bg-[#5C7CFA] text-white hover:bg-[#4A6CF7] hover:-translate-y-0.5'
                                    : 'h-10 bg-slate-900 text-white hover:bg-black hover:-translate-y-0.5'
                                }`}>
                                Get Started
                            </Link>
                        </div>
                    </nav>
                </header>

                {/* --- Hero Section --- */}
                <section className="w-full pt-44 sm:pt-56 pb-20 px-6 max-w-[1240px] flex flex-col items-center text-center">

                    <div className="max-w-[1000px] space-y-6">
                        <h1 className="text-slate-900 text-[36px] sm:text-[54px] md:text-[72px] lg:text-[84px] font-normal leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 font-serif">
                            <span>A calm perspective on</span>
                            <br />
                            <span className="relative inline-block px-4 pb-2 bg-gradient-to-r from-[#5C7CFA] via-[#A5C8FF] to-[#5C7CFA] bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent italic">
                                Motherhood
                                <Sparkles className="absolute -top-2 -right-4 text-[#FFD98E] w-8 h-8 animate-pulse" />
                            </span>
                        </h1>

                        <p className="max-w-[600px] mx-auto text-slate-500 text-base md:text-lg font-medium leading-relaxed font-sans animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            Track and nurture your baby&apos;s journey with a medical-grade dashboard designed for modern parents.
                        </p>
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <Link href="/onboarding" className="h-14 px-10 bg-slate-900 hover:bg-black text-white rounded-full font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-xl hover:-translate-y-1">
                            Start Tracking Free
                            <ArrowRight size={18} />
                        </Link>
                        <Link href="/doctor" className="h-14 px-8 bg-white hover:bg-slate-50 text-slate-800 border border-slate-100 rounded-full font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md">
                            <Stethoscope size={18} className="text-[#5C7CFA]" />
                            Doctor Portal
                        </Link>
                    </div>

                    {/* --- Multi-State Interactive Preview --- */}
                    <div className="w-full max-w-[1000px] mt-16 relative animate-in zoom-in-95 fade-in duration-1000 delay-500">
                        <div className="absolute -inset-8 bg-gradient-to-br from-[#5C7CFA]/5 to-transparent blur-[100px] -z-10" />

                        <div className="w-full bg-white/60 backdrop-blur-3xl rounded-[40px] border border-white shadow-[0_40px_100px_-30px_rgba(92,124,250,0.12)] overflow-hidden ring-1 ring-slate-100/50">
                            <div className="w-full h-[300px] sm:h-[450px] md:h-[550px] relative overflow-hidden bg-white/10">
                                <div className="absolute inset-0">
                                    {getDashboardContent()}
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
                            </div>

                            <div className="flex flex-col md:flex-row border-t border-slate-200/50 bg-white/40">
                                <FeatureNavCard
                                    title="Growth Analytics"
                                    description="Precise tracking."
                                    isActive={activeCard === 0}
                                    progress={activeCard === 0 ? progress : 0}
                                    onClick={() => handleTabSwitch(0)}
                                />
                                <div className="w-px bg-slate-200/50 hidden md:block" />
                                <FeatureNavCard
                                    title="Safe Vaccination"
                                    description="SMART reminders."
                                    isActive={activeCard === 1}
                                    progress={activeCard === 1 ? progress : 0}
                                    onClick={() => handleTabSwitch(1)}
                                />
                                <div className="w-px bg-slate-200/50 hidden md:block" />
                                <FeatureNavCard
                                    title="AI Co-Pilot"
                                    description="Real-time answers."
                                    isActive={activeCard === 2}
                                    progress={activeCard === 2 ? progress : 0}
                                    onClick={() => handleTabSwitch(2)}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="w-full max-w-[1200px] px-6 py-40">
                    <div className="flex flex-col items-center text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-normal text-slate-900 leading-[1.1] tracking-tight font-serif">
                            <span>Everything you need to</span>
                            <br />
                            <span className="text-[#5C7CFA] italic">Protect</span> and <span className="text-[#A5C8FF] italic">Nurture</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[
                            { icon: <Activity size={26} />, title: "Vital Monitoring", text: "Medical-grade logs for temperature, symptoms, and health events.", color: "bg-blue-50/50" },
                            { icon: <MessageCircle size={26} />, title: "Secure Chat", text: "24/7 access to specialized nurses and pediatric counselors.", color: "bg-indigo-50/50" },
                            { icon: <FolderLock size={26} />, title: "Health Vault", text: "Encrypted storage for all prescriptions and lab reports.", color: "bg-indigo-50/50" },
                            { icon: <Bell size={26} />, title: "Smart Alerts", text: "Never miss a medicine dose or a developmental screening.", color: "bg-amber-50/50" },
                            { icon: <Users size={26} />, title: "Family Access", text: "Coordinate care with baby-sitters, partners and doctors.", color: "bg-rose-50/50" },
                            { icon: <Shield size={26} />, title: "Data Privacy", text: "Bank-level encryption because your family safety is sacred.", color: "bg-slate-50/50" },
                        ].map((f, i) => (
                            <div key={i} className="group p-12 bg-white/40 backdrop-blur-sm border border-white rounded-[48px] hover:shadow-2xl hover:shadow-slate-200/40 transition-all duration-700 hover:-translate-y-3">
                                <div className={`w-16 h-16 rounded-[24px] ${f.color} border border-white flex items-center justify-center text-slate-800 mb-10 group-hover:scale-110 transition-all duration-500`}>
                                    {f.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-4 font-sans">{f.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">{f.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="doctors" className="w-full bg-[#0a0c10] py-40 px-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5C7CFA]/10 rounded-full blur-[120px]" />
                    <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-24 items-center relative z-10">
                        <div className="space-y-10">
                            <h2 className="text-5xl md:text-7xl font-normal text-white leading-[1.1] tracking-tight font-serif">
                                <span>Structured care for</span>
                                <br />
                                <span className="text-[#A5C8FF] italic">better outcomes</span>
                            </h2>
                            <p className="text-slate-400 text-lg md:text-xl leading-relaxed font-medium max-w-[500px]">
                                Pediatricians use Metis to view real-time growth trends and longitudinal data, allowing for deeper clinical insights.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {["Remote Monitoring", "Historical Trends", "Secure Portability", "SOS Connectivity"].map(item => (
                                    <div key={item} className="flex items-center gap-4 text-white font-bold tracking-wide">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#5C7CFA] shadow-[0_0_10px_rgba(92,124,250,0.5)]" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                            <Link href="/doctor" className="h-16 px-12 bg-[#5C7CFA] text-white rounded-full font-bold text-base hover:bg-[#4A6CF7] transition-all shadow-xl shadow-[#5C7CFA]/10 flex items-center justify-center">
                                Apply as Partner Doctor
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#5C7CFA]/5 blur-[120px] rounded-full" />
                            <div className="relative rounded-[56px] overflow-hidden border-[12px] border-white/5 shadow-3xl">
                                <Image src="/doctor-portrait.png" width={600} height={800} alt="Expert Doctor" className="w-full h-auto grayscale-[0.1] hover:grayscale-0 transition-all duration-1000 scale-105" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Footer --- */}
                <footer className="w-full py-32 px-6 max-w-[1200px] border-t border-slate-100 flex flex-col md:flex-row justify-between items-start gap-16">
                    <div className="space-y-8 max-w-[340px] group cursor-default">
                        <div className="flex items-center gap-4">
                            <div className="group-hover:animate-wheel transition-all">
                                <Image src="/logo.svg" alt="Metis" width={32} height={32} />
                            </div>
                            <span className="text-2xl font-normal tracking-tight text-slate-800 font-serif">Metis</span>
                        </div>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            The intelligent operating system for medical documentation and newborn care.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-20">
                        <div className="space-y-6">
                            <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform</h4>
                            <ul className="space-y-4 font-bold text-slate-600">
                                <li className="hover:text-[#5C7CFA] cursor-pointer transition-colors">Growth Tracker</li>
                                <li className="hover:text-[#5C7CFA] cursor-pointer transition-colors">Vaccinations</li>
                                <li className="hover:text-[#5C7CFA] cursor-pointer transition-colors">Security</li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Company</h4>
                            <ul className="space-y-4 font-bold text-slate-600">
                                <li className="hover:text-[#5C7CFA] cursor-pointer transition-colors">About</li>
                                <li className="hover:text-[#5C7CFA] cursor-pointer transition-colors">Contact</li>
                                <li className="hover:text-[#5C7CFA] cursor-pointer transition-colors">Hiring</li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Safety</h4>
                            <ul className="space-y-4 font-bold text-slate-600">
                                <li className="hover:text-[#5C7CFA] cursor-pointer transition-colors">Privacy</li>
                                <li className="hover:text-[#5C7CFA] cursor-pointer transition-colors">HIPAA</li>
                            </ul>
                        </div>
                    </div>
                </footer>

            </div>

            <style jsx global>{`
        @keyframes progress {
          from { left: -100%; }
          to { left: 100%; }
        }
        @keyframes shine {
          to { background-position: 200% center; }
        }
      `}</style>
        </div>
    )
}
