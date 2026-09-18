"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { ShopKartLogo } from "./primary-header";

const columns = [
  { title: "Shop", links: ["All Products", "New Arrivals", "Best Sellers", "Deals"] },
  { title: "Help", links: ["Track Order", "Returns & Refunds", "Shipping Info", "FAQs"] },
  { title: "About", links: ["Our Story", "Careers", "Terms & Conditions", "Privacy Policy"] },
];

export function Footer() {
  return (
    <footer className="bg-[#071c31] text-white">
      <div className="shop-container px-5 pb-5 pt-10 lg:px-6">
        <div className="grid gap-10 pb-9 sm:grid-cols-2 lg:grid-cols-[1.35fr_repeat(3,1fr)]">
          <div>
            <div className="mb-3 text-[25px]"><ShopKartLogo inverted /></div>
            <p className="text-sm text-white/65">Shop Smarter, Live Better.</p>
            <div className="mt-6 flex gap-3">
              {[Facebook, Instagram, Youtube, Linkedin].map((Icon, index) => <a key={index} href="#" aria-label="Social media" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-[#087df1] hover:text-white"><Icon className="h-4 w-4" /></a>)}
            </div>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-bold text-white">{column.title}</h3>
              <ul className="space-y-2.5">{column.links.map((link) => <li key={link}><Link href="#" className="text-sm text-white/65 transition hover:text-white">{link}</Link></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/15 pt-5 text-center text-xs text-white/55">© {new Date().getFullYear()} ShopKart. All rights reserved.</div>
      </div>
    </footer>
  );
}
