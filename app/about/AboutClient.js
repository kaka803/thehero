"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Clock, Heart, Users, ShieldCheck, Zap, Globe } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

gsap.registerPlugin(ScrollTrigger);

export default function AboutClient() {
  const { t } = useLanguage();
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      gsap.from(".hero-content > *", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out"
      });

      // Section Reveals
      const reveals = gsap.utils.toArray(".reveal-section");
      reveals.forEach((section) => {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none"
          },
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out"
        });
      });

      // Background Glow Animation
      gsap.to(".bg-glow", {
        scale: 1.2,
        opacity: 0.6,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen text-white overflow-hidden selection:bg-[#d3b673] selection:text-black relative">
      <Navbar />
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="bg-glow absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[120px]"></div>
        <div className="bg-glow absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-black/20 rounded-full blur-[100px] delay-1000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <div className="hero-content">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#d3b673] text-xs font-bold tracking-[0.3em] uppercase mb-8">
            <Clock size={14} />
            <span>{t("about.title")}</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black mb-6 tracking-tighter leading-none italic">
            {t("about.intro_title")}
          </h1>
          <p className="text-xl md:text-3xl text-white/60 max-w-3xl font-medium tracking-tight">
             {t("about.intro_subtitle")}
          </p>
        </div>
      </section>

      {/* Story Narrative Sections */}
      <div className="relative z-10 px-6 md:px-12 max-w-4xl mx-auto pb-32 space-y-32">
        
        {/* Section 1: The Origin */}
        <section className="reveal-section space-y-8">
          <p className="text-2xl md:text-3xl font-light leading-relaxed text-white/90 italic border-l-4 border-[#d3b673] pl-8">
            {t("about.section1_text")}
          </p>
        </section>

        {/* Section 2: The Problem */}
        <section className="reveal-section group">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-px bg-[#d3b673]"></div>
             <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic group-hover:text-[#d3b673] transition-colors duration-500">
               {t("about.section2_title")}
             </h2>
          </div>
          <div className="space-y-6 text-lg md:text-xl text-white/50 leading-relaxed font-medium">
            <p>{t("about.section2_p1")}</p>
            <p className="text-white/80">{t("about.section2_p2")}</p>
            <p className="text-2xl md:text-3xl text-[#d3b673] font-black italic mt-12 py-8 border-y border-white/5">
              {t("about.section2_p3")}
            </p>
          </div>
        </section>

        {/* Section 3: The Solution */}
        <section className="reveal-section">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-12">
            {t("about.section3_title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-lg text-white/60 leading-relaxed">
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors">
              <Zap className="text-[#d3b673] mb-6" size={32} />
              <p>{t("about.section3_p1")}</p>
            </div>
            <div className="bg-[#d3b673] p-10 rounded-[2.5rem] text-black font-bold">
              <Heart className="mb-6" size={32} />
              <p className="text-xl leading-tight mb-4">{t("about.section3_p2")}</p>
              <div className="h-1 w-20 bg-black/20 mt-8 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Section 4: Why Hero? */}
        <section className="reveal-section text-center py-20 bg-white/2 rounded-[4rem] border border-white/5 backdrop-blur-sm">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-12 text-[#d3b673]">
            {t("about.section4_title")}
          </h2>
          <div className="max-w-2xl mx-auto space-y-8 px-8">
            <p className="text-2xl font-bold">{t("about.section4_p1")}</p>
            <p className="text-white/40">{t("about.section4_p2")}</p>
            <div className="pt-8 border-t border-white/10">
               <p className="text-sm tracking-[0.5em] uppercase font-black text-[#d3b673] animate-pulse">
                 {t("about.section4_list")}
               </p>
            </div>
          </div>
        </section>

        {/* Section 5: Target audience */}
        <section className="reveal-section">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
               <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">
                 {t("about.section5_title")}
               </h2>
               <p className="text-xl text-white/60 leading-relaxed">
                 {t("about.section5_p1")}
               </p>
            </div>
            <div className="shrink-0 grid grid-cols-2 gap-4">
               {[
                 { icon: <Users size={20} />, label: "Family" },
                 { icon: <Globe size={20} />, label: "Gastro" },
                 { icon: <ShieldCheck size={20} />, label: "Clean" },
                 { icon: <Zap size={20} />, label: "Fast" }
               ].map((item, i) => (
                 <div key={i} className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-[#d3b673] hover:text-black transition-all">
                    {item.icon}
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* Section 6: Mission */}
        <section className="reveal-section mt-32">
          <div className="relative p-12 md:p-20 rounded-[4rem] overflow-hidden border border-white/10 text-center">
             <div className="absolute inset-0 bg-[#d3b673] opacity-[0.03]"></div>
             <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-12">
               {t("about.section6_title")}
             </h2>
             <div className="max-w-3xl mx-auto space-y-12">
                <div className="space-y-4 text-white/50 text-xl font-medium">
                  <p>{t("about.section6_p1")}</p>
                </div>
                <div className="space-y-4">
                  <p className="text-3xl md:text-5xl font-black italic text-[#d3b673]">
                    {t("about.section6_p2")}
                  </p>
                </div>
             </div>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  );
}
