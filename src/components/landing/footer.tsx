"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Github } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";

const footerLinks = {
    shop: [
        { label: "Collections", href: "#" },
        { label: "Essentials", href: "#" },
        { label: "Accessories", href: "#" },
        { label: "Latest Drops", href: "#" },
    ],
    company: [
        { label: "About Us", href: "#" },
        { label: "Sustainability", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Terms of Service", href: "#" },
    ],
    support: [
        { label: "Contact", href: "#" },
        { label: "Shipping & Returns", href: "#" },
        { label: "FAQ", href: "#" },
        { label: "Privacy Policy", href: "#" },
    ],
};

export function Footer() {
    return (
        <Reveal y={24} duration={0.5}>
    <footer className="mt-12 rounded-[32px] border border-slate-800 bg-slate-900 p-10 shadow-[0_-4px_40px_rgba(0,0,0,0.18)]">
            <div className="mx-auto">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link href="/nextshop" className="text-xl font-semibold tracking-tight text-white">
                            next<span className="text-blue-400">shop</span>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                            Curated essentials for the modern creative. Designed with precision, built for longevity.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <SocialLink href="#" icon={<Twitter className="h-4 w-4" />} label="Twitter" />
                            <SocialLink href="#" icon={<Instagram className="h-4 w-4" />} label="Instagram" />
                            <SocialLink href="#" icon={<Facebook className="h-4 w-4" />} label="Facebook" />
                            <SocialLink href="#" icon={<Github className="h-4 w-4" />} label="GitHub" />
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Shop</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            {footerLinks.shop.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Company</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Support</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            {footerLinks.support.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-16 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} NextShop Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-slate-300 transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-slate-300 transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-slate-300 transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    </Reveal>
    );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="rounded-full bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
            aria-label={label}
        >
            {icon}
        </Link>
    );
}
