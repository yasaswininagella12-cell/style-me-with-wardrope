import type { Metadata } from "next";
import Link from "next/link";
import { Images, CircleUserRound, Sparkles, Bookmark, Heart, Shirt, Gem, TrendingUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "How it works",
  description: "See how Style Me With Wardrobe works in three easy steps.",
};

const steps = [
  {
    icon: Upload,
    title: "1. Upload your wardrobe",
    description:
      "Add each piece of clothing with a photo and a few details: color, fabric, pattern, and the occasions you wear it for. Tops, bottoms, dresses, footwear, bags and accessories — everything has a home.",
  },
  {
    icon: CircleUserRound,
    title: "2. Personalize your style profile",
    description:
      "Tell us about your skin tone, the jewelry metals you love, your go-to silhouettes and how bold you like your color palette. The more we know, the better every match fits you.",
  },
  {
    icon: Shirt,
    title: "3. Pick your pieces",
    description:
      "Choose the clothing items you're considering — the blouse you love, those trousers you never wear, that dress you've been saving. Our Style My Outfit picker makes it effortless.",
  },
  {
    icon: Sparkles,
    title: "4. Get your complete look",
    description:
      "In seconds you'll get a full look: complementary jewelry, footwear, bag and makeup suggestions, plus hairstyle ideas — all matched to your skin tone, the occasion and the season.",
  },
  {
    icon: Bookmark,
    title: "5. Save and favorite",
    description:
      "Loved a look? Save it to your collection or mark the trend as a favorite. Build your personal style moodboard one outfit at a time.",
  },
  {
    icon: TrendingUp,
    title: "6. Set the trend",
    description:
      "Browse the latest fashion trends and see which pieces from your own wardrobe already nail it. You might be more on-trend than you think.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          How it works
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          From full closet to full look in six simple steps.
        </p>
      </Reveal>

      <div className="mt-16 space-y-8">
        {steps.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.04}>
            <div className="flex gap-5 rounded-2xl border bg-card p-6 sm:p-8">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <step.icon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-semibold">{step.title}</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16 rounded-3xl bg-gradient-to-br from-primary to-brand-espresso p-10 text-center text-primary-foreground">
        <Gem className="mx-auto size-8 text-brand-gold" aria-hidden="true" />
        <h2 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">
          Your complete look is minutes away
        </h2>
        <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
          Create your free account, upload a few items, and let your new stylist take it from
          there.
        </p>
        <Button asChild size="lg" className="mt-8 bg-background text-foreground hover:bg-background/90">
          <Link href="/register">Start now</Link>
        </Button>
      </Reveal>
    </div>
  );
}
