"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from "@/context/LanguageContext";

const ProductCard = ({ _id, name, description, details, image, color, status, ingredients }) => {
  const { t } = useLanguage();
  const isComingSoon = status?.toLowerCase().trim() === 'coming-soon';
  const productFeatures = ingredients || [];
  const productUrl = `/products/${_id}`;
  
  return (
    <div className={`group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 transition-all duration-500 overflow-hidden ${isComingSoon ? "cursor-default" : "hover:bg-white/10 hover:border-white/20"}`}>
      {/* Background Glow on Hover */}
      {!isComingSoon && (
        <div 
          className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-700 blur-[80px] pointer-events-none"
          style={{ backgroundColor: color }}
        ></div>
      )}

      {isComingSoon && (
        <div className="absolute top-6 right-6 z-20">
          <span className="bg-[#d3b673] text-black px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#d3b673]/20">
            {t("products.coming_soon")}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 relative z-10">
        {/* Product Image Container */}
        <div className="relative w-full sm:w-1/2 flex justify-center py-2">
          <div className="relative">
             {/* Dynamic Glow behind image on hover */}
            {!isComingSoon && (
              <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-60 transition-all duration-700 blur-[40px]"
                style={{ backgroundColor: color }}
              ></div>
            )}
            <div className={`relative z-10 transition-all duration-500 ${isComingSoon ? "blur-md grayscale opacity-50 scale-95" : "group-hover:scale-110 group-hover:-rotate-3"}`}>
              <Image 
                src={image} 
                alt={name} 
                width={240} 
                height={320} 
                className="w-auto h-56 md:h-72 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full sm:w-1/2 space-y-4 md:space-y-6">
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight ${isComingSoon ? "text-white/40" : ""}`} style={!isComingSoon ? { color: color } : {}}>
            {name}
          </h2>
          
          <div className="space-y-4">
            <p className={`text-lg leading-relaxed font-light ${isComingSoon ? "text-white/20" : "text-white/80"}`}>
              {description}
            </p>
            {!isComingSoon && (
              <p className="text-white/60 text-sm leading-relaxed italic">
                {details}
              </p>
            )}
          </div>

          {!isComingSoon && (
            <ul className="space-y-3">
              {productFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-white/90 font-medium">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                  {feature}
                </li>
              ))}
            </ul>
          )}

          {isComingSoon ? (
            <div className="w-full text-center py-4 rounded-xl bg-white/5 border border-white/10 text-white/40 font-bold uppercase tracking-widest cursor-not-allowed">
              {t("products.coming_soon")}
            </div>
          ) : (
            <Link href={productUrl} className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium transition-all duration-300 hover:bg-white/15 hover:scale-105 group/btn">
              <span>{t("products.learn_more")}</span>
              <svg 
                className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
