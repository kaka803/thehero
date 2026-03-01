"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Plus, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";
import { useLanguage } from "@/context/LanguageContext";

export default function CrossSellModal({ isOpen, onClose, onProceed }) {
  const [step, setStep] = useState(1);
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const router = useRouter();

  const tahiniProduct = products?.find((p) => p.name === "TAHINI HERO");

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setStep(1), 500);
    }
  }, [isOpen]);

  if (!isOpen || !tahiniProduct) return null;

  const handleAddTahini = () => {
    addToCart(tahiniProduct, 1, "single", false);
    onProceed();
    onClose();
  };

  const handleViewDetails = () => {
    onClose();
    router.push(`/products/${tahiniProduct._id}`);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#d3b673]/10 blur-[80px] rounded-full pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all"
        >
          <X size={20} />
        </button>

        {/* Modal Content - Scrollable if needed */}
        <div className="relative z-10 p-8 flex-1 overflow-y-auto custom-scrollbar">
          {step === 1 ? (
            <div className="flex flex-col items-center text-center space-y-6 py-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-[#d3b673]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Image 
                  src={tahiniProduct.image} 
                  alt="Tahini Hero" 
                  width={140} 
                  height={180} 
                  className="object-contain drop-shadow-2xl relative z-10" 
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {t("cross_sell.question").replace("{span}", "")} <span className="text-[#d3b673]">{tahiniProduct.name}</span> {t("cross_sell.question").includes("?") ? "?" : ""}
                </h3>
                <p className="text-white/40 text-sm max-w-xs mx-auto">
                  {t("cross_sell.partner")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full pt-4">
                <button 
                  onClick={onProceed}
                  className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all active:scale-95 text-sm"
                >
                  {t("cross_sell.yes")}
                </button>
                <button 
                  onClick={() => setStep(2)}
                  className="py-4 rounded-2xl bg-[#d3b673] text-black font-bold hover:bg-[#c4a55d] transition-all active:scale-95 shadow-[0_10px_20px_rgba(211,182,115,0.2)] text-sm"
                >
                  {t("cross_sell.no")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-6 pt-2 pb-4">
              <div className="w-full flex flex-col md:flex-row items-center gap-6 md:text-left">
                <div className="w-40 h-48 bg-white/5 rounded-3xl flex items-center justify-center p-4 relative shrink-0">
                  <Image 
                    src={tahiniProduct.image} 
                    alt={tahiniProduct.name} 
                    width={100} 
                    height={140} 
                    className="object-contain drop-shadow-2xl" 
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="inline-block px-3 py-1 rounded-full bg-[#d3b673]/10 border border-[#d3b673]/20 text-[#d3b673] text-[10px] uppercase tracking-widest font-bold mb-1">
                    {t("cross_sell.match")}
                  </div>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{tahiniProduct.name}</h3>
                  <p className="text-[#d3b673] font-bold text-xl">${tahiniProduct.price.toFixed(2)}</p>
                  <p className="text-white/40 text-xs leading-relaxed">
                    {t("cross_sell.tahini_desc")}
                  </p>
                </div>
              </div>

              <div className="w-full space-y-3 pt-6 border-t border-white/5">
                <button 
                  onClick={handleAddTahini}
                  className="w-full py-4 rounded-2xl bg-[#d3b673] text-black font-bold text-lg hover:bg-[#c4a55d] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(211,182,115,0.3)]"
                >
                  <Plus size={20} />
                  {t("cross_sell.add_and_checkout")}
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleViewDetails}
                      className="py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <ExternalLink size={16} />
                      {t("cross_sell.view_details")}
                    </button>
                    <button 
                      onClick={onProceed}
                      className="py-3 rounded-xl bg-white/5 border border-white/10 text-white/30 hover:text-white/60 transition-all text-sm font-medium"
                    >
                      {t("cross_sell.skip")}
                    </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(211, 182, 115, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
