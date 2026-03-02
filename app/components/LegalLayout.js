"use client";

import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLanguage } from "@/context/LanguageContext";
import { FileText, Clock, ChevronRight } from "lucide-react";

const LegalLayout = ({ title, lastUpdated, sections }) => {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen text-white selection:bg-[#d3b673] selection:text-black relative">
      <Navbar />
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-[#d3b673]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 pt-40 pb-32 px-6 md:px-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#d3b673] text-[10px] font-bold tracking-[0.3em] uppercase">
            <FileText size={14} />
            <span>{t("footer.legal")}</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter italic uppercase wrap-break-word">
            {title}
          </h1>
          <div className="flex items-center gap-2 text-white/40 text-sm font-medium">
            <Clock size={16} />
            <span>{lastUpdated}</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-12">
          {sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-2xl font-bold text-[#d3b673] flex items-center gap-3 wrap-break-word">
                <ChevronRight size={20} className="opacity-50" />
                {section.title}
              </h2>
              <div className="text-white/70 leading-relaxed text-lg whitespace-pre-wrap pl-8">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default LegalLayout;
