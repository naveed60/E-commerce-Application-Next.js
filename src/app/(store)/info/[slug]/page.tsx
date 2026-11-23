import Link from "next/link";
import { notFound } from "next/navigation";
import { StorefrontShell } from "@/components/landing/storefront-shell";
import { RefundForm } from "@/components/landing/customer-forms";
import { OrderLookup } from "@/components/landing/order-lookup";
import styles from "@/components/landing/storefront-design.module.css";

type PageContent = { eyebrow: string; title: string; intro: string; sections: { title: string; text: string }[] };
const pages: Record<string, PageContent> = {
  "track-order": { eyebrow: "Order support", title: "Track your order", intro: "Sign in and enter your order number to view its current status.", sections: [] },
  "returns-exchanges": { eyebrow: "Customer care", title: "Returns & Exchanges", intro: "We want you to feel confident in every Drape & Line purchase.", sections: [{ title: "Our 7-day policy", text: "Contact us within 7 days of delivery to request a return or exchange. Items must be unworn, unwashed, and returned with their original tags." }, { title: "How to request a return", text: "Send your order number, product name, and reason for the request to support@loomandline.com. Our team will reply with the next steps." }] },
  faqs: { eyebrow: "Need to know", title: "Frequently Asked Questions", intro: "Quick answers to common questions about shopping with Drape & Line.", sections: [{ title: "How long does delivery take?", text: "Standard delivery usually takes 3–7 business days." }, { title: "Can I change my order?", text: "Contact us as soon as possible. We will try to help before your order is dispatched." }, { title: "How do I pay?", text: "Online payment is handled securely through Safepay at checkout." }] },
  "contact-us": { eyebrow: "We are here to help", title: "Contact Us", intro: "Our customer support team is ready to help with orders, products, and returns.", sections: [{ title: "Email", text: "support@loomandline.com" }, { title: "Phone", text: "+92 3316281050" }, { title: "Support hours", text: "Monday to Saturday, 9:00 AM to 6:00 PM." }] },
  "our-story": { eyebrow: "About Drape & Line", title: "Our Story", intro: "Thoughtful everyday dressing for modern life.", sections: [{ title: "Designed for real life", text: "Drape & Line was created for comfortable, versatile clothing that works across everyday moments and special occasions." }, { title: "Our approach", text: "We focus on timeless silhouettes, considered details, and pieces you will want to wear again and again." }] },
  sustainability: { eyebrow: "Our responsibility", title: "Sustainability", intro: "Better choices begin with buying fewer, better pieces.", sections: [{ title: "Made to last", text: "Our collections are designed around versatile styles and quality materials that can remain part of your wardrobe for longer." }, { title: "A considered wardrobe", text: "We encourage thoughtful shopping, proper care, and choosing pieces that can be styled across seasons." }] },
  "privacy-policy": { eyebrow: "Your privacy", title: "Privacy Policy", intro: "We respect your information and keep it limited to what is needed to serve you.", sections: [{ title: "Information we use", text: "We use details such as your name, contact information, and delivery address to process orders and provide customer support." }, { title: "Your choices", text: "You can contact us at support@loomandline.com with questions about your information or support preferences." }] },
  "terms-conditions": { eyebrow: "Store information", title: "Terms & Conditions", intro: "These terms explain the basics of using the Drape & Line online store.", sections: [{ title: "Orders and pricing", text: "Orders are subject to product availability. Prices, offers, and stock information may change without notice." }, { title: "Delivery and returns", text: "Delivery, payment, returns, and exchanges are handled according to the customer policies shown on this website." }] },
};

export function generateStaticParams() { return Object.keys(pages).map((slug) => ({ slug })); }
export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();
  return <StorefrontShell><main className="mx-auto min-h-[60vh] max-w-[1050px] px-5 py-16 md:px-10 md:py-24"><p className="text-xs font-bold uppercase tracking-[.3em] text-[#d9233f]">{page.eyebrow}</p><h1 className={`${styles.serif} mt-4 text-5xl leading-tight md:text-7xl`}>{page.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-black/65">{page.intro}</p>{slug === "track-order" && <OrderLookup />}{slug === "returns-exchanges" && <RefundForm />}<div className="mt-12 grid gap-5 md:grid-cols-2">{page.sections.map((section) => <article key={section.title} className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm"><h2 className={`${styles.serif} text-3xl`}>{section.title}</h2><p className="mt-4 leading-7 text-black/65">{section.text}</p></article>)}</div><Link href="/#shop" className="mt-8 inline-flex rounded-full bg-[#06472f] px-7 py-3 text-sm font-bold text-white">Back to shopping</Link></main></StorefrontShell>;
}
