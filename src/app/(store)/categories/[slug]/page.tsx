import { SectionLayout } from "@/components/landing/section-layout";
import { notFound } from "next/navigation";

const categoryContent = {
  "new-in-studio": {
    title: "New in studio",
    kicker: "Fresh drops",
    description:
      "Early looks at what the team is prototyping: limited colorways, material experiments, and small-batch runs.",
    features: [
      "First access to capsule launches with email and in-app alerts.",
      "Behind-the-scenes notes so you know why each change was made.",
      "Request restocks or vote on which variation ships next.",
    ],
  },
  "outdoor-edits": {
    title: "Outdoor edits",
    kicker: "Trail ready",
    description:
      "Packs, shells, and modular add-ons tuned for hiking, travel, and wet weather days in the city.",
    features: [
      "Weatherproof layers and pouches with sealed hardware.",
      "Trail-tested loadouts curated by guides and community members.",
      "Packable options to keep weight and volume low on the move.",
    ],
  },
  "daily-carry": {
    title: "Daily carry",
    kicker: "Work + weekend",
    description:
      "Elevate your everyday kit with bags, organizers, and accessories that balance durability and polish.",
    features: [
      "Modular inserts for tech, stationery, and camera setups.",
      "Comfort-first straps, breathable back panels, and balanced weight.",
      "Neutral palettes that pair with office, campus, or travel fits.",
    ],
  },
  wellness: {
    title: "Wellness",
    kicker: "Reset",
    description:
      "Rituals and tools to recharge: aromatherapy, soft lighting, and recovery accessories for quiet evenings in.",
    features: [
      "Low-profile diffusers and ambient lamps for smaller spaces.",
      "Weighted and cooling textiles for rest and recovery days.",
      "Curated care kits that make it easy to gift or self-gift.",
    ],
  },
  workspace: {
    title: "Workspace",
    kicker: "Desk systems",
    description:
      "Layered setups for focus: desk mats, organizers, and lighting that create a calm, intentional workspace.",
    features: [
      "Cable-managed power and charging built to disappear visually.",
      "Stackable trays, pen rests, and stands that keep essentials in reach.",
      "Soft touch textures that reduce glare for long sessions.",
    ],
  },
} as const;

type CategoryKey = keyof typeof categoryContent;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(categoryContent).map((slug) => ({ slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = categoryContent[slug as CategoryKey];

  if (!content) {
    return notFound();
  }

  return (
    <SectionLayout
      title={content.title}
      description={content.description}
      kicker={content.kicker}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {content.features.map((feature) => (
          <div
            key={feature}
            className="rounded-2xl border border-zinc-100 bg-white px-4 py-3 text-sm text-zinc-700 shadow"
          >
            {feature}
          </div>
        ))}
      </div>
    </SectionLayout>
  );
}
