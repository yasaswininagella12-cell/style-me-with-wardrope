import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Shirt, Gem, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "About us",
  description: "Learn about Style Me With Wardrobe and our mission.",
};

const values = [
  {
    icon: Shirt,
    title: "Own your closet",
    description:
      "We believe fashion starts with what you already own. No pressure to buy more — just style smarter with what's hanging in your wardrobe.",
  },
  {
    icon: Gem,
    title: "Personal, not generic",
    description:
      "Skin tone, metal preference, body shape and occasion all matter. Our matching engine is built around you, not a magazine spread.",
  },
  {
    icon: Heart,
    title: "Confidence for everyone",
    description:
      "Fashion can feel intimidating. We make it approachable, playful and forgiving — a stylist in your pocket, not a judge.",
  },
  {
    icon: Sparkles,
    title: "Trends that fit you",
    description:
      "Trends are only useful when they work with your wardrobe. We translate what's trending into looks made from your own pieces.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-3xl text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          Your wardrobe deserves a stylist
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Style Me With Wardrobe was born from a simple frustration: closets overflowing with
          clothes, yet nothing to wear. We set out to build the stylist that lives inside your
          wardrobe — one that knows every piece you own, how you like to wear it, and what will
          make you feel like the best version of yourself.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {values.map((value, i) => (
          <Reveal key={value.title} delay={i * 0.06}>
            <div className="rounded-2xl border bg-card p-8">
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <value.icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-heading text-xl font-semibold">{value.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {value.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16 text-center">
        <p className="font-heading text-2xl font-semibold">
          Ready to meet the outfits hiding in your closet?
        </p>
        <div className="mt-6">
          <Button asChild size="lg">
            <Link href="/register">Get started for free</Link>
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
