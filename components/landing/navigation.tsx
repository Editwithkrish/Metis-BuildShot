"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe, ChevronDown, Smartphone } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";
import { setGoogleTranslate } from "@/lib/translate-util";
import { usePWA } from "@/lib/use-pwa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const { t, language, setLanguage } = useLanguage();
  const { canInstall, installApp } = usePWA();
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
  }, []);
  
  const navLinks = [
    { name: t.nav.features,      href: "#features"      },
    { name: t.nav.howItWorks,  href: "#how-it-works"  },
    { name: t.nav.impact,        href: "#metrics"       },
    { name: t.nav.resources,     href: "#integrations"  },
    { name: t.nav.security,      href: "#security"      },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled 
          ? "top-4 left-4 right-4" 
          : "top-0 left-0 right-0"
      }`}
    >
      <nav 
        className={`mx-auto transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-[1200px]"
            : "bg-transparent max-w-[1400px]"
        }`}
      >
        <div 
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <img 
              src="/logo.png" 
              alt="METIS Logo" 
              className={`transition-all duration-500 ${isScrolled ? "h-8" : "h-10"}`} 
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm transition-colors duration-300 relative group ${isScrolled ? "text-foreground/70 hover:text-foreground" : "text-white/70 hover:text-white"}`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full ${isScrolled ? "bg-foreground" : "bg-white"}`} />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-6">
            {canInstall && (
              <Button
                variant="ghost"
                size="sm"
                onClick={installApp}
                className={`flex items-center gap-2 h-9 px-4 rounded-full border border-[#86efac]/30 bg-[#86efac]/5 text-[#86efac] transition-all hover:bg-[#86efac]/10 animate-pulse`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold tracking-widest">INSTALL</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center gap-2 h-9 px-4 rounded-full border border-foreground/10 bg-foreground/[0.03] backdrop-blur-md transition-all hover:border-[#86efac]/30 hover:bg-[#86efac]/5 ${
                    isScrolled ? "text-foreground/70 hover:text-foreground" : "text-white/70 hover:text-white"
                  }`}
                >
                  <Globe className="w-4 h-4 text-[#86efac]" />
                  <span className="text-[11px] font-mono uppercase tracking-widest">{language}</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-foreground/10 p-2">
                <DropdownMenuItem onClick={() => { setLanguage('en'); setGoogleTranslate('en'); }} className="flex items-center justify-between font-mono text-xs cursor-pointer rounded-lg hover:bg-[#86efac]/10 focus:bg-[#86efac]/10 group">
                  ENGLISH <span className="text-[10px] opacity-0 group-hover:opacity-50 transition-opacity">EN</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setLanguage('hi'); setGoogleTranslate('hi'); }} className="flex items-center justify-between font-mono text-xs cursor-pointer rounded-lg hover:bg-[#86efac]/10 focus:bg-[#86efac]/10 group">
                  हिन्दी <span className="text-[10px] opacity-0 group-hover:opacity-50 transition-opacity">HINDI</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setLanguage('mr'); setGoogleTranslate('mr'); }} className="flex items-center justify-between font-mono text-xs cursor-pointer rounded-lg hover:bg-[#86efac]/10 focus:bg-[#86efac]/10 group">
                  मराठी <span className="text-[10px] opacity-0 group-hover:opacity-50 transition-opacity">MARATHI</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setLanguage('bn'); setGoogleTranslate('bn'); }} className="flex items-center justify-between font-mono text-xs cursor-pointer rounded-lg hover:bg-[#86efac]/10 focus:bg-[#86efac]/10 group">
                  বাংলা <span className="text-[10px] opacity-0 group-hover:opacity-50 transition-opacity">BENGALI</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a href="#" className={`transition-all duration-500 ${isScrolled ? "text-xs text-foreground/70 hover:text-foreground" : "text-sm text-white/70 hover:text-white"}`}>
              {t.nav.signIn}
            </a>
            <Link href="/auth">
              <Button
                size="sm"
                className={`rounded-full transition-all duration-500 font-bold ${isScrolled ? "bg-black hover:bg-black/90 text-[#86efac] px-4 h-8 text-xs" : "bg-[#86efac] hover:bg-[#86efac]/90 text-black px-6"}`}
              >
                {t.nav.launchApp}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 transition-colors duration-500 ${isScrolled || isMobileMenuOpen ? "text-foreground" : "text-white"}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

      </nav>
      
      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-background z-40 transition-all duration-500 ${
          isMobileMenuOpen 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        }`}
        style={{ top: 0 }}
      >
        <div className="flex flex-col h-full px-8 pt-28 pb-8">
          {/* Navigation Links */}
          <div className="flex-1 flex flex-col justify-center gap-8">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-5xl font-display text-foreground hover:text-muted-foreground transition-all duration-500 ${
                  isMobileMenuOpen 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms" }}
              >
                {link.name}
              </a>
            ))}
          </div>
          
          {/* Bottom CTAs */}
          <div className={`mt-auto transition-all duration-500 ${
            isMobileMenuOpen 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
          >
            {canInstall && (
              <Button
                onClick={installApp}
                className="w-full mb-4 bg-white/5 border border-[#86efac]/20 text-[#86efac] rounded-full h-14 text-base font-bold flex items-center justify-center gap-3 animate-pulse"
              >
                <Smartphone className="w-5 h-5" />
                INSTALL APP
              </Button>
            )}

            {!canInstall && isIOS && !(window.navigator as any).standalone && (
              <div className="mb-6 p-4 rounded-2xl bg-[#86efac]/5 border border-[#86efac]/20 text-center">
                <p className="text-[#86efac] text-xs font-mono mb-2 uppercase tracking-widest">To Install on iOS</p>
                <p className="text-foreground/70 text-[11px]">
                  Tap the <span className="font-bold">Share</span> icon (square with arrow) and select <span className="font-bold">"Add to Home Screen"</span>
                </p>
              </div>
            )}

            {/* Mobile Language Switcher */}
            <div className="mb-6">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-3 ml-2">Select Language</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिन्दी' },
                  { code: 'mr', label: 'मराठी' },
                  { code: 'bn', label: 'বাংলা' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code as any); setGoogleTranslate(lang.code); }}
                    className={`h-12 rounded-xl text-xs font-mono transition-all border ${
                      language === lang.code 
                        ? "bg-[#86efac] border-[#86efac] text-black font-bold" 
                        : "bg-white/5 border-white/10 text-foreground/70"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-4 font-mono text-center">
              Free for community health workers & public NGOs
            </p>
            <div className="flex gap-4 pt-8 border-t border-foreground/10">
              <Button 
                variant="outline" 
                className="flex-1 rounded-full h-14 text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.nav.signIn}
              </Button>
              <Link href="/auth" className="flex-1">
                <Button 
                  className="w-full bg-[#86efac] text-black rounded-full h-14 text-base font-bold shadow-[0_0_20px_rgba(134,239,172,0.2)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t.nav.launchApp}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
