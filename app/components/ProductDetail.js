"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Check, Minus, Plus, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useLanguage } from "@/context/LanguageContext";
import { useProducts } from "@/context/ProductContext";
import CrossSellModal from './CrossSellModal';
import Script from "next/script";

const ProductDetail = ({ product }) => {
  const { t } = useLanguage();
  const [variant, setVariant] = useState('single');
  const [quantity, setQuantity] = useState(1);
  const [showCrossSell, setShowCrossSell] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'cart' or 'checkout'
  const [openFaq, setOpenFaq] = useState(null);
  const { addToCart, cartItems } = useCart();
  const { products } = useProducts();
  const router = useRouter();

  // Determine FAQ category based on product name
  const productName = product.name.toLowerCase();
  
  // Robust hummus check
  const isHummusProduct = product.specialLabel === 'hummus' || 
                          productName.includes('hummus') || 
                          productName.includes('humous');

  const faqCategory = productName.includes('hummus') ? 'hummus' : 
                      productName.includes('baba') ? 'baba' : 
                      productName.includes('foul') ? 'foul' : null;

  const faqs = faqCategory ? t(`faq.${faqCategory}`) : [];

  // Schema Markup
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "The Hero Levant Line"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price || 3.50,
      "priceCurrency": "USD",
      "availability": product.status === "live" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  const faqJsonLd = faqCategory && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  } : null;

  const isComingSoon = product.status?.toLowerCase().trim() === 'coming-soon';

  const increment = () => setQuantity(prev => (prev < 99 ? prev + 1 : prev));
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : prev));

  const handleAddToCart = () => {
    addToCart(product, quantity, variant);
  };

  const handleBuyNow = () => {
    const hasTahiniInCart = cartItems.some(item => {
      // It's Tahini if it has the label, OR if the name has tahini/sesam AND it's NOT a hummus product
      if (item.specialLabel === 'tahini') return true;
      
      const nameStr = item.name?.toLowerCase() || "";
      const hasTahiniKeywords = nameStr.includes("tahini") || nameStr.includes("tahin") || nameStr.includes("sesam");
      const isActuallyHummus = item.specialLabel === "hummus" || nameStr.includes("hummus") || nameStr.includes("humous");
      
      return hasTahiniKeywords && !isActuallyHummus;
    });

    let tahiniProduct = products?.find((p) => 
      p.specialLabel === "tahini" || 
      p.name?.toLowerCase().includes("tahin") ||
      p.name?.toLowerCase().includes("sesam")
    );
    
    // Fallback if no exact Tahini is found, find any non-hummus product to ensure popup works
    if (!tahiniProduct && products && products.length > 0) {
      tahiniProduct = products.find(p => 
        p.specialLabel !== 'hummus' && 
        !p.name?.toLowerCase().includes('hummus') && 
        !p.name?.toLowerCase().includes('humous')
      );
    }

    console.log("Buy Now Debug:", { isHummusProduct, hasTahiniInCart, tahiniProductFound: !!tahiniProduct });

    if (isHummusProduct && !hasTahiniInCart && tahiniProduct) {
      setPendingAction('checkout');
      setShowCrossSell(true);
      return;
    }

    addToCart(product, quantity, variant, false);
    router.push('/checkout');
  };

  const handleCrossSellProceed = () => {
    setShowCrossSell(false);
    if (pendingAction === 'checkout') {
      addToCart(product, quantity, variant, false);
      router.push('/checkout');
    } else {
      addToCart(product, quantity, variant);
    }
    setPendingAction(null);
  };

  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Back Link */}
      <Link 
        href="/products" 
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-12 group"
      >
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to overview</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left: Product Image with Glow */}
        <div className="relative flex justify-center py-10">
          <div className="relative">
            {/* Large Radial Glow Effect */}
            <div 
              className="absolute inset-0 rounded-full blur-[100px] opacity-40 animate-pulse pointer-events-none"
              style={{ backgroundColor: product.color }}
            ></div>
            <div className={`relative z-10 ${isComingSoon ? "blur-md opacity-70" : ""}`}>
              <Image 
                src={product.image} 
                alt={product.name} 
                width={450} 
                height={600} 
                className="w-auto h-[400px] md:h-[550px] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
                priority
              />
            </div>
          </div>
        </div>

        {/* Right: Product Info & Purchase */}
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight uppercase" style={{ color: product.color }}>
                {product.name}
              </h1>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                <p className="text-[#d3b673] font-bold text-2xl">${product.price}</p>
                <p className="text-white/20 text-[10px] uppercase tracking-tighter text-right">Per Packet</p>
              </div>
            </div>
            <p className="text-white/80 text-lg leading-relaxed font-light max-w-xl">
              {product.longDescription || product.description}
            </p>
          </div>

          {/* Quick Stats Badges removed per user request */}

          {/* Order Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">{t("product_detail.select_option")}</h3>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-8 backdrop-blur-md relative overflow-hidden">
               {/* Background Glow */}
               <div 
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none"
                style={{ backgroundColor: product.color }}
              ></div>

              <div className="space-y-4 relative z-10">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{t("product_detail.pack_size")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Single Variant */}
                  <button 
                    onClick={() => setVariant('single')}
                    className={`relative p-5 rounded-2xl border text-left transition-all ${
                      variant === 'single' 
                      ? 'bg-white/10 border-[#d3b673] shadow-[0_0_20px_rgba(211,182,115,0.2)]' 
                      : 'bg-transparent border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-white">{t("product_detail.single_packet")}</p>
                        <p className="text-sm text-white/60">{t("product_detail.unit_size")}</p>
                      </div>
                      {variant === 'single' && (
                          <div className="w-5 h-5 bg-[#d3b673] rounded-full flex items-center justify-center">
                              <Check size={12} className="text-black" strokeWidth={3} />
                          </div>
                      )}
                    </div>
                  </button>

                  {/* Tray Variant */}
                  <button 
                    onClick={() => setVariant('tray')}
                    className={`relative p-5 rounded-2xl border text-left transition-all ${
                      variant === 'tray' 
                      ? 'bg-white/10 border-[#d3b673] shadow-[0_0_20px_rgba(211,182,115,0.2)]' 
                      : 'bg-transparent border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-white">{t("product_detail.tray_packet")}</p>
                        <p className="text-sm text-white/60">{t("product_detail.save_bulk")}</p>
                      </div>
                      {variant === 'tray' && (
                          <div className="w-5 h-5 bg-[#d3b673] rounded-full flex items-center justify-center">
                              <Check size={12} className="text-black" strokeWidth={3} />
                          </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{t("product_detail.quantity")}</p>
                  <p className="text-xs text-white/60">{t("product_detail.max_units")}</p>
                </div>
                <div className="flex items-center gap-4 bg-black/20 border border-white/10 rounded-2xl p-2 w-fit">
                  <button 
                    onClick={decrement}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="text-xl font-bold min-w-12 text-center text-white">{quantity}</span>
                  <button 
                    onClick={increment}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Total Price Display */}
              <div className="flex justify-between items-center py-4 border-t border-white/10 relative z-10">
                <p className="text-sm text-white/40 uppercase tracking-widest font-bold">{t("product_detail.total_amount")}</p>
                <p className="text-2xl font-bold text-white">
                    ${(quantity * (variant === 'tray' ? (product.price) * 12 * 0.85 : (product.price))).toFixed(2)}
                </p>
              </div>

              <div className="space-y-3 relative z-10 pt-4">
                {!isComingSoon ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleAddToCart}
                      className="py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold tracking-wide transition-all active:scale-95"
                    >
                      {t("product_detail.add_to_cart")}
                    </button>
                    <button 
                      onClick={handleBuyNow}
                      className="py-4 rounded-xl bg-[#d3b673] hover:bg-[#c4a55d] text-black font-bold tracking-wide transition-all active:scale-95 shadow-lg shadow-[#d3b673]/20"
                    >
                      {t("product_detail.buy_now")}
                    </button>
                  </div>
                ) : (
                  <button disabled className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white/40 font-bold tracking-wide opacity-50 cursor-not-allowed">
                    {t("product_detail.coming_soon")}
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-white/40 text-[11px] relative z-10">
                  <span className="w-1 h-1 rounded-full bg-white/40"></span>
                  {t("product_detail.shipping_info")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients Section */}
      <div className="mt-24 space-y-6">
          <h3 className="text-2xl font-bold text-white">{t("product_detail.ingredients")}</h3>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="bg-white/5 p-5 border-b border-white/10">
                  <p className="font-bold text-white/80">{t("product_detail.product_desc_prefix", { name: product.name })}</p>
              </div>
              <div className="p-8">
                  <p className="text-white/60 leading-relaxed max-w-3xl">
                      {product.details || "—"}
                  </p>
              </div>
          </div>
      </div>

      {/* Nutrition Section */}
      <div className="mt-16 space-y-6">
          <h3 className="text-2xl font-bold text-white">{t("product_detail.nutrition_title")}</h3>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="bg-white/5 p-5 border-b border-white/10 text-center">
                  <p className="font-bold text-white/80">{t("product_detail.nutrition_info")}</p>
              </div>
              <div className="p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-6 text-center">
                      {[
                          { label: t('product_detail.energy_kcal'), value: product.nutrition?.energyKcal || '—' },
                          { label: t('product_detail.energy_kj'), value: product.nutrition?.energyKj || '—' },
                          { label: t('product_detail.fat'), value: product.nutrition?.fat || '—' },
                          { label: t('product_detail.saturated_fat'), value: product.nutrition?.saturatedFat || '—' },
                          { label: t('product_detail.carbohydrates'), value: product.nutrition?.carbohydrates || '—' },
                          { label: t('product_detail.sugar'), value: product.nutrition?.sugar || '—' },
                          { label: t('product_detail.protein'), value: product.nutrition?.protein || '—' },
                          { label: t('product_detail.salt'), value: product.nutrition?.salt || '—' },
                          { label: t('product_detail.fiber'), value: product.nutrition?.fiber || '—' },
                      ].map((item, idx) => (
                          <div key={idx} className="space-y-1">
                              <p className="text-white font-bold text-sm tracking-tight">{item.value}</p>
                              <p className="text-white/40 text-[9px] uppercase leading-tight font-medium">{item.label}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>

      {/* FAQ Section */}
      {faqCategory && faqs.length > 0 && (
        <div className="mt-24 space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#d3b673] text-[10px] font-bold tracking-[0.3em] uppercase">
              <HelpCircle size={14} />
              <span>{t("faq.title")}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">{t("faq.title")}</h2>
          </div>

          <div className="space-y-4">
             {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md transition-all">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-6 md:p-8 flex items-center justify-between text-left group"
                  >
                    <span className="text-lg md:text-xl font-bold group-hover:text-[#d3b673] transition-colors">{faq.q}</span>
                    {openFaq === idx ? <ChevronUp className="text-[#d3b673]" /> : <ChevronDown className="text-white/20" />}
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 md:px-8 pb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                       <p className="text-white/60 leading-relaxed text-lg">
                         {faq.a}
                       </p>
                    </div>
                  )}
                </div>
             ))}
          </div>
        </div>
      )}

      <CrossSellModal 
        isOpen={showCrossSell} 
        onClose={() => {
          setShowCrossSell(false);
          setPendingAction(null);
        }} 
        onProceed={handleCrossSellProceed}
      />

      {/* Structured Data Scripts */}
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
    </div>
  );
};

export default ProductDetail;
