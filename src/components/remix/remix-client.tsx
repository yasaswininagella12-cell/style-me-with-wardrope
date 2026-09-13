"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, RefreshCw, Shuffle, Wand2, Gem, Footprints, Handbag, Palette, Scissors, Brush, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { optionLabel } from "@/lib/constants";
import { buildRemixes } from "@/lib/actions";
import type { RemixMood, RemixPlan } from "@/types";
import type { WardrobeItem } from "@/generated/prisma/client";

const MOODS: { value: RemixMood; label: string; hint: string }[] = [
  { value: "everyday", label: "Everyday", hint: "Casual spins for daily life." },
  { value: "work", label: "Work", hint: "Office-ready takes on the piece." },
  { value: "weekend", label: "Weekend", hint: "Laid-back and travel-ready looks." },
  { value: "night", label: "Night out", hint: "Date-night and party glam." },
];

function ComboCard({ plan }: { plan: NonNullable<RemixPlan> }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge className="rounded-full">{plan.hero.name}</Badge>
        <span className="text-sm text-muted-foreground">styled three ways</span>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {plan.combos.map((combo) => (
          <Card key={combo.tab} className="flex h-full flex-col overflow-hidden">
            <div className="border-b bg-accent/40 px-5 py-4">
              <h3 className="font-heading text-lg font-semibold">{combo.tab}</h3>
              <div className="mt-1.5 flex gap-2">
                <Badge variant="secondary">{optionLabel(combo.occasion)}</Badge>
                <Badge variant="secondary">{optionLabel(combo.style)}</Badge>
              </div>
            </div>
            <CardContent className="flex flex-1 flex-col gap-4 p-5">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {combo.items.map((item) => (
                  <div key={item.id} className="shrink-0 text-center">
                    <span className="relative block size-16 overflow-hidden rounded-xl border bg-muted">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </span>
                    <span className="mt-1 block max-w-16 truncate text-[10px] text-muted-foreground">
                      {item.name}
                    </span>
                  </div>
                ))}
                {combo.items.length > 2 && (
                  <span className="text-xs text-muted-foreground">…</span>
                )}
              </div>

              {(combo.look.jewelry.length > 0 ||
                combo.look.footwear.length > 0 ||
                combo.look.bag.length > 0) && (
                <ul className="space-y-1.5 text-sm">
                  {combo.look.jewelry.length > 0 && (
                    <li className="flex items-start gap-2">
                      <Gem className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                      <span className="text-muted-foreground">{combo.look.jewelry.map((j) => j.name).join(" · ")}</span>
                    </li>
                  )}
                  {combo.look.footwear.length > 0 && (
                    <li className="flex items-start gap-2">
                      <Footprints className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                      <span className="text-muted-foreground">{combo.look.footwear.map((f) => f.name).join(" · ")}</span>
                    </li>
                  )}
                  {combo.look.bag.length > 0 && (
                    <li className="flex items-start gap-2">
                      <Handbag className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                      <span className="text-muted-foreground">{combo.look.bag.map((b) => b.name).join(" · ")}</span>
                    </li>
                  )}
                </ul>
              )}

              <div className="space-y-1.5 text-sm">
                <p className="flex items-start gap-2">
                  <Scissors className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">{combo.look.hairstyle.name}</span> · {combo.look.makeup.name}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Palette className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="flex flex-wrap gap-1">
                    {combo.look.colorPalette.map((color) => (
                      <span key={color} className="rounded-full border bg-background px-2 py-0.5 text-xs font-medium">
                        {color}
                      </span>
                    ))}
                  </span>
                </p>
                {combo.look.stylingTips[0] && (
                  <p className="flex items-start gap-2">
                    <Brush className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="text-muted-foreground">{combo.look.stylingTips[0]}</span>
                  </p>
                )}
              </div>

              <div className="mt-auto pt-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/looks/${combo.lookId}`}>
                    Open full look
                    <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function RemixClient({ items }: { items: WardrobeItem[] }) {
  const [heroId, setHeroId] = useState<string>("");
  const [mood, setMood] = useState<RemixMood>("everyday");
  const [pending, setPending] = useState(false);
  const [plan, setPlan] = useState<RemixPlan | null>(null);

  const hero = items.find((item) => item.id === heroId);

  async function generate() {
    if (!heroId) {
      toast.error("Pick one piece to build looks around.");
      return;
    }
    setPending(true);
    const result = await buildRemixes({ heroId, mood });
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setPlan(result.data ?? null);
  }

  return (
    <div className="space-y-10">
      {/* Step 1: pick the hero piece */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-semibold">1. Choose your hero piece</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              One item you love but keep wearing the same way. We&apos;ll build three fresh looks around it.
            </p>
          </div>
          {hero && (
            <Badge variant="secondary" className="gap-1.5">
              <Shuffle className="size-3.5 text-brand-gold" aria-hidden="true" />
              {hero.name}
            </Badge>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed px-6 py-16 text-center">
            <p className="font-heading text-lg font-semibold">Your wardrobe is empty</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add a few pieces first, then come back to remix them six ways to Sunday.
            </p>
            <Button asChild className="mt-6">
              <a href="/wardrobe">Add wardrobe items</a>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => {
              const isHero = heroId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setHeroId(item.id);
                    setPlan(null);
                  }}
                  aria-pressed={isHero}
                  className={`group relative overflow-hidden rounded-2xl border text-left transition-all ${
                    isHero ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover"
                    />
                    {isHero && (
                      <span className="absolute left-2 top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                        <Check className="size-4" />
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{optionLabel(item.category)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Step 2: mood + generate */}
      {hero && (
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-heading text-xl font-semibold">2. Pick the vibe</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Three complete looks, each styled for a different moment with your hero piece as the anchor.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                aria-pressed={mood === m.value}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  mood === m.value ? "border-primary bg-accent/60 ring-2 ring-primary/20" : "border-border hover:bg-accent/30"
                }`}
              >
                <p className="font-heading text-base font-semibold">{m.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{m.hint}</p>
              </button>
            ))}
          </div>
          <Button size="lg" className="mt-6" onClick={generate} disabled={pending}>
            <Wand2 className="mr-2 size-4" aria-hidden="true" />
            {pending ? "Styling three looks…" : "Style it three ways"}
          </Button>
        </section>
      )}

      {/* Results */}
      {plan && (
        <section>
          <ComboCard plan={plan} />
          <div className="mt-8 flex justify-center">
            <Button variant="outline" onClick={generate} disabled={pending}>
              <RefreshCw className="mr-2 size-4" aria-hidden="true" />
              Remix again
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}