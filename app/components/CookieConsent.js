"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import gsap from "gsap";
import Link from "next/link";
import { Cookie, X, Check } from "lucide-react";

export default function CookieConsent() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const bannerRef = useRef(null);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setIsVisible(true);
      // Animation in
      const timer = setTimeout(() => {
        if (bannerRef.current) {
          gsap.fromTo(
            bannerRef.current,
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" }
          );
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie_consent", "all");
    hideBanner();
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "essential");
    hideBanner();
  };

  const hideBanner = () => {
    gsap.to(bannerRef.current, {
      y: 100,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => setIsVisible(false),
    });
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={bannerRef}
      className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[200] opacity-0"
    >
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
        {/* Decorative Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#d3b673]/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-[#d3b673]/20 transition-colors duration-500"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d3b673]/20 flex items-center justify-center text-[#d3b673]">
              <Cookie size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">{t("cookies_banner.title")}</h3>
          </div>

          <p className="text-white/60 text-sm leading-relaxed">
            {t("cookies_banner.description")}{" "}
            <Link href="/cookies" className="text-[#d3b673] hover:underline font-medium">
              {t("cookies_banner.read_more")}
            </Link>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleAcceptAll}
              className="flex-1 bg-[#d3b673] hover:bg-[#c4a55d] text-black font-bold py-3 px-6 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Check size={16} strokeWidth={3} />
              {t("cookies_banner.accept_all")}
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
            >
              {t("cookies_banner.decline")}
            </button>
          </div>
        </div>

        {/* Close Button X (Optional, maybe just buttons are better for GDPR) */}
        <button 
          onClick={handleDecline}
          className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
