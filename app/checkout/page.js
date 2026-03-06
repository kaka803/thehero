"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Truck, ShieldCheck, ShoppingBag, CheckCircle2, Gift, Star, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { lang: currentLang, t } = useLanguage();
  const router = useRouter();
  console.log("CheckoutPage Render - currentLang:", currentLang); // Debug log
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderCount, setOrderCount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(0);
  const [isCheckingLoyalty, setIsCheckingLoyalty] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    country: "Germany",
    zipCode: "",
    phone: "",
  });

  const [discountPercentage, setDiscountPercentage] = useState(20);
  const [shippingFee, setShippingFee] = useState(0);

  // Fetch shipping fee on mount
  useEffect(() => {
    const fetchShippingFee = async () => {
      try {
        const res = await fetch("/api/admin/settings?key=shippingFee");
        const data = await res.json();
        if (data.success && data.value !== null) {
          setShippingFee(data.value);
        }
      } catch (error) {
        console.error("Shipping Fee Fetch Error:", error);
      }
    };
    fetchShippingFee();
  }, []);

  // Calculate if this would be a reward order (every 5th)
  useEffect(() => {
    const checkLoyalty = async () => {
      if (formData.email && formData.email.includes("@")) {
        setIsCheckingLoyalty(true);
        try {
          const res = await fetch(`/api/checkout?email=${formData.email}`);
          const data = await res.json();
          if (data.success) {
            setOrderCount(data.orderCount);
            
            // Fetch the dynamic discount percentage
            const settingsRes = await fetch("/api/admin/settings?key=loyaltyDiscount");
            const settingsData = await settingsRes.json();
            const pct = settingsData.value || 20;
            setDiscountPercentage(pct);

            // If the next order is 5, 10, 15... apply discount
            if ((data.orderCount + 1) % 5 === 0) {
              setDiscountApplied(cartTotal * (pct / 100)); 
            } else {
              setDiscountApplied(0);
            }
          }
        } catch (error) {
          console.error("Loyalty Check Error:", error);
        } finally {
          setIsCheckingLoyalty(false);
        }
      }
    };

    const timer = setTimeout(checkLoyalty, 1000);
    return () => clearTimeout(timer);
  }, [formData.email, cartTotal]);

  const subtotalWithTax = cartTotal + cartItems.reduce((acc, item) => {
    const basePrice = item.variant === 'tray' ? (item.price * 12 * 0.85) : item.price;
    return acc + (basePrice * (item.taxRate / 100) * item.quantity);
  }, 0);

  const finalTotal = subtotalWithTax - discountApplied + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (orderSuccess) {
      const g = require("gsap").default;
      g.fromTo(".loyalty-bubble", 
        { scale: 0, opacity: 0, rotation: -45 }, 
        { scale: 1.1, opacity: 1, rotation: 0, duration: 0.8, stagger: 0.15, ease: "back.out(1.7)" }
      );
      
      // Secondary "stamp" effect animation for the current one
      const currentIdx = (orderCount % 5 === 0 ? 5 : orderCount % 5) - 1;
      setTimeout(() => {
        g.to(`.loyalty-bubble:nth-child(${currentIdx + 1})`, {
           scale: 1,
           duration: 0.2,
           ease: "power2.inOut"
        });
      }, 1000);
    }
  }, [orderSuccess, orderCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const itemsWithTax = cartItems.map(item => {
        const itemPrice = item.variant === 'tray' ? (item.price * 12 * 0.85) : item.price;
        const taxRate = item.taxRate || 0;
        const taxAmountValue = (itemPrice * (taxRate / 100)) * item.quantity;
        return {
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: itemPrice,
          variant: item.variant,
          image: item.image,
          taxAmount: taxAmountValue
        };
      });

      const totalTax = itemsWithTax.reduce((acc, item) => acc + (item.taxAmount || 0), 0);
      const totalToPay = (cartTotal + totalTax) - discountApplied;

      const orderData = {
        email: formData.email,
        customerInfo: formData,
        items: itemsWithTax,
        subtotal: cartTotal + totalTax, // Subtotal usually includes tax in this context if we are adding it
        discountAmount: discountApplied,
        shippingFee: shippingFee,
        total: totalToPay,
        isDiscounted: discountApplied > 0,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (data.success) {
        setOrderSuccess(data.order);
        setOrderCount(data.orderCount);
        clearCart();
        window.scrollTo(0, 0);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    const currentProgress = orderCount % 5 === 0 ? 5 : orderCount % 5;
    
    return (
      <main className="min-h-screen relative overflow-hidden text-white" style={{ background: "radial-gradient(circle, #a8943f 0%, #83732c 60%, #4a4119 100%)" }}>
        <Navbar />
        <div className="pt-40 pb-20 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-[#d3b673]/20 flex items-center justify-center text-[#d3b673] mb-8 animate-bounce">
            <CheckCircle2 size={64} />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter">{t("checkout.success.title")}</h1>
          <p className="text-white/60 mb-12 text-lg">{t("checkout.success.thanks")} <span className="text-white font-bold">{orderSuccess.invoiceNumber || `#HERO-${orderSuccess._id.slice(-6).toUpperCase()}`}</span></p>

          <div className="w-full bg-black/30 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 mb-12 space-y-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#d3b673]/10 blur-[100px] rounded-full"></div>
             
             <div className="relative z-10 space-y-4">
               <div className="flex items-center justify-center gap-3 text-[#d3b673]">
                 <Star size={20} fill="#d3b673" />
                 <h2 className="text-xl font-bold uppercase tracking-widest">{t("checkout.success.loyalty_progress")}</h2>
                 <Star size={20} fill="#d3b673" />
               </div>
               <p className="text-white/40 text-sm italic">{t("checkout.success.loyalty_desc").replace("{pct}", discountPercentage)}</p>
             </div>

             <div className="flex items-center justify-between max-w-md mx-auto relative z-10 px-2 lg:px-4">
                {[1, 2, 3, 4, 5].map((step) => {
                  const isCompleted = step <= currentProgress;
                  const isCurrent = step === currentProgress;
                  const isReward = step === 5;

                  return (
                    <div key={step} className="flex flex-col items-center gap-4 relative">
                      <div 
                        className={`loyalty-bubble w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl relative overflow-hidden ${
                          isCompleted 
                            ? "bg-white text-black scale-110 shadow-[#d3b673]/40" 
                            : "bg-white/5 border border-white/10 text-white/20"
                        } ${isCurrent ? "ring-4 ring-[#d3b673]/50" : ""}`}
                      >
                        {isCompleted ? (
                          <div className="relative w-full h-full p-2 animate-in zoom-in duration-500">
                             <Image 
                               src="/logo.png" 
                               alt="Stamp" 
                               width={40} 
                               height={40} 
                               className="w-full h-full object-contain" 
                             />
                             {isReward && (
                               <div className="absolute inset-0 bg-[#d3b673]/10 animate-pulse"></div>
                             )}
                          </div>
                        ) : isReward ? (
                          <Gift size={24} className="opacity-40" />
                        ) : (
                          <span className="text-sm font-black italic">{step}</span>
                        )}
                      </div>
                      {isCurrent && (
                         <div className="absolute -bottom-8 whitespace-nowrap text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#d3b673] animate-pulse">
                            {t("checkout.success.current_order")}
                         </div>
                      )}
                    </div>
                  );
                })}
                <div className="absolute top-6 left-6 right-6 md:top-8 md:left-8 md:right-8 h-[2px] bg-white/10 -z-10"></div>
                <div 
                  className="absolute top-6 left-6 md:top-8 md:left-8 h-[2px] bg-[#d3b673] -z-10 transition-all duration-1000 shadow-[0_0_15px_#d3b673]"
                  style={{ width: `${((currentProgress - 1) / 4) * 100}%` }}
                ></div>
             </div>

             {orderCount % 5 === 0 ? (
                <div className="pt-4 animate-in fade-in slide-in-from-bottom duration-1000">
                  <div className="inline-flex items-center gap-3 bg-[#d3b673]/20 border border-[#d3b673]/30 px-6 py-3 rounded-full text-[#d3b673] font-bold">
                    <PartyPopper size={20} />
                    <span>{t("checkout.success.reward_unlocked").replace("{pct}", discountPercentage)}</span>
                  </div>
                </div>
             ) : (
                <p className="text-white/60 font-medium">
                  {t("checkout.success.reward_remaining")
                    .replace("{count}", (5 - (orderCount % 5)))
                    .replace("{s}", (5 - (orderCount % 5)) !== 1 ? (currentLang === 'de' ? 'en' : 's') : '')}
                </p>
             )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link href="/" className="bg-[#d3b673] text-black px-12 py-5 rounded-2xl font-bold hover:bg-[#c4a55d] transition-all shadow-xl shadow-[#d3b673]/20 text-lg uppercase tracking-tight">
              {t("checkout.success.return_home")}
            </Link>
            <Link href="/products" className="bg-white/5 border border-white/10 text-white px-12 py-5 rounded-2xl font-bold hover:bg-white/10 transition-all text-lg uppercase tracking-tight">
              {t("checkout.success.continue_shopping")}
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen relative overflow-hidden" style={{ background: "radial-gradient(circle, #a8943f 0%, #83732c 60%, #4a4119 100%)" }}>
        <Navbar />
        <div className="pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-6 font-bold">
            <ShoppingBag size={48} />
          </div>
          <h1 className="text-3xl font-bold mb-4">{t("checkout.empty_state.title")}</h1>
          <p className="text-white/40 mb-8 max-w-md">{t("checkout.empty_state.desc")}</p>
          <Link href="/products" className="bg-[#d3b673] text-black px-8 py-4 rounded-2xl font-bold hover:bg-[#c4a55d] transition-all">
            {t("checkout.empty_state.browse")}
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen relative text-white overflow-hidden" style={{ background: "radial-gradient(circle, #a8943f 0%, #83732c 60%, #4a4119 100%)" }}>
      <Navbar />
      
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="flex-1 space-y-10">
            <div className="flex items-center gap-4 mb-2">
               <Link href="/products" className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                 <ArrowLeft size={20} />
               </Link>
               <div>
                 <h1 className="text-3xl font-bold tracking-tight">{t("checkout.title")}</h1>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              <section className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#d3b673]/20 flex items-center justify-center text-[#d3b673] text-sm">1</span>
                    {t("checkout.contact_info")}
                  </h2>
                </div>
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{t("checkout.email")}</label>
                  <input 
                    type="email" name="email" required value={formData.email} onChange={handleChange}
                    placeholder={t("checkout.email_placeholder")}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#d3b673] transition-all"
                  />
                  {isCheckingLoyalty && (
                     <div className="absolute right-4 bottom-4">
                        <div className="w-4 h-4 border-2 border-[#d3b673]/30 border-t-[#d3b673] rounded-full animate-spin"></div>
                     </div>
                  )}
                  {!isCheckingLoyalty && orderCount > 0 && (
                     <p className="absolute right-4 bottom-4 text-[10px] uppercase font-bold text-[#d3b673] tracking-widest">
                        {t("checkout.prev_orders").replace("{count}", orderCount).replace("{s}", orderCount > 1 ? (currentLang === 'de' ? 'en' : 's') : '')}
                     </p>
                  )}
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#d3b673]/20 flex items-center justify-center text-[#d3b673] text-sm">2</span>
                  {t("checkout.shipping_address")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{t("checkout.first_name")}</label>
                    <input 
                      type="text" name="firstName" required value={formData.firstName} onChange={handleChange}
                      placeholder="Jane"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#d3b673] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{t("checkout.last_name")}</label>
                    <input 
                      type="text" name="lastName" required value={formData.lastName} onChange={handleChange}
                      placeholder="Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#d3b673] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{t("checkout.address")}</label>
                  <input 
                    type="text" name="address" required value={formData.address} onChange={handleChange}
                    placeholder={t("checkout.address_placeholder")}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#d3b673] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{t("checkout.apartment")}</label>
                  <input 
                    type="text" name="apartment" value={formData.apartment} onChange={handleChange}
                    placeholder="Apt 4B"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#d3b673] transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{t("checkout.city")}</label>
                    <input 
                      type="text" name="city" required value={formData.city} onChange={handleChange}
                      placeholder="New York"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#d3b673] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{t("checkout.zip")}</label>
                    <input 
                      type="text" name="zipCode" required value={formData.zipCode} onChange={handleChange}
                      placeholder="10001"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#d3b673] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{t("checkout.phone")}</label>
                  <input 
                    type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#d3b673] transition-all"
                  />
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#d3b673]/20 flex items-center justify-center text-[#d3b673] text-sm">3</span>
                  {t("checkout.shipping_method")}
                </h2>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#d3b673]">
                         <Truck size={24} />
                      </div>
                      <div>
                         <p className="font-bold">{t("checkout.standard_shipping")}</p>
                         <p className="text-sm text-white/40">{t("checkout.business_days")}</p>
                      </div>
                   </div>
                   <p className={`font-bold ${shippingFee === 0 ? 'text-[#34d399]' : 'text-white'}`}>
                     {shippingFee === 0 ? t("checkout.free") : `$${shippingFee.toFixed(2)}`}
                   </p>
                </div>
              </section>

              <div className="bg-[#d3b673]/5 border border-[#d3b673]/20 rounded-3xl p-6 flex gap-4">
                 <ShieldCheck className="text-[#d3b673] shrink-0" size={24} />
                 <div>
                    <p className="font-bold text-[#d3b673]">{t("checkout.secure_checkout")}</p>
                    <p className="text-sm text-white/60">{t("checkout.secure_desc")}</p>
                 </div>
              </div>

               <button 
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-[#d3b673] text-black py-6 rounded-2xl font-bold text-xl uppercase tracking-widest hover:bg-[#c4a55d] transition-all active:scale-[0.98] shadow-2xl shadow-[#d3b673]/20 flex items-center justify-center gap-4 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                   <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin"></div>
                ) : (
                   `${t("checkout.complete_purchase")} • $${finalTotal.toFixed(2)}`
                )}
              </button>
              
              {discountApplied > 0 && (
                 <p className="text-center text-[#d3b673] font-bold animate-pulse uppercase tracking-widest text-xs">
                    {t("checkout.loyalty_applied").replace("{amount}", discountApplied.toFixed(2))}
                 </p>
              )}
            </form>
          </div>

          <div className="lg:w-[450px]">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl p-8 space-y-8">
                <h2 className="text-2xl font-bold tracking-tight border-b border-white/10 pb-6">{t("checkout.order_summary")}</h2>
                
                {/* Loyalty Progress indicator in summary */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{(orderCount % 5) || 0}/5 {t("admin.sidebar.orders")}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                     {[1, 2, 3, 4, 5].map((step) => {
                        const isCompleted = step <= (orderCount % 5);
                        const isReward = step === 5;
                        return (
                           <div key={step} className="flex-1 h-1.5 rounded-full relative overflow-hidden bg-white/10">
                              <div className={`absolute inset-0 transition-all duration-1000 ${isCompleted ? 'bg-[#d3b673]' : ''}`}></div>
                              {isReward && <div className="absolute inset-0 border border-[#d3b673]/30 rounded-full animate-pulse"></div>}
                           </div>
                        )
                     })}
                  </div>
                  {(orderCount + 1) % 5 === 0 ? (
                     <p className="text-[10px] font-bold text-[#34d399] uppercase tracking-tighter leading-tight italic animate-pulse">
                        <Star className="inline mr-1" size={10} fill="#34d399" />
                        {t("checkout.reward_eligible")}
                     </p>
                  ) : (
                     <p className="text-[10px] text-white/40 font-medium italic">
                        {t("checkout.reward_remaining").replace("{count}", (5 - (orderCount % 5))).replace("{pct}", discountPercentage)}
                     </p>
                  )}
                </div>

                {/* Product List */}
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 pt-2 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={`${item._id}-${item.variant}`} className="flex gap-4 mt-2">
                      <div className="relative w-20 h-24 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center p-2 shrink-0">
                        <Image src={item.image} alt={item.name} width={60} height={60} className="object-contain" />
                        <span className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-[#d3b673] text-black rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 space-y-1 py-1">
                        <h3 className="font-bold text-white text-lg leading-none">{item.name}</h3>
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] text-[#d3b673] font-bold uppercase tracking-wider">
                            {item.variant === 'tray' ? t("cart.case") : t("cart.single")}
                          </p>
                          {item.taxRate > 0 && (
                            <span className="text-[10px] text-white/40 font-bold bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                              Tax: {item.taxRate}%
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-end mt-2">
                           <div>
                              <p className="text-white/40 text-xs font-medium">Qty: {item.quantity}</p>
                              {item.taxRate > 0 && (
                                <p className="text-[9px] text-[#d3b673]/60 font-bold uppercase h-3">
                                  + Tax: ${((item.variant === 'tray' ? (item.price * 12 * 0.85) : item.price) * (item.taxRate / 100) * item.quantity).toFixed(2)}
                                </p>
                              )}
                           </div>
                           <p className="font-bold text-white">
                             ${((item.quantity * (item.variant === 'tray' ? (item.price) * 12 * 0.85 : (item.price))) + ((item.variant === 'tray' ? (item.price * 12 * 0.85) : item.price) * (item.taxRate / 100) * item.quantity)).toFixed(2)}
                           </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                 <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex justify-between text-white/60 text-sm font-medium">
                    <span>{t("cart.subtotal")}</span>
                    <span className="font-bold">${cartTotal.toFixed(2)}</span>
                  </div>
                  {discountApplied > 0 && (
                    <div className="flex justify-between text-[#d3b673] text-sm font-bold animate-pulse">
                      <span className="flex items-center gap-2"><Star size={14} fill="#d3b673" /> {t("checkout.loyalty_reward")} ({discountPercentage}%)</span>
                      <span>-${discountApplied.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/60 text-sm font-medium">
                    <span>{t("cart.shipping")}</span>
                    <span className={`font-bold ${shippingFee === 0 ? 'text-[#34d399] uppercase tracking-widest text-[10px]' : ''}`}>
                      {shippingFee === 0 ? t("checkout.free") : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/60 text-sm pb-2 font-medium">
                    <span>{t("checkout.taxes")}</span>
                    <span className="font-bold">
                      ${cartItems.reduce((acc, item) => {
                        const basePrice = item.variant === 'tray' ? (item.price * 12 * 0.85) : item.price;
                        return acc + (basePrice * (item.taxRate / 100) * item.quantity);
                      }, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-white/20">
                    <div>
                        <p className="text-lg font-bold text-white">{t("cart.total")}</p>
                        <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">{t("checkout.including_vat")}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-[#d3b673]">
                          ${finalTotal.toFixed(2)}
                        </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder={t("checkout.discount_code")}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#d3b673] transition-all"
                  />
                  <button className="bg-white/10 hover:bg-white/20 px-6 rounded-xl text-xs font-bold transition-all uppercase tracking-widest">{t("checkout.apply")}</button>
                </div>
              </div>

              <div className="px-4 sm:px-8 space-y-6">
                 <div className="flex items-center justify-center lg:justify-start gap-3 text-white/40">
                    <ShieldCheck size={18} className="text-[#34d399]" />
                    <p className="text-[11px] font-medium tracking-wide uppercase">{t("checkout.ssl_secure")}</p>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />

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
    </main>
  );
}
