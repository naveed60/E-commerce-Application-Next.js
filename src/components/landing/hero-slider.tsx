"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const slides = [
  {
    image: "/shopkart/hero-tech.png",
    alt: "Headphones, smartwatch and smartphone collection",
    eyebrow: "New collection 2026",
    title: "Upgrade Your Everyday",
    description: "Top brands. Great prices. Better you.",
    button: "Shop Electronics",
    href: "#featured-products",
    overlay: "from-[#e6f2fe]/95 via-[#e6f2fe]/45",
    accent: "#087df1",
  },
  {
    image: "/shopkart/hero-home-living.png",
    alt: "Sage armchair, lamp and side table collection",
    eyebrow: "Home refresh",
    title: "Make Home Feel New",
    description: "Fresh comfort and thoughtful design for every room.",
    button: "Explore Home",
    href: "#home-&-living",
    overlay: "from-[#eafaf6]/95 via-[#eafaf6]/42",
    accent: "#07896b",
  },
  {
    image: "/shopkart/hero-fashion-sport.png",
    alt: "Running shoes, backpack and activewear collection",
    eyebrow: "Fresh arrivals",
    title: "Move In Your Style",
    description: "Everyday fashion made for wherever life takes you.",
    button: "Shop New Styles",
    href: "#featured-products",
    overlay: "from-[#fff1e9]/95 via-[#fff1e9]/40",
    accent: "#e95543",
  },
];

const AUTOPLAY_MS = 5500;

export function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  }, []);

  const previous = useCallback(() => setActiveIndex((current) => (current - 1 + slides.length) % slides.length), []);
  const next = useCallback(() => setActiveIndex((current) => (current + 1) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(next, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [next, paused]);

  return (
    <section className="shop-container px-4 pt-4 lg:px-6" aria-label="Featured collections">
      <div
        className="group relative min-h-[330px] overflow-hidden rounded-xl bg-[#dcebfa] outline-none sm:min-h-[390px]"
        role="region"
        aria-roledescription="carousel"
        aria-label="ShopKart featured products"
        tabIndex={0}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") previous();
          if (event.key === "ArrowRight") next();
        }}
        onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
          if (Math.abs(distance) > 45) {
            if (distance > 0) previous();
            else next();
          }
          touchStartX.current = null;
        }}
      >
        {slides.map((slide, index) => (
          <article
            key={slide.image}
            className={`absolute inset-0 transition-all duration-700 ease-out ${index === activeIndex ? "z-10 opacity-100" : "pointer-events-none z-0 scale-[1.015] opacity-0"}`}
            aria-hidden={index !== activeIndex}
            aria-label={`Slide ${index + 1} of ${slides.length}`}
          >
            <Image src={slide.image} alt={slide.alt} fill priority={index === 0} sizes="(max-width: 1280px) 100vw, 1240px" className="object-cover object-center" />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay} to-transparent`} />
            <div className="relative z-10 flex min-h-[330px] max-w-[570px] flex-col justify-center px-7 py-12 sm:min-h-[390px] sm:px-14">
              <span className="mb-3 text-sm font-bold uppercase tracking-[0.16em]" style={{ color: slide.accent }}>{slide.eyebrow}</span>
              <h2 className="max-w-[470px] text-[38px] font-black leading-[1.02] tracking-[-0.04em] text-[#071526] sm:text-[55px]">{slide.title}</h2>
              <p className="mt-4 max-w-[450px] text-[16px] text-[#344054] sm:text-lg">{slide.description}</p>
              <a href={slide.href} className="mt-7 inline-flex w-fit items-center rounded-md px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(8,125,241,.20)] transition hover:-translate-y-0.5 hover:brightness-95" style={{ backgroundColor: slide.accent }}>{slide.button}</a>
            </div>
          </article>
        ))}

        <button type="button" onClick={previous} aria-label="Previous slide" className="absolute left-3 top-1/2 z-20 grid h-11 w-11 -translate-x-2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#071526] opacity-0 shadow-lg backdrop-blur transition hover:bg-white hover:text-[#087df1] focus:translate-x-0 focus:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 sm:left-5"><ChevronLeft className="h-5 w-5" /></button>
        <button type="button" onClick={next} aria-label="Next slide" className="absolute right-3 top-1/2 z-20 grid h-11 w-11 translate-x-2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#071526] opacity-0 shadow-lg backdrop-blur transition hover:bg-white hover:text-[#087df1] focus:translate-x-0 focus:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 sm:right-5"><ChevronRight className="h-5 w-5" /></button>

        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/30 px-2.5 py-2 backdrop-blur-sm" role="tablist" aria-label="Choose featured slide">
          {slides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show slide ${index + 1}: ${slide.title}`}
              onClick={() => goTo(index)}
              className="h-2.5 rounded-full transition-all duration-300"
              style={{ width: index === activeIndex ? 28 : 10, backgroundColor: index === activeIndex ? slide.accent : "rgba(255,255,255,.9)" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
