"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import gsap from "gsap";

export default function ContactClient() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".contact-reveal", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out"
      });
      
      gsap.to(".bg-glow-contact", {
        scale: 1.3,
        opacity: 0.4,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    const { name, value, id } = e.target;
    // Map id to names if needed, but I'll update the inputs to have name attributes
    setFormData(prev => ({ ...prev, [name || id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        alert(data.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main ref={containerRef} className="min-h-screen text-white overflow-hidden relative selection:bg-[#d3b673] selection:text-black">
      <Navbar />
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="bg-glow-contact absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-[#d3b673]/5 rounded-full blur-[120px]"></div>
        <div className="bg-glow-contact absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 pt-40 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20 contact-reveal">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#d3b673] text-xs font-bold tracking-[0.3em] uppercase mb-6">
            <MessageSquare size={14} />
            <span>{t("contact.title")}</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter italic uppercase">
            {t("contact.title")}
          </h1>
          <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="space-y-8 contact-reveal">
            <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl space-y-12">
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">{t("contact.info_title")}</h2>
              
              <div className="space-y-8">
                <div className="flex gap-6 group">
                   <div className="w-14 h-14 rounded-2xl bg-[#d3b673]/10 border border-[#d3b673]/20 flex items-center justify-center text-[#d3b673] shrink-0 group-hover:bg-[#d3b673] group-hover:text-black transition-all duration-500">
                      <Mail size={24} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{t("contact.email_label")}</p>
                      <p className="text-xl font-bold">hello@thehero.com</p>
                   </div>
                </div>

                <div className="flex gap-6 group">
                   <div className="w-14 h-14 rounded-2xl bg-[#d3b673]/10 border border-[#d3b673]/20 flex items-center justify-center text-[#d3b673] shrink-0 group-hover:bg-[#d3b673] group-hover:text-black transition-all duration-500">
                      <Phone size={24} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{t("contact.phone_label")}</p>
                      <p className="text-xl font-bold">+49 (0) 123 456 789</p>
                   </div>
                </div>

                <div className="flex gap-6 group">
                   <div className="w-14 h-14 rounded-2xl bg-[#d3b673]/10 border border-[#d3b673]/20 flex items-center justify-center text-[#d3b673] shrink-0 group-hover:bg-[#d3b673] group-hover:text-black transition-all duration-500">
                      <MapPin size={24} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{t("contact.address_label")}</p>
                      <p className="text-xl font-bold">Heberstraße 12, 10115 Berlin, Germany</p>
                      <p className="text-sm text-white/40 mt-1">{t("contact.office")}</p>
                   </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                 <p className="text-[#d3b673] font-black italic tracking-wider text-sm uppercase animate-pulse">Zeit ist Hayat.</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-reveal">
            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl relative overflow-hidden">
              {submitted && (
                <div className="absolute inset-0 z-20 bg-[#d3b673] flex flex-col items-center justify-center text-black text-center p-12 animate-in fade-in duration-500">
                   <div className="w-20 h-20 rounded-full bg-black/10 flex items-center justify-center mb-6">
                      <Send size={40} className="animate-bounce" />
                   </div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-4">{t("contact.success")}</h3>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{t("contact.name")}</label>
                  <input 
                    type="text" name="name" required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#d3b673] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{t("contact.email")}</label>
                  <input 
                    type="email" name="email" required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#d3b673] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{t("contact.subject")}</label>
                <input 
                  type="text" name="subject" required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#d3b673] transition-all"
                />
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{t("contact.message")}</label>
                <textarea 
                  name="message" required rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 px-6 focus:outline-none focus:border-[#d3b673] transition-all resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#d3b673] text-[#0a0a0a] py-5 rounded-2xl font-bold text-lg uppercase tracking-widest hover:bg-[#bfa361] transition-all shadow-xl shadow-[#d3b673]/10 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {isSubmitting ? (
                   <div className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{t("contact.send")}</span>
                    <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
