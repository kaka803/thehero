"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, ShoppingCart, User, Search, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const { lang, switchLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { searchQuery, setSearchQuery, filteredProducts } = useProducts();
  const searchInputRef = useRef(null);

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scrolling when search or mobile menu is open
  useEffect(() => {
    if (isSearchOpen || mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      if (isSearchOpen) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSearchOpen, mobileMenuOpen]);


  const navLinks = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.shop"), href: "/products" },
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.contact"), href: "/contact" },
  ];

  return (
    <>
      {/* Search Overlay - Moved outside <nav> to prevent being trapped by nav height/transforms */}
      <div 
        className={`fixed inset-0 bg-black/95 backdrop-blur-3xl z-[110] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isSearchOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <button 
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery("");
          }}
          className="absolute top-8 right-8 md:top-12 md:right-12 w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-500 hover:rotate-90 z-70"
        >
          <X size={28} />
        </button>
        
        <div className="h-full flex flex-col items-center pt-32 md:pt-48 px-6 overflow-y-auto custom-scrollbar">
          <div className={`w-full max-w-4xl transition-all duration-700 delay-100 ${isSearchOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}>
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#d3b673]" size={32} />
              <input 
                ref={searchInputRef}
                type="text"
                placeholder={t("nav.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border-b-2 border-white/10 py-8 pl-20 pr-8 text-3xl md:text-5xl font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-[#d3b673] transition-all duration-500"
              />
            </div>

            {/* Search Results */}
            <div className="mt-12 mb-20">
              {searchQuery.trim() === "" ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <p className="text-white/20 uppercase tracking-[0.2em] text-xs font-bold text-center">{t("nav.popular_searches")}</p>
                  <div className="flex flex-wrap gap-4 items-center justify-center">
                    {["Tropical", "Mango", "Natural", "Low Sugar", "Coconut"].map((tag) => (
                      <button 
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm hover:text-white hover:bg-[#d3b673] hover:border-[#d3b673] transition-all duration-300 font-medium"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <p className="text-white/40 text-sm font-medium">
                      {t("nav.showing_results").replace("{count}", filteredProducts.length).replace("{query}", searchQuery)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {filteredProducts.slice(0, 6).map((product) => (
                      <a 
                        key={product._id}
                        href={`/products/${product._id}`}
                        className="group/item flex items-center gap-6 p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#d3b673]/30 transition-all duration-300"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <div className="w-20 h-24 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 group-hover/item:scale-105 transition-transform duration-500">
                          <Image 
                            src={product.image} 
                            alt={product.name} 
                            width={60} 
                            height={80} 
                            className="object-contain h-16 w-auto drop-shadow-2xl"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xl md:text-2xl font-bold text-white group-hover/item:text-[#d3b673] transition-colors">{product.name}</h4>
                          <p className="text-white/40 text-sm line-clamp-1 mt-1">{product.description}</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-[#d3b673] font-bold text-xs uppercase tracking-widest opacity-0 group-hover/item:opacity-100 transition-all translate-x-4 group-hover/item:translate-x-0">
                          <span>{t("nav.view_product")}</span>
                          <X size={14} className="rotate-45" />
                        </div>
                      </a>
                    ))}

                    {filteredProducts.length === 0 && (
                      <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/5">
                        <p className="text-white/20 text-xl">{t("nav.no_results").replace("{query}", searchQuery)}</p>
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="mt-4 text-[#d3b673] hover:underline font-bold"
                        >
                          {t("nav.clear_search")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav 
        className={`fixed top-0 left-0 w-full z-100 transition-all duration-500 ease-in-out ${
          scrolled || mobileMenuOpen
            ? "bg-white/10 backdrop-blur-2xl py-3 shadow-[0_8px_32px_rgba(255,255,255,0.05)]" 
            : "bg-transparent py-5 md:py-8"
        }`}
      >


        <div className="max-w-[90rem] mx-auto px-6 md:px-12 flex items-center justify-between h-18">
          
          <Link href="/" className="flex items-center gap-3 cursor-pointer z-50 group">
            <Image 
              src="/logo.png" 
              alt="FoodBrand Logo" 
              width={120} 
              height={40} 
              className="h-25 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center bg-white/5 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/10 shadow-lg transition-all duration-500 ${scrolled ? 'gap-4 px-6' : 'gap-8 px-10'}`}>
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                className="text-white/70 hover:text-white text-[15px] font-medium transition-all duration-300 relative group py-2 px-3 rounded-full hover:bg-white/5"
              >
                <span className="relative z-10">{link.name}</span>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#d3b673] rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-[-4px]"></span>
              </a>
            ))}
          </div>

          {/* Action Icons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <button 
              onClick={() => switchLanguage(lang === 'en' ? 'de' : 'en')}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 group relative"
              title={lang === 'en' ? 'Switch to German' : 'Auf Englisch umstellen'}
            >
              <Globe size={18} strokeWidth={2.5} />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase font-bold tracking-widest whitespace-nowrap">
                {lang === 'en' ? 'DE' : 'EN'}
              </span>
            </button>



            <button 
              onClick={() => setIsSearchOpen(true)}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all duration-300 hover:scale-105"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all duration-300 hover:scale-105 relative group"
            >
              <ShoppingCart size={18} strokeWidth={2.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#d3b673] shadow-lg text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold tracking-tighter group-hover:animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden z-50 flex items-center gap-3">
            <button 
               onClick={() => setIsSearchOpen(true)}
               className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-lg"
            >
              <Search size={22} strokeWidth={2.5} />
            </button>
            <button 
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:outline-none transition-transform active:scale-95 shadow-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
          className={`fixed top-0 left-0 w-full h-screen bg-[#0a0a0a]/90 backdrop-blur-[100px] flex flex-col items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-40 origin-top overflow-hidden border-b border-white/10 ${
            mobileMenuOpen ? "opacity-100 visible scale-y-100" : "opacity-0 invisible scale-y-0"
          }`}
        >



          <div className="flex flex-col items-center gap-6 text-center w-full px-6 max-w-sm mt-10">
            {navLinks.map((link, i) => (
              <a 
                key={link.name}
                href={link.href}
                className={`text-white/80 text-xl font-medium hover:text-[#d3b673] transition-all duration-500 w-full py-4 border-b border-white/5 relative overflow-hidden group ${mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                style={{
                  transitionDelay: mobileMenuOpen ? `${i * 100}ms` : '0ms',
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="relative z-10">{link.name}</span>
                <span className="absolute inset-0 w-full h-full bg-white/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out"></span>
              </a>
            ))}
            
            <div 
              className={`flex items-center gap-2 mt-4 p-1 bg-white/5 border border-white/10 rounded-full transition-all duration-700 ease-out ${mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
              style={{
                transitionDelay: `${navLinks.length * 100}ms`,
              }}
            >
                <button 
                 onClick={() => switchLanguage(lang === 'en' ? 'de' : 'en')}
                 className="flex items-center gap-3 px-8 py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold transition-all active:scale-95"
                >
                 <Globe size={18} />
                 <span className="text-xs tracking-widest uppercase">{lang === 'en' ? 'Switch to DE' : 'Auf EN umstellen'}</span>
                </button>


            </div>

            <div 
              className={`flex gap-5 mt-4 transition-all duration-700 ease-out ${mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
              style={{
                transitionDelay: mobileMenuOpen ? `${navLinks.length * 100}ms` : '0ms',
              }}
            >
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="flex items-center justify-center w-14 h-14 text-white/80 hover:text-[#d3b673] bg-white/5 border border-white/10 rounded-full transition-all hover:scale-110 relative shadow-lg"
              >
                <ShoppingCart size={22} strokeWidth={2.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#d3b673] text-black text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
