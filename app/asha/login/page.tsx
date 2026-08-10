"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  LockKeyhole,
  Network,
  ShieldCheck,
  Smartphone,
  UserRoundCheck,
  WifiOff,
} from "lucide-react";

export default function AshaLoginPage() {
  const router = useRouter();
  const [ashaId, setAshaId] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [online, setOnline] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const signIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (ashaId.trim().length < 4) {
      setError("Enter a valid ASHA worker ID.");
      return;
    }
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      setError("Your device PIN must contain 4 to 6 digits.");
      return;
    }

    setSubmitting(true);
    const session = {
      ashaId: ashaId.trim().toUpperCase(),
      phone: phone.replace(/\D/g, ""),
      name: "ASHA Worker",
      ward: "Ward 14",
      verifiedAt: new Date().toISOString(),
      offline: !online,
    };
    localStorage.setItem("metis_asha_session", JSON.stringify(session));
    document.cookie = "metis_asha_session=active; path=/; max-age=2592000; SameSite=Lax";
    window.setTimeout(() => router.push("/asha"), 350);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(134,239,172,0.11),transparent_35%),radial-gradient(circle_at_82%_85%,rgba(96,165,250,0.07),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <header className="relative z-10 flex h-20 items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center border border-[#86efac]/30 bg-[#86efac]/10">
            <img src="/logo.png" alt="METIS" className="h-6 w-6 object-contain" />
          </span>
          <div>
            <p className="font-display text-xl leading-none">METIS <span className="text-[#86efac]">Field</span></p>
            <p className="mt-1 text-[8px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Community health access</p>
          </div>
        </Link>
        <span className={`flex items-center gap-2 border px-3 py-2 text-[9px] font-mono uppercase tracking-wider ${online ? "border-[#86efac]/20 text-[#86efac]" : "border-amber-300/20 text-amber-200"}`}>
          {online ? <Network className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {online ? "Online verification" : "Offline device access"}
        </span>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-[1280px] items-center gap-12 px-5 py-10 lg:grid-cols-[1fr_460px] lg:px-12">
        <div className="hidden max-w-xl lg:block">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#86efac]"><span className="h-px w-10 bg-[#86efac]/70" /> ASHA secure workspace</div>
          <h1 className="mt-6 font-display text-6xl leading-[0.96]">Every home visit.<br /><span className="text-muted-foreground">One clear next step.</span></h1>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground">Sign in to access your offline child registry, priority follow-ups, village risk map and referral decision support.</p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { icon: Smartphone, label: "Offline first", text: "Works during field visits" },
              { icon: ShieldCheck, label: "Device secured", text: "Protected local records" },
              { icon: BadgeCheck, label: "Worker access", text: "ASHA-specific workspace" },
            ].map((item) => <div key={item.label} className="border border-foreground/10 bg-foreground/[0.02] p-4"><item.icon className="h-4 w-4 text-[#86efac]" /><p className="mt-4 text-xs font-medium">{item.label}</p><p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{item.text}</p></div>)}
          </div>
        </div>

        <div className="border border-foreground/10 bg-card/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-8">
            <div className="flex h-11 w-11 items-center justify-center border border-[#86efac]/25 bg-[#86efac]/10 text-[#86efac]"><UserRoundCheck className="h-5 w-5" /></div>
            <h2 className="mt-5 font-display text-3xl">ASHA worker login</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Use the worker ID, mobile number and device PIN assigned by your health programme.</p>
          </div>

          <form onSubmit={signIn} className="space-y-5">
            <label className="grid gap-2">
              <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground">ASHA worker ID</span>
              <input value={ashaId} onChange={(event) => setAshaId(event.target.value)} autoComplete="username" placeholder="e.g. ASHA-MH-1427" className="h-12 border border-foreground/10 bg-black/25 px-4 text-sm uppercase outline-none placeholder:normal-case placeholder:text-muted-foreground/45 focus:border-[#86efac]/45" />
            </label>
            <label className="grid gap-2">
              <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Registered mobile number</span>
              <div className="flex h-12 border border-foreground/10 bg-black/25 focus-within:border-[#86efac]/45"><span className="flex items-center border-r border-foreground/10 px-3 text-xs text-muted-foreground">+91</span><input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="numeric" autoComplete="tel" maxLength={10} placeholder="10-digit mobile number" className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground/45" /></div>
            </label>
            <label className="grid gap-2">
              <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Device PIN</span>
              <div className="relative"><LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} type={showPin ? "text" : "password"} inputMode="numeric" autoComplete="current-password" maxLength={6} placeholder="4–6 digit PIN" className="h-12 w-full border border-foreground/10 bg-black/25 pl-11 pr-12 text-sm tracking-[0.25em] outline-none placeholder:tracking-normal placeholder:text-muted-foreground/45 focus:border-[#86efac]/45" /><button type="button" aria-label={showPin ? "Hide PIN" : "Show PIN"} onClick={() => setShowPin((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground">{showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            </label>

            {error && <p role="alert" className="border border-rose-400/25 bg-rose-400/[0.07] px-3 py-2.5 text-xs text-rose-200">{error}</p>}

            <button disabled={submitting} className="flex h-12 w-full items-center justify-center gap-2 bg-[#86efac] text-xs font-bold text-black transition-colors hover:bg-[#a2f3bf] disabled:opacity-60">{submitting ? "Opening secure workspace…" : <>Continue to METIS Field <ArrowRight className="h-4 w-4" /></>}</button>
          </form>

          <div className="mt-6 flex items-start gap-2 border-t border-foreground/10 pt-5 text-[10px] leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#86efac]" />Offline access is limited to records previously saved on this verified device. Never share your device PIN.</div>
          <Link href="/auth" className="mt-5 flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Family or clinician login</Link>
        </div>
      </section>
    </main>
  );
}
