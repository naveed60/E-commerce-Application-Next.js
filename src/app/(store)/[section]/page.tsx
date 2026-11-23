import { SectionLayout } from "@/components/landing/section-layout";
import { notFound } from "next/navigation";

const sectionContent = {
  collections: {
    title: "Collections",
    kicker: "Curated capsules",
    description:
      "Browse our themed edits, limited collaborations, and seasonal picks that pair materials, tones, and utility into cohesive drops.",
    highlights: [
      "Designer-curated sets with balanced colors, materials, and silhouettes.",
      "Rotating limited runs with early access for signed-in members.",
      "Save full looks or mix-and-match pieces to your personal wishlist.",
    ],
  },
  essentials: {
    title: "Essentials",
    kicker: "Daily carry",
    description:
      "The staples that get used every single day: durable bags, modular organizers, and refined basics built to last.",
    highlights: [
      "Backpacks, tech pouches, and carry systems that play nicely together.",
      "Material-first details — recycled nylon, metal hardware, and soft touch linings.",
      "Bundles and starter kits for quick setup without the guesswork.",
    ],
  },
  stories: {
    title: "Stories",
    kicker: "Editorial",
    description:
      "Go behind the scenes with design notes, field tests, and maker interviews that showcase how each product comes together.",
    highlights: [
      "Studio journals with build process photos and material breakdowns.",
      "Long-form reviews and community tests to see gear in the wild.",
      "Maker spotlights featuring collaborations and limited capsules.",
    ],
  },
} as const;

type SectionKey = keyof typeof sectionContent;

export function generateStaticParams() {
  return Object.keys(sectionContent).map((section) => ({ section }));
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const content = sectionContent[section as SectionKey];

  if (!content) {
    return notFound();
  }

  return (
    <SectionLayout
      title={content.title}
      description={content.description}
      kicker={content.kicker}
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {content.highlights.map((item) => (
          <li
            key={item}
            className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 shadow-inner"
          >
            {item}
          </li>
        ))}
      </ul>
    </SectionLayout>
  );
}
