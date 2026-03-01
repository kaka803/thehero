"use client";

import { useProducts } from "@/context/ProductContext";
import { useLanguage } from "@/context/LanguageContext";
import ProductCard from "./ProductCard";

const Products = () => {
  const { products, loading } = useProducts();
  const { t } = useLanguage();

  return (
    <section className="py-24 max-w-[90rem] mx-auto px-6 md:px-12 space-y-16">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6 mb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="space-y-3">
          <h2 className="text-[#d3b673] uppercase tracking-[0.4em] text-xs font-black">{t("products.collection")}</h2>
          <h3 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
            {t("products.discover")} <span className="text-transparent bg-clip-text bg-linear-to-r from-white via-[#d3b673] to-white/40">{t("products.premium")}</span> {t("products.flavors")}
          </h3>
        </div>
        <p className="text-white/40 text-lg md:text-xl leading-relaxed font-medium">
          {t("products.description")}
        </p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-px bg-linear-to-r from-transparent to-[#d3b673]"></div>
          <div className="w-2 h-2 rounded-full bg-[#d3b673] shadow-[0_0_10px_#d3b673]"></div>
          <div className="w-12 h-px bg-linear-to-l from-transparent to-[#d3b673]"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {loading ? (
             <div className="col-span-full py-20 text-center text-white/40">{t("products.loading")}</div>
        ) : products.length === 0 ? (
            <div className="col-span-full py-20 text-center text-white/40">{t("products.empty")}</div>
        ) : (
            products.map((product) => (
                <ProductCard key={product._id} {...product} />
            ))
        )}
      </div>
    </section>
  );
};

export default Products;
