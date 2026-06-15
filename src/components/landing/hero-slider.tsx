"use client";

import { sliderContent } from "@/data/products";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sliderContent.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden" style={{ paddingTop: "42.6953125%" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={sliderContent[activeIndex].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <Image
            src={sliderContent[activeIndex].image}
            alt={sliderContent[activeIndex].title}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center" style={{ left: "4%" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${sliderContent[activeIndex].id}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-white"
            style={{ width: "38%" }}
          >
            <p
              className="mb-5 font-medium uppercase tracking-[3px] text-white/90"
              style={{ fontSize: "clamp(10px, 1.2vw, 12px)", letterSpacing: "3px" }}
            >
              {sliderContent[activeIndex].label}
            </p>
            <h1
              className="font-bold leading-tight text-white"
              style={{ fontSize: "clamp(20px, 2.8vw, 40px)", marginBottom: "30px" }}
            >
              {sliderContent[activeIndex].title}
            </h1>
            <p
              className="mb-8 max-w-md text-white/80"
              style={{ fontSize: "clamp(12px, 1.4vw, 14px)" }}
            >
              {sliderContent[activeIndex].description}
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-[#fdc402] px-8 py-3 text-sm font-bold uppercase tracking-wide text-black transition hover:bg-black hover:text-white"
            >
              Learn More
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {sliderContent.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setActiveIndex(index)}
            className="transition-all"
            style={{
              width: activeIndex === index ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              backgroundColor: activeIndex === index ? "#fdc402" : "rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
