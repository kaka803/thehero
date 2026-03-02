"use client";

import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, ShoppingBag, Trash2, Check } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

import { useRouter } from "next/navigation";
import { useProducts } from "@/context/ProductContext";
import { useLanguage } from "@/context/LanguageContext";
import CrossSellModal from "./CrossSellModal";

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { products } = useProducts();
  const { t } = useLanguage();
  const [checkedOut, setCheckedOut] = useState(false);
  const [showCrossSell, setShowCrossSell] = useState(false);
  const router = useRouter();
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  // Get products with special labels for cross-sell logic
  const tahiniInCart = cartItems.find(item => item.specialLabel === "tahini");
  const hasHummusInCart = cartItems.some(item => item.specialLabel === "hummus");

  useEffect(() => {
    if (!isCartOpen) {
      setTimeout(() => {
        setCheckedOut(false);
        setShowCrossSell(false);
      }, 500);
    }
  }, [isCartOpen]);

  const handleCheckout = () => {
    if (hasHummusInCart && !tahiniInCart && !showCrossSell) {
      setShowCrossSell(true);
      return;
    }

    setIsCartOpen(false);
    setTimeout(() => {
      router.push("/checkout");
    }, 400); // Close drawer animation first
  };

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, display: "block" });
      gsap.to(drawerRef.current, { x: 0, duration: 0.5, ease: "power3.out" });
    } else {
      document.body.style.overflow = "unset";
      gsap.to(drawerRef.current, { x: "100%", duration: 0.4, ease: "power3.in" });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, display: "none" });
    }
  }, [isCartOpen]);

  return (
    <>
      <CrossSellModal 
        isOpen={showCrossSell} 
        onClose={() => setShowCrossSell(false)} 
        onProceed={() => {
          setShowCrossSell(false);
          setIsCartOpen(false);
          setTimeout(() => router.push("/checkout"), 400);
        }}
      />
      {/* Overlay */}
      <div 
        ref={overlayRef}
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] hidden opacity-0"
      />

      {/* Drawer */}
      <div 
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white/10 backdrop-blur-2xl border-l border-white/20 z-[101] translate-x-full shadow-2xl flex flex-col"
      >

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d3b673]/20 flex items-center justify-center text-[#d3b673]">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t("cart.your_cart")}</h2>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">
                {t("cart.items_selected", { 
                  count: cartItems.length, 
                  items: cartItems.length === 1 ? t("cart.item") : t("cart.items") 
                }).replace("{count}", cartItems.length).replace("{items}", cartItems.length === 1 ? t("cart.item") : t("cart.items"))}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all font-bold"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                <ShoppingBag size={40} />
              </div>
              <div>
                <p className="text-lg font-bold text-white/60">{t("cart.empty")}</p>
                <p className="text-sm text-white/30">{t("cart.empty_desc")}</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
              >
                {t("cart.continue_shopping")}
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={`${item._id}-${item.variant}`} className="flex gap-4 group">
                <div className="w-20 h-24 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center p-2 group-hover:bg-white/10 transition-all relative shrink-0">
                  <Image src={item.image} alt={item.name} width={60} height={60} className="object-contain" />
                  <button 
                    onClick={() => removeFromCart(item._id, item.variant)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all scale-100 md:scale-75 md:group-hover:scale-100 font-bold"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{item.name}</h3>
                  <p className="text-[10px] text-[#d3b673] font-bold uppercase tracking-wider mb-2">
                    {item.variant === 'tray' ? t("cart.case") : t("cart.single")}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item._id, item.variant, item.quantity - 1)}
                        className="w-6 h-6 rounded-md flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-all font-bold"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-bold min-w-6 text-center text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, item.variant, item.quantity + 1)}
                        className="w-6 h-6 rounded-md flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-all font-bold"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="font-bold text-white">
                      ${(item.variant === 'tray' ? (item.price || 3.50) * 12 * 0.85 : (item.price || 3.50)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-8 border-t border-white/20 bg-white/5 space-y-6">
            {checkedOut ? (
              <div className="py-10 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 rounded-full bg-[#34d399]/20 flex items-center justify-center text-[#34d399] mx-auto">
                  <Check size={32} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{t("cart.order_placed")}</h3>
                  <p className="text-sm text-white/40">{t("cart.thanks")}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-white/60 text-sm">
                    <span>{t("cart.subtotal")}</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/60 text-sm">
                    <span>{t("cart.shipping")}</span>
                    <span className="text-[#34d399]">{t("cart.shipping_calc")}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-white/5">
                    <span className="text-lg font-bold text-white">{t("cart.total")}</span>
                    <span className="text-2xl font-bold text-[#d3b673]">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full bg-[#d3b673] hover:bg-[#c4a55d] text-black py-5 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(211,182,115,0.2)] font-bold"
                >
                  {t("cart.checkout")}
                  <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                    <Plus size={16} />
                  </div>
                </button>
                <p className="text-[10px] text-center text-white/20 uppercase tracking-[0.2em] font-bold">
                   {t("cart.powered_by")}
                </p>
              </>
            )}
          </div>
        )}
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
    </>
  );
}
