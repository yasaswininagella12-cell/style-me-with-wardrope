import Link from "next/link";
import {
  ArrowRight,
  Gem,
  Heart,
  Bookmark,
  Shirt,
  Sparkles,
  Wand2,
  TrendingUp,
  CircleUserRound,
  Images,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";

const features = [
  {
    icon: Shirt,
    title: "My Wardrobe",
    description:
      "Upload every piece you own — tops, bottoms, dresses, footwear and more — and organize it all in one beautiful digital closet.",
    href: "/wardrobe",
  },
  {
    icon: Wand2,
    title: "Style My Outfit",
    description:
      "Pick the clothes you're thinking of wearing and get a complete, occasion-ready look in seconds.",
    href: "/style",
  },
  {
    icon: Gem,
    title: "Jewelry Matcher",
    description:
      "Match your outfit to jewelry, footwear, bags and makeup based on your skin tone, metal preference and style.",
    href: "/jewelry",
  },
  {
    icon: TrendingUp,
    title: "Trend Setter",
    description:
      "Get the latest fashion trends, and find the pieces in your own wardrobe that nail the trend today.",
    href: "/trends",
  },
  {
    icon: Bookmark,
    title: "Saved Looks",
    description:
      "Save the looks you love and revisit them anytime. Your complete outfit, fully curated and ready to wear.",
    href: "/saved-looks",
  },
  {
    icon: Heart,
    title: "Favorites",
    description:
      "Favorite the trends, items and looks that speak to you, and build a personalized style moodboard.",
    href: "/favorites",
  },
];

const steps = [
  {
    number: "01",
    icon: Images,
    title: "Add your wardrobe",
    description:
      "Upload photos of your clothes and tell us the color, fabric, pattern and occasion for each piece.",
  },
  {
    number: "02",
    icon: CircleUserRound,
    title: "Tell us about you",
    description:
      "Share your skin tone, preferred styles, and how you like to accessorize — so every match feels personal.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Get styled",
    description:
      "Generate complete looks with jewelry, footwear, bags and makeup. Save your favorites and start a trend.",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* ============================= Hero ============================= */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-sand/40 via-transparent to-transparent" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-28 lg:px-8">
          <Reveal>
            <div>
              <Badge variant="secondary" className="mb-5 gap-2 rounded-full px-4 py-1.5">
                <Sparkles className="size-3.5 text-brand-gold" aria-hidden="true" />
                Your personal AI fashion stylist
              </Badge>
              <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Style Me
                <span className="block bg-gradient-to-r from-brand-espresso to-brand-gold bg-clip-text text-transparent">
                  With Wardrobe
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Turn the clothes you already own into complete, occasion-ready outfits. Match
                jewelry, footwear, bags and makeup to your skin tone and style — no shopping spree
                required.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="group">
                  <Link href="/register">
                    Start styling your wardrobe
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/how-it-works">See how it works</Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                Free to start · No credit card · Your closet, styled smarter
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="relative">
            <div className="relative mx-auto max-w-lg">
              <div className="rounded-3xl border bg-card p-6 shadow-2xl shadow-brand-espresso/10">
                <div className="flex items-center justify-between">
                  <p className="font-heading text-lg font-semibold">Tonight&apos;s Look</p>
                  <Badge className="rounded-full">Date Night</Badge>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {["#d9c8b2", "#3b3632", "#a49a8f"].map((color, i) => (
                    <div
                      key={color}
                      className="flex h-28 flex-col items-center justify-center rounded-2xl border text-xs font-medium text-white"
                      style={{ backgroundColor: color }}
                    >
                      <Shirt className="size-6 opacity-80" aria-hidden="true" />
                      {["Cream Blouse", "Tailored Trouser", "Leather Mules"][i]}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border bg-accent/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Gem className="size-4 text-brand-gold" aria-hidden="true" />
                    Recommended matches
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>Gold hoop earrings · nude pumps · structured tote</li>
                    <li>Soft glam makeup · side-swept waves</li>
                  </ul>
                </div>
              </div>

              <div className="absolute -left-6 top-10 hidden rotate-[-6deg] rounded-2xl border bg-card p-3 shadow-xl lg:block">
                <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm font-medium">
                  <Heart className="size-4 text-brand-rose" aria-hidden="true" />
                  2,341 saved looks
                </div>
              </div>
              <div className="absolute -right-6 bottom-10 hidden rotate-[6deg] rounded-2xl border bg-card p-3 shadow-xl lg:block">
                <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm font-medium">
                  <TrendingUp className="size-4 text-brand-gold" aria-hidden="true" />
                  48 trends this week
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================= Features ============================= */}
      <section className="border-t bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Everything your wardrobe needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From cataloging your clothes to styling a complete look — Style Me With Wardrobe
              does it all.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.05}>
                <Card className="group h-full transition-shadow hover:shadow-lg">
                  <CardContent className="flex h-full flex-col p-6">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <feature.icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-heading text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                    <Link
                      href={feature.href}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Explore
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= How it works ============================= */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps to a complete look
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No fashion degree required.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.number} delay={i * 0.08}>
                <Card className="relative h-full overflow-hidden">
                  <CardContent className="p-6">
                    <span className="font-heading text-5xl font-bold text-brand-gold/30">
                      {step.number}
                    </span>
                    <span className="mt-4 flex size-10 items-center justify-center rounded-full bg-accent">
                      <step.icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-heading text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= CTA ============================= */}
      <section className="border-t bg-gradient-to-br from-primary to-brand-espresso">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="max-w-2xl font-heading text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Your wardrobe is full of outfits you haven&apos;t met yet.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
              Join Style Me With Wardrobe and let your closet work for you.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
                <Link href="/register">
                  Create free account
                  <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="/trends">
                  <Compass className="mr-2 size-4" aria-hidden="true" />
                  Browse trends
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
