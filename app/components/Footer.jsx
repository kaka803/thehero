"use client";

import { useState } from "react";
import { Instagram, Facebook, Twitter, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setStatus("loading");
      setMessage("");
      
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to subscribe");
      }

      setStatus("success");
      setMessage(data.message);
      setEmail(""); // clear input on success

      // Reset success state after a few seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);

    } catch (error) {
       console.error("Newsletter error:", error);
       setStatus("error");
       setMessage(error.message || "An error occurred. Please try again.");
    }
  };

  return (
    <footer className="relative mt-20 border-t border-white/10 bg-black/20 backdrop-blur-xl pt-16 pb-8 overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#a8943f]/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Logo & About */}
          <div className="col-span-1 md:col-span-1 space-y-6">
            <Link href="/">
              <Image 
                src="/logo.png" 
                alt="FoodBrand Logo" 
                width={180} 
                height={60} 
                className="h-16 w-auto object-contain brightness-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              />
            </Link>
            <p className="text-white/60 leading-relaxed font-light">
              {t("footer.about")}
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Mail].map((Icon, idx) => (
                <a 
                  key={idx} 
                  href="#" 
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-110"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-white font-semibold text-lg tracking-wide">{t("footer.quick_links")}</h4>
            <ul className="space-y-3">
              {[
                { label: t("footer.links.home"), href: "/" },
                { label: t("footer.links.products"), href: "/products" },
                { label: t("footer.links.story"), href: "/about" },
                { label: t("footer.links.contact"), href: "/contact" }
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/60 hover:text-[#d3b673] transition-colors duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h4 className="text-white font-semibold text-lg tracking-wide">{t("footer.legal")}</h4>
            <ul className="space-y-3">
              {[
                { label: t("footer.links.legal"), href: "/legal" },
                { label: t("footer.links.privacy"), href: "/privacy" },
                { label: t("footer.links.terms"), href: "/terms" },
                { label: t("footer.links.cookie"), href: "/cookies" },
                { label: t("footer.links.shipping"), href: "/shipping" }
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/60 hover:text-[#d3b673] transition-colors duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-white font-semibold text-lg tracking-wide">{t("footer.newsletter")}</h4>
            <p className="text-white/60 text-sm leading-relaxed">
              {t("footer.newsletter_desc")}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="relative group">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading" || status === "success"}
                placeholder={t("footer.email_placeholder")}
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 pr-24 text-white placeholder:text-white/30 focus:outline-none focus:border-[#d3b673]/50 transition-all disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#d3b673] hover:bg-[#c4a55d] text-black text-xs font-bold px-4 rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
              >
                {status === "loading" ? (
                   <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                ) : status === "success" ? (
                   "✓"
                ) : (
                   t("footer.join")
                )}
              </button>
            </form>
            
            {/* Newsletter Messaging */}
            {message && (
               <p className={`text-xs font-medium px-2 ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {message}
               </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-[13px]">
          <p>© 2026 FoodBrand. {t("footer.rights")}</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">{t("footer.help_center")}</a>
            <a href="#" className="hover:text-white transition-colors">{t("footer.accessibility")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
