"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Stethoscope } from "lucide-react";
import Link from "next/link";
import { postLocal } from "@/lib/local/request";
import { toast } from "sonner";

export function LoginForm({ field = false }: { field?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsLoading(true);
    try {
      const { destination } = await postLocal<{ destination: string }>("/api/session", {
        email: formData.get("email"),
        password: formData.get("pass"),
      });
      window.location.assign(destination);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign-in failed.");
      setIsLoading(false);
    }
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
            <img src="/logo.png" alt="METIS Logo" className="h-12" />
          </Link>
          <h1 className="text-2xl font-display text-white mt-4">
            {field ? "ASHA worker login" : "Welcome Back"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in with your local demo account
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
                <Label htmlFor="email" className="text-xs font-mono text-muted-foreground ml-1">EMAIL ADDRESS</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder={field ? "asha@heddle.so" : "family@heddle.so"}
                  required
                  className="bg-black/50 border-white/10 h-12 rounded-none focus-visible:ring-[#86efac]/50"
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pass" className="text-xs font-mono text-muted-foreground ml-1">PASSWORD</Label>
                <Input
                  id="pass"
                  name="pass"
                  type="password"
                  autoComplete="current-password"
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
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-7 border-t border-white/10 pt-6">
            <p className="mb-3 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {field ? "Family and clinician workspace" : "Community health worker"}
            </p>
            <Link
              href={field ? "/auth" : "/asha/login"}
              className="flex h-12 w-full items-center justify-center gap-2 border border-[#86efac]/30 bg-[#86efac]/5 text-sm font-semibold text-[#86efac] transition-colors hover:bg-[#86efac]/10"
            >
              <Stethoscope className="h-4 w-4" />
              {field ? "Family or clinician login" : "Login for ASHA"}
            </Link>
          </div>
        </Card>
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
