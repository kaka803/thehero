"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const HeroSlider = () => {
  const { t } = useLanguage();
  
  const slides = [
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
    },
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
    },
    
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
      className="relative w-full h-screen overflow-hidden flex items-center justify-center transition-colors duration-1000"
      style={{
        background: "radial-gradient(circle, #a8943f 0%, #83732c 60%, #4a4119 100%)"
      }}
    >
      {/* Dynamic Background Image per slide - Reverted to initial working logic */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 opacity-60 mix-blend-screen"
        style={{
          backgroundImage: `url(${slide.bgPattern})`,
          filter: "blur(5px) contrast(1.2) brightness(0.4)",
        }}
      ></div>

      {/* Embedded Marquee background text behind everything */}
      <div className="absolute inset-0 flex items-center justify-center z-10 overflow-hidden opacity-30 pointer-events-none select-none">
        <div ref={marqueeRef} className="flex whitespace-nowrap items-center">
          {/* Duplicate texts to create continuous scrolling effect */}
          {[...Array(6)].map((_, i) => (
             <h1
             key={i}
             className="text-[18vw] md:text-[22vw] font-black uppercase tracking-tight mx-8"
             style={{
               color: "transparent",
               WebkitTextStroke: `4px ${slide.accentColor}`,
               filter: 'drop-shadow(0px 0px 10px rgba(255,255,255,0.2))',
               fontFamily: "serif",
             }}
           >
             {slide.title} • {slide.subtitle} • 
           </h1>
          ))}
        </div>
      </div>

      {/* Main Centered Content (Image & Button) */}
      <div 
        ref={contentRef} 
        className="relative z-20 flex flex-col items-center justify-center h-full w-full max-w-5xl px-4 mt-8"
      >
        <div
          ref={imageRef}
          className="relative md:mb-7 w-[400px] h-[550px] md:w-[500px] md:h-[500px] drop-shadow-xl z-30 flex items-center justify-center"
        >
          {/* The product image itself */}
          <div
            className="w-full h-full relative"
            style={{
              filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))",
            }}
          >
            <img
              src={slide.productImg}
              alt={`${slide.title}`}
              className={`w-full h-full object-contain transition-transform duration-700 hover:scale-[1.08] ${
                slide.id === 1 ? 'scale-[1.05] -translate-x-2 md:-translate-x-2' : 'scale-100'
              }`}
            />
          </div>

          {/* Floating Ingredients generated around the product */}
          <div
            ref={ingredientsRef}
            className="absolute inset-0 z-[-1] pointer-events-none"
          >
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="ingredient-item absolute bg-contain bg-no-repeat bg-center opacity-90"
                style={{
                  width: `${Math.random() * 50 + 20}px`,
                  height: `${Math.random() * 50 + 20}px`,
                  // Spread wider around the centered image
                  top: `${Math.random() * 120 - 10}%`,
                  left: `${Math.random() * 140 - 20}%`,
                  backgroundColor: slide.id === 1 ? "#e1c699" : "#f0d9a1",
                  borderRadius: slide.id === 1 ? "50%" : "50% 50% 30% 70%",
                  boxShadow: "inset -5px -5px 10px rgba(0,0,0,0.2)",
                  filter: i % 4 === 0 ? "blur(4px)" : i % 3 === 0 ? "blur(2px)" : "none", // Only blur, no darkening
                  transform: `scale(${i % 2 === 0 ? 0.8 : 1.2})`,
                  zIndex: i % 2 === 0 ? 40 : -10 // Some in front, some behind
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Button Centered Near Bottom (Where Pagination Used to Be) */}
      <div className="absolute bottom-35 md:bottom-10 left-1/2 transform -translate-x-1/2 z-40">
        <button
          className="px-6 py-2.5 md:px-8 md:py-3 rounded-full uppercase tracking-[0.15em] font-semibold text-sm md:text-base transition-all duration-300 hover:scale-[1.05] active:scale-95 whitespace-nowrap"
          style={{
            backgroundColor: slide.bgColor,
            color: slide.textColor,
            boxShadow: `0 8px 20px -8px ${slide.bgColor}`,
          }}
        >
          {t("hero.discover")}
        </button>
      </div>

      {/* Navigation Controls */}
      <div className="absolute z-40 left-4 md:left-10 top-1/2 transform -translate-y-1/2 cursor-pointer">
        <button
          onClick={prevSlide}
          className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
      </div>

      <div className="absolute z-40 right-4 md:right-10 top-1/2 transform -translate-y-1/2 cursor-pointer">
        <button
          onClick={nextSlide}
          className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Slide Indicators - Thumbnail Style Fixed Bottom Left */}
      <div className="fixed bottom-8 md:bottom-12 left-4 md:left-12 flex flex-row gap-3 z-50">
        {slides.map((s, index) => (
          <button
            key={index}
            onClick={() => slideTo(index)}
            className={`relative flex items-center justify-center rounded-xl transition-all duration-300 overflow-hidden ${
              currentSlide === index
                ? "bg-white/20 backdrop-blur-md border border-white/50 shadow-xl scale-110 p-1.5"
                : "bg-black/30 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:scale-105 opacity-60 hover:opacity-100 p-1"
            }`}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src={s.productImg} 
                alt={s.title} 
                className="w-full h-full object-contain p-1 drop-shadow-md"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Slide Description - Fixed Bottom Right */}
      <div className="fixed bottom-8 md:bottom-12 right-4 md:right-12 z-50 flex items-center justify-end max-w-[200px] md:max-w-[300px] text-right pointer-events-none">
        <p className="text-white/80 text-xs md:text-sm font-light leading-relaxed drop-shadow-md">
          {slide.description}
        </p>
      </div>
    </div>
  );
};

export default HeroSlider;
