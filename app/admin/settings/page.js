"use client";

import { useState, useEffect } from "react";
import { Settings, Save, RefreshCw, Star, Info, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(20);
  const [shippingFee, setShippingFee] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [loyaltyRes, shippingRes] = await Promise.all([
        fetch("/api/admin/settings?key=loyaltyDiscount"),
        fetch("/api/admin/settings?key=shippingFee")
      ]);
      
      const loyaltyData = await loyaltyRes.json();
      const shippingData = await shippingRes.json();

      if (loyaltyData.success && loyaltyData.value !== null) {
        setLoyaltyDiscount(loyaltyData.value);
      }
      if (shippingData.success && shippingData.value !== null) {
        setShippingFee(shippingData.value);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const [loyaltyRes, shippingRes] = await Promise.all([
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "loyaltyDiscount", value: Number(loyaltyDiscount) }),
        }),
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "shippingFee", value: Number(shippingFee) }),
        })
      ]);

      const loyaltyData = await loyaltyRes.json();
      const shippingData = await shippingRes.json();

      if (loyaltyData.success && shippingData.success) {
        setMessage({ type: "success", text: t("admin.settings.success") });
      } else {
        setMessage({ type: "error", text: t("admin.settings.error") });
      }
    } catch (error) {
      setMessage({ type: "error", text: t("admin.settings.something_wrong") });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("admin.settings.title")}</h1>
        <p className="text-white/40 text-sm mt-1">{t("admin.settings.subtitle")}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#d3b673]/20 border-t-[#d3b673] rounded-full animate-spin"></div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          {/* Loyalty Settings Card */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d3b673]/5 blur-[100px] rounded-full transition-all group-hover:bg-[#d3b673]/10"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-10">
              <div className="w-full md:w-1/3 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#d3b673]/10 flex items-center justify-center text-[#d3b673]">
                  <Star size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">{t("admin.settings.loyalty_title")}</h3>
                  <p className="text-sm text-white/40 leading-relaxed mt-2">{t("admin.settings.loyalty_desc")}</p>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">{t("admin.settings.discount_percent")}</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={loyaltyDiscount}
                      onChange={(e) => setLoyaltyDiscount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-2xl font-black text-[#d3b673] focus:outline-none focus:border-[#d3b673] transition-all"
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-white/20 select-none">%</div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4">
                  <Info className="text-[#d3b673] shrink-0" size={20} />
                  <p className="text-xs text-white/60 leading-relaxed">
                    {t("admin.settings.example").replace("{val}", <span className="text-white font-bold">{loyaltyDiscount}</span>).replace("{pay}", Number(100 - (100 * (loyaltyDiscount / 100))).toFixed(0))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Fee Settings Card */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d3b673]/5 blur-[100px] rounded-full transition-all group-hover:bg-[#d3b673]/10"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-10">
              <div className="w-full md:w-1/3 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#d3b673]/10 flex items-center justify-center text-[#d3b673]">
                  <Settings size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">{t("admin.settings.shipping_title")}</h3>
                  <p className="text-sm text-white/40 leading-relaxed mt-2">{t("admin.settings.shipping_desc")}</p>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">{t("admin.settings.shipping_fee_label")}</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-2xl font-black text-[#d3b673] focus:outline-none focus:border-[#d3b673] transition-all"
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-white/20 select-none">$</div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4">
                  <Info className="text-[#d3b673] shrink-0" size={20} />
                  <p className="text-xs text-white/60 leading-relaxed">
                    {t("admin.settings.shipping_info")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              type="submit"
              disabled={saving}
              className="px-10 py-5 bg-[#d3b673] text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#c4a55d] transition-all active:scale-95 shadow-xl shadow-[#d3b673]/20 flex items-center justify-center gap-3"
            >
              {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? t("admin.settings.saving") : t("admin.settings.save_changes")}
            </button>

            {message && (
              <div className={`flex items-center gap-2 animate-in fade-in slide-in-from-left duration-300 ${message.type === 'success' ? 'text-[#34d399]' : 'text-red-400'}`}>
                {message.type === 'success' && <CheckCircle2 size={20} />}
                <span className="text-sm font-bold uppercase tracking-widest">{message.text}</span>
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
