"use client";

import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0f2e26] text-white">
      <div className="mx-auto px-8 py-16" style={{ maxWidth: "1500px" }}>
        <div className="mb-12 grid gap-12 lg:grid-cols-2">
          <div className="max-w-[385px]">
            <Image
              src="/nextshop-logo-v2.png"
              alt="NextShop"
              width={130}
              height={35}
              className="mb-5 h-auto"
            />
            <p className="mb-6 text-[12px] leading-relaxed text-white/70">
              Minicom is a premium Shopify theme designed specifically for furniture stores, interior design brands, and home decor retailers who value clean design and a seamless shopping experience.
            </p>
            <div className="flex gap-3">
              {["facebook", "twitter", "instagram", "pinterest"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#fdc402] hover:text-black"
                  aria-label={social}
                >
                  {social === "facebook" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  )}
                  {social === "twitter" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                  )}
                  {social === "instagram" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  )}
                  {social === "pinterest" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-10 grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-[1.6rem] font-bold text-white">SUBSCRIBE NEWSLETTER</h4>
                <p className="text-[10px] font-medium uppercase tracking-[1px] text-white/60">STAY UPDATED WITH THE LATEST TRENDS</p>
              </div>
              <div>
                <form className="flex border border-white/30 bg-transparent">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/50"
                  />
                  <button
                    type="submit"
                    className="bg-white px-6 text-sm font-bold uppercase tracking-wide text-black transition hover:bg-[#fdc402]"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <h5 className="mb-4 text-[1.6rem] font-bold text-white">CUSTOMER CARE</h5>
                <ul className="space-y-3">
                  {["My Account", "Track Order", "Wishlist", "Customer Service", "Returns/Exchange"].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-[11px] font-normal uppercase tracking-wide text-white/70 transition hover:text-[#fdc402]">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="mb-4 text-[1.6rem] font-bold text-white">HELP & SUPPORT</h5>
                <ul className="space-y-3">
                  {["Shipping Information", "Payment Options", "Size Guide", "FAQ's", "Contact Us"].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-[11px] font-normal uppercase tracking-wide text-white/70 transition hover:text-[#fdc402]">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="mb-4 text-[1.6rem] font-bold text-white">COMPANY INFO</h5>
                <ul className="space-y-3">
                  {["About Us", "Careers", "Store Locations", "Affiliate Program", "Blog"].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-[11px] font-normal uppercase tracking-wide text-white/70 transition hover:text-[#fdc402]">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/20 pt-8 md:flex-row">
          <p className="text-[11px] text-white/60">
            COPYRIGHT &copy; {new Date().getFullYear()} NEXT-SHOP. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-3 text-white/40">
            <svg width="38" height="24" viewBox="0 0 38 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="0.5" y="0.5" width="37" height="23" rx="2"/><circle cx="14" cy="12" r="5" fill="currentColor" opacity="0.4"/><circle cx="24" cy="12" r="5" fill="currentColor" opacity="0.4"/></svg>
            <svg width="38" height="24" viewBox="0 0 38 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="0.5" y="0.5" width="37" height="23" rx="2"/><text x="8" y="16" fontSize="9" fill="currentColor" opacity="0.5" fontWeight="bold">VISA</text></svg>
            <svg width="38" height="24" viewBox="0 0 38 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="0.5" y="0.5" width="37" height="23" rx="2"/><text x="5" y="16" fontSize="7" fill="currentColor" opacity="0.5" fontWeight="bold">MC</text></svg>
            <svg width="38" height="24" viewBox="0 0 38 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="0.5" y="0.5" width="37" height="23" rx="2"/><text x="5" y="16" fontSize="7" fill="currentColor" opacity="0.5" fontWeight="bold">PP</text></svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
