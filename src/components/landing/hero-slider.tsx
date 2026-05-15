"use client";

import { sliderContent } from "@/data/products";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sliderContent.length);
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-[40px] border border-zinc-100 bg-white shadow-xl">
      <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col justify-between space-y-6"
        >
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
              className="text-xs uppercase tracking-[0.3em] text-zinc-400"
            >
              {sliderContent[activeIndex].label}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
              className="mt-4 text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl"
            >
              {sliderContent[activeIndex].title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22, ease: "easeOut" }}
              className="mt-4 text-base text-zinc-600"
            >
              {sliderContent[activeIndex].description}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32, ease: "easeOut" }}
            className="flex flex-wrap gap-3"
          >
            <Button size="lg">Shop collection</Button>
            <Button variant="outline" size="lg">
              Build your kit
            </Button>
          </motion.div>
          <div className="flex gap-2">
            {sliderContent.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition",
                  activeIndex === index
                    ? "bg-[oklch(0.58_0.15_256.18)]"
                    : "bg-zinc-200",
                )}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.18, ease: "easeOut" }}
          className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-zinc-100"
        >
          <Image
            src={sliderContent[activeIndex].image}
            alt={sliderContent[activeIndex].title}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            priority
            className="object-cover transition-transform duration-700"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
