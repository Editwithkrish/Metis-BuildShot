"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Mail, Chrome, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      router.push("/onboarding");
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-background noise-overlay flex items-center justify-center p-6 lg:p-12 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#86efac]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Branding */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <span className="text-3xl font-display text-white transition-colors group-hover:text-[#86efac]">METIS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#86efac]" />
            <span className="text-xs font-mono text-white/40 uppercase tracking-widest mt-1">Security</span>
          </Link>
          <h1 className="text-2xl font-display text-white mt-4">
            {isLogin ? "Welcome back to clinical monitoring" : "Create your clinical workspace"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Secure access to global health intelligence
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-xl border-foreground/10 p-8 shadow-2xl relative overflow-hidden">
          {/* Animated loading bar if loading */}
          {isLoading && (
            <div className="absolute top-0 left-0 h-1 bg-[#86efac] animate-pulse w-full" />
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs font-mono text-muted-foreground ml-1">WORK EMAIL</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@organization.org" 
                  required 
                  className="bg-black/50 border-white/10 h-12 rounded-none focus-visible:ring-[#86efac]/50"
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pass" className="text-xs font-mono text-muted-foreground ml-1">ENCRYPTED KEY</Label>
                <Input 
                  id="pass" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="bg-black/50 border-white/10 h-12 rounded-none focus-visible:ring-[#86efac]/50"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#86efac] hover:bg-[#86efac]/90 text-black font-bold rounded-none transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? "Initialize Session" : "Create Workspace"}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-muted-foreground font-mono">Or secure connect</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-12 border-white/10 rounded-none hover:bg-white/5" disabled={isLoading}>
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button variant="outline" className="h-12 border-white/10 rounded-none hover:bg-white/5" disabled={isLoading}>
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-muted-foreground">
              {isLogin ? "New to the platform?" : "Already possess a key?"}{" "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#86efac] hover:underline font-medium"
                disabled={isLoading}
              >
                {isLogin ? "Register workspace" : "Sign in here"}
              </button>
            </p>
          </div>
        </Card>

        {/* Footer Security Note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          <ShieldCheck className="w-3 h-3 text-[#86efac]" />
          Clinical-grade 256-bit AES Encryption Active
        </div>
      </div>

      <style jsx global>{`
        .noise-overlay::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          z-index: 100;
        }
      `}</style>
    </main>
  );
}
