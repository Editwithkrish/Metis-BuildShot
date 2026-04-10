"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    Baby,
    Mail,
    Lock,
    ArrowRight,
    ChevronLeft,
    ShieldCheck,
    Heart
} from "lucide-react"

import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Reusable components
function AuthInput({
    icon: Icon,
    type,
    placeholder,
    value,
    onChange
}: {
    icon: any,
    type: string,
    placeholder: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
    return (
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#5C7CFA] transition-colors">
                <Icon size={18} />
            </div>
            <input
                type={type}
                placeholder={placeholder}
                className="w-full h-14 pl-12 pr-4 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5C7CFA]/20 focus:border-[#5C7CFA] transition-all font-sans text-slate-700 placeholder:text-slate-400 font-medium"
                value={value}
                onChange={onChange}
                required
            />
        </div>
    )
}

export default function OnBoarding() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                router.push("/dashboard")
                router.refresh()
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase, router])

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            toast.error(error.message)
            setIsLoading(false)
        }
    }

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                toast.success("Welcome back!")
                router.push("/dashboard")
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        },
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                toast.success("Check your email to confirm your account!")
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen metis-gradient flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background blobs for depth */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#E3F0FF]/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F5F9FF]/60 rounded-full blur-[100px]" />
            </div>

            {/* Minimal Header */}
            <div className="absolute top-8 left-8 right-8 z-20">
                <Link href="/" className="flex items-center gap-2.5 group cursor-pointer w-fit">
                    <Image src="/logo.svg" alt="Metis" width={28} height={28} className="group-hover:scale-110 transition-transform duration-500" />
                    <span className="text-xl font-normal text-slate-800 tracking-tight font-serif">Metis</span>
                </Link>
            </div>

            {/* Auth Card */}
            <div className="w-full max-w-[480px] glass p-8 md:p-12 rounded-[40px] shadow-[0_32px_80px_-20px_rgba(92,124,250,0.15)] border-white/80 relative z-10 animate-in fade-in zoom-in-95 duration-700">

                {/* Google Auth First */}
                <div className="space-y-4 mb-8">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full h-14 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                    </button>
                </div>

                {/* Divider */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase font-bold text-slate-400">
                        <span className="bg-white/40 px-4 backdrop-blur-sm">Or sign in with email</span>
                    </div>
                </div>

                {/* Auth Toggle */}
                <div className="flex bg-slate-100/50 p-1.5 rounded-2xl mb-8 relative">
                    <div
                        className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${isLogin ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}
                    />
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors ${isLogin ? 'text-[#5C7CFA]' : 'text-slate-500'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors ${!isLogin ? 'text-[#5C7CFA]' : 'text-slate-500'}`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleAuth}>
                    {!isLogin && (
                        <AuthInput
                            icon={Baby}
                            type="text"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    )}
                    <AuthInput
                        icon={Mail}
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <AuthInput
                        icon={Lock}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {isLogin && (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="text-xs font-bold text-[#5C7CFA] hover:text-[#4A6CF7] transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-xl hover:-translate-y-1 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                        <ArrowRight size={18} />
                    </button>
                </form>

                {/* Footer Meta */}
                <div className="mt-10 flex flex-col items-center gap-4 text-center">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <ShieldCheck size={12} className="text-[#5C7CFA]" />
                        HIPAA Compliant & Encrypted
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium max-w-[280px]">
                        By continuing, you agree to Metis's <span className="text-slate-600 font-bold cursor-pointer">Terms of Service</span> and <span className="text-slate-600 font-bold cursor-pointer">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </main>
    )
}
