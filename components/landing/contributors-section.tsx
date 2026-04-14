"use client";

import { useEffect, useState, useRef } from "react";
import { Github, Twitter, Linkedin, Users } from "lucide-react";

const contributors = [
  {
    name: "Krishna",
    role: "Lead Architect",
    bio: "Visionary behind METIS clinical synchronization architecture.",
    github: "https://github.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
    color: "#86efac"
  },
  {
    name: "Pratik",
    role: "AI Research",
    bio: "Developing CNN-based analytical models for maternal health tracking.",
    github: "https://github.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
    color: "#60a5fa"
  },
  {
    name: "Varad",
    role: "Product Design",
    bio: "Crafting the high-fidelity user experience for healthcare accessibility.",
    github: "https://github.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
    color: "#f472b6"
  }
];

export function ContributorsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="contributors" ref={sectionRef} className="relative py-32 lg:py-48 bg-background overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#86efac]/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#86efac]/5 rounded-full blur-[120px] -ml-64 -mb-64" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Ecosystem Contributors
          </span>
          <h2 className={`text-6xl lg:text-8xl font-display transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            Built by the <span className="text-[#86efac]">community.</span>
          </h2>
          <p className={`text-xl text-muted-foreground mt-8 max-w-2xl transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            A collective of researchers, engineers, and designers dedicated to transforming maternal and newborn care through clinical AI.
          </p>
        </div>

        {/* Contributors Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {contributors.map((person, index) => (
            <div
              key={person.name}
              className={`group relative p-12 border border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 150 + 400}ms` }}
            >
              {/* Corner Accent */}
              <div 
                className="absolute top-0 right-0 w-2 h-2 bg-foreground/20 group-hover:bg-[#86efac] transition-colors" 
              />
              
              <div className="mb-8">
                <div 
                  className="w-16 h-16 border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500"
                  style={{ borderColor: `${person.color}33` }}
                >
                  <span className="text-2xl font-display" style={{ color: person.color }}>
                    {person.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-3xl font-display text-white mb-2">{person.name}</h3>
                <p className="text-sm font-mono tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: person.color }}>
                  {person.role}
                </p>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-8">
                {person.bio}
              </p>

              {/* Socials */}
              <div className="flex gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                <a href={person.github} className="hover:text-[#86efac] transition-colors"><Github className="w-4 h-4" /></a>
                <a href={person.twitter} className="hover:text-[#86efac] transition-colors"><Twitter className="w-4 h-4" /></a>
                <a href={person.linkedin} className="hover:text-[#86efac] transition-colors"><Linkedin className="w-4 h-4" /></a>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div 
          className={`mt-24 p-12 border border-[#86efac]/20 bg-[#86efac]/5 flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-1000 delay-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-[#86efac]/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#86efac]" />
            </div>
            <div>
              <h4 className="text-xl font-display text-white">Want to join the mission?</h4>
              <p className="text-sm text-muted-foreground mt-1 text-[#86efac]/60">We're always looking for clinical experts and AI researchers.</p>
            </div>
          </div>
          <button className="px-8 py-4 bg-[#86efac] text-black font-bold text-sm tracking-widest uppercase hover:bg-white transition-all transform active:scale-95">
            Become a Contributor
          </button>
        </div>
      </div>
    </section>
  );
}
