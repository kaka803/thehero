"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const HeroSlider = () => {
  const { t } = useLanguage();
  
  const slides = [
    {
      id: 1,
      title: t("hero.hummus_title"),
      subtitle: t("hero.hummus_title"), // Used for the marquee
      productImg: "/hummus-hero.png",
      bgPattern: "/chickpeas-bg.png",
      ingredientsClass: "chickpea",
      bgColor: "#d4b86a",
      textColor: "#3e4c2f",
      accentColor: "#f0d9a1",
      description: t("hero.hummus_desc"),
      key: "hummus"
    },
    {
      id: 2,
      title: t("hero.tahini_title"),
      subtitle: t("hero.tahini_title"),
      productImg: "/tahini-hero.png",
      bgPattern: "/sesame-bg.png",
      ingredientsClass: "sesame",
      bgColor: "#d1a850",
      textColor: "#4a3c18",
      accentColor: "#fdf6e3",
      description: t("hero.tahini_desc"),
      key: "tahini"
    },
    {
      id: 3,
      title: "Fuul Hero",
      subtitle: "FUUL HERO",
      productImg: "/fuul.png",
      bgPattern: "/sesame-bg.png",
      ingredientsClass: "chickpea",
      bgColor: "#d4b86a",
      textColor: "#3e4c2f",
      accentColor: "#f0d9a1",
      description: "coming soon",
      isComingSoon: true,
      key: "fuul"
    },
    {
      id: 4,
      title: "Baba Hero",
      subtitle: "BABA HERO",
      productImg: "/baba.png",
      bgPattern: "/sesame-bg.png",
      ingredientsClass: "chickpea",
      bgColor: "#d4b86a",
      textColor: "#3e4c2f",
      accentColor: "#f0d9a1",
      description: "coming soon",
      isComingSoon: true,
      key: "baba"
    }
    
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const contentRef = useRef(null);
  const imageRef = useRef(null);
  const backgroundRef = useRef(null);
  const ingredientsRef = useRef(null);
  const marqueeRef = useRef(null);

  useEffect(() => {
    // Initial animation
    gsap.fromTo(
      contentRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
    );
    gsap.fromTo(
      imageRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.2, ease: "elastic.out(1, 0.75)" },
    );

    // Continuous Marquee animation for background text
    gsap.to(marqueeRef.current, {
      xPercent: -50,
      ease: "none",
      duration: 25, // Control the speed of marquee here
      repeat: -1,
    });

    // Custom floating logic for ingredients
    const elements = gsap.utils.toArray(".ingredient-item");
    elements.forEach((el, index) => {
      const durationY = gsap.utils.random(3, 5);
      const durationX = gsap.utils.random(4, 6);
      const durationRot = gsap.utils.random(5, 7);
      
      gsap.to(el, {
        y: `random(-40, 40)`,
        duration: durationY,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: index * 0.1
      });

      gsap.to(el, {
        x: `random(-40, 40)`,
        duration: durationX,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: index * 0.2
      });

      gsap.to(el, {
        rotation: `random(-45, 45)`,
        duration: durationRot,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });
  }, []);

  const slideTo = (index) => {
    if (index === currentSlide) return;

    const tl = gsap.timeline();
    const isNext =
      index > currentSlide ||
      (index === 0 && currentSlide === slides.length - 1);
    
    // dir determines direction of standard slides: 1 goes "forward/next", -1 goes "backward/prev"
    const dir = isNext ? 1 : -1;

    // Outgoing animation
    tl.to(
      contentRef.current,
      {
        x: -dir * 600, // Move offscreen opposite to incoming direction
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut",
      }
    )
    .to(
      backgroundRef.current,
      {
        opacity: 0,
        duration: 0.5,
      },
      "-=0.5",
    )
    .add(() => {
      setCurrentSlide(index);
    })
    // Incoming animation
    .fromTo(
      backgroundRef.current,
      { opacity: 0, scale: 1.1 },
      { opacity: 0.6, scale: 1, duration: 0.8, ease: "power2.out" },
    )
    .fromTo(
      contentRef.current,
      { x: dir * 600, opacity: 0 }, // Come from the other side
      { x: 0, opacity: 1, duration: 0.8, ease: "back.out(1.1)" },
      "-=0.6",
    );
  };

  const nextSlide = () => {
    slideTo((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    slideTo((currentSlide - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <div
      ref={sliderRef}
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-start transition-colors duration-1000 pt-32 md:pt-28"
      style={{
        background: "radial-gradient(circle, #a8943f 0%, #83732c 60%, #4a4119 100%)"
      }}
    >
      {/* Background Pattern */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: `url(${slide.bgPattern})`,
          filter: "blur(2px) contrast(1.1) brightness(0.6)",
        }}
      ></div>

      {/* Earthy Vignette */}
      <div className="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>

      {/* Marquee Background Text */}
      <div className="absolute inset-0 flex items-center justify-center z-5 overflow-hidden opacity-20 pointer-events-none select-none">
        <div ref={marqueeRef} className="flex whitespace-nowrap items-center">
          {[...Array(8)].map((_, i) => (
             <h2
             key={i}
             className="text-[15vw] md:text-[20vw] font-black uppercase tracking-tighter mx-10"
             style={{
               color: "transparent",
               WebkitTextStroke: `1.5px rgba(255,255,255,0.4)`,
               fontFamily: "serif",
             }}
           >
             {t(`hero.${slide.key || (slide.id === 1 ? 'hummus' : 'tahini')}.bg_text`)}
           </h2>
          ))}
        </div>
      </div>

      {/* Headlines Content */}
      <div className={`relative z-30 w-full max-w-5xl px-6 text-center ${slide.isComingSoon ? 'grow flex flex-col items-center justify-center mt-12 md:mt-0' : 'mb-4 md:mb-4'}`}>
        <h1 
          className="text-white text-2xl md:text-3xl font-serif italic leading-[1.2] mb-3 drop-shadow-lg max-w-3xl mx-auto"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {t(`hero.${slide.key || (slide.id === 1 ? 'hummus' : 'tahini')}.headline`)}
        </h1>
        <p className="text-white/80 text-[10px] md:text-lg font-medium tracking-wide drop-shadow-md leading-relaxed px-4">
          {t(`hero.${slide.key || (slide.id === 1 ? 'hummus' : 'tahini')}.subheadline`)}
        </p>

        {slide.isComingSoon && (
          <div className="mt-6 space-y-4">
            <h2 className="text-white text-xl md:text-4xl font-bold drop-shadow-lg">
              {t(`hero.${slide.key}.h2`)}
            </h2>
            <p className="text-white/90 text-sm md:text-xl font-medium max-w-2xl mx-auto italic">
              {t(`hero.${slide.key}.claim`)}
            </p>
          </div>
        )}
      </div>

      {/* Main Product Section */}
      <div 
        ref={contentRef} 
        className={slide.isComingSoon 
          ? "absolute inset-0 z-10 flex items-center justify-center pointer-events-none" 
          : "relative z-20 flex flex-col items-center justify-center flex-grow -mt-4 md:-mt-6"}
      >
        <div
          ref={imageRef}
          className={`relative flex items-center justify-center transition-all duration-700 ${
            slide.isComingSoon 
              ? "w-[280px] h-[45vh] md:w-[500px] md:h-[500px] xl:w-[550px] xl:h-[550px] opacity-90 mt-12" 
              : "w-[240px] h-[44vh] min-h-[280px] max-h-[400px] md:w-[350px] md:h-[350px] xl:w-[350px] xl:h-[350px]"
          }`}
        >
          {/* Product Image */}
          <div
            className="w-full h-full relative"
            style={{
              filter: slide.isComingSoon ? "none" : "drop-shadow(0 30px 50px rgba(0,0,0,0.6))",
            }}
          >
            <img
              src={slide.productImg}
              alt={slide.title}
              className={`w-full h-full object-contain transition-transform duration-700 hover:scale-[1.05] ${slide.isComingSoon ? 'blur-lg opacity-80 brightness-90 grayscale-[0.2]' : ''}`}
            />
          </div>

          {/* Floating Ingredients (Sesame Seeds / Chickpeas) */}
          {!slide.isComingSoon && (
            <div
              ref={ingredientsRef}
              className="absolute inset-[-50%] z-[-1] pointer-events-none"
            >
              {[...Array(slide.id === 1 ? 15 : 20)].map((_, i) => (
                <div
                  key={i}
                  className="ingredient-item absolute opacity-80"
                  style={{
                    width: slide.id === 1 ? `${Math.random() * 10 + 6}px` : `${Math.random() * 5 + 2}px`,
                    height: slide.id === 1 ? `${Math.random() * 10 + 6}px` : `${Math.random() * 8 + 4}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    backgroundColor: slide.id === 1 ? "#e1c699" : "#f5e6cc",
                    borderRadius: slide.id === 1 ? "40% 60% 70% 30% / 50% 40% 60% 50%" : "60% 40% 40% 60% / 80% 80% 30% 30%",
                    boxShadow: "inset -1px -1px 3px rgba(0,0,0,0.3), 2px 2px 5px rgba(0,0,0,0.2)",
                    filter: i % 5 === 0 ? "blur(3px)" : i % 3 === 0 ? "blur(1px)" : "none",
                    transform: `rotate(${Math.random() * 360}deg)`,
                    zIndex: i % 4 === 0 ? 40 : -1 // Scattered depth
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="relative z-40 mb-30 md:mb-16">
        <a href="/products">
          <button
            className="px-8 py-3 md:px-10 md:py-3.5 rounded-full uppercase tracking-[0.2em] font-bold text-xs md:text-sm transition-all duration-300 hover:scale-[1.05] hover:brightness-110 active:scale-95 shadow-2xl"
            style={{
              backgroundColor: "#d4b86a",
              color: "#3e4c2f",
            }}
          >
            {slide.isComingSoon ? t(`hero.${slide.key}.button`) || t("hero.discover") : t("hero.discover")}
          </button>
        </a>
      </div>

      {/* Navigation Controls */}
      <div className="absolute z-40 left-2 md:left-8 top-1/2 transform -translate-y-1/2">
        <button
          onClick={prevSlide}
          className="w-8 h-8 md:w-14 md:h-14 rounded-full border border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-all hover:scale-110"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="absolute z-40 right-2 md:right-8 top-1/2 transform -translate-y-1/2">
        <button
          onClick={nextSlide}
          className="w-8 h-8 md:w-14 md:h-14 rounded-full border border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/10 transition-all hover:scale-110"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Slide Indicators - Thumbnail Style Fixed Bottom Left */}
      <div className="fixed bottom-6 md:bottom-12 left-4 md:left-12 flex flex-row gap-2 md:gap-3 z-50">
        {slides.map((s, index) => (
          <button
            key={index}
            onClick={() => slideTo(index)}
            className={`relative flex items-center justify-center rounded-lg md:rounded-xl transition-all duration-300 overflow-hidden ${
              currentSlide === index
                ? "bg-white/20 backdrop-blur-md border border-white/50 shadow-xl scale-110 p-1 md:p-1.5"
                : "bg-black/30 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:scale-105 opacity-60 hover:opacity-100 p-0.5 md:p-1"
            }`}
          >
            <div className="w-8 h-8 md:w-12 md:h-12 bg-white/10 rounded-md md:rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src={s.productImg} 
                alt={s.title} 
                className="w-full h-full object-contain p-0.5 md:p-1 drop-shadow-md"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Footer Text Overlay */}
      <div className="absolute bottom-4 right-4 md:bottom-10 md:right-12 z-50 text-right max-w-[150px] md:max-w-md pointer-events-none opacity-60 md:opacity-100">
        <p className="text-white/80 text-[8px] md:text-sm font-medium tracking-tight leading-relaxed drop-shadow-md">
          {t(`hero.${slide.key || (slide.id === 1 ? 'hummus' : 'tahini')}.footer`)}
        </p>
      </div>
    </div>
  );
};

export default HeroSlider;
