"use client";

import { useState } from "react";
import Image from "next/image";
import { Gem, Palette, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OCCASIONS, SEASONS, STYLES, NECKLINES, optionLabel } from "@/lib/constants";
import { matchJewelry } from "@/lib/actions";
import type { RecommendationItem } from "@/types";
import type { WardrobeItem } from "@/generated/prisma/client";

type MatchResult = {
  jewelry: RecommendationItem[];
  metalTone: string;
  colorPalette: string[];
  stylingTips: string[];
};

export function JewelryMatcher({ items }: { items: WardrobeItem[] }) {
  const [itemId, setItemId] = useState("");
  const [occasion, setOccasion] = useState("");
  const [season, setSeason] = useState("");
  const [style, setStyle] = useState("");
  const [neckline, setNeckline] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);

  async function handleMatch() {
    setPending(true);
    const res = await matchJewelry({
      itemId: itemId || null,
      occasion: occasion || null,
      season: season || null,
      style: style || null,
      neckline: neckline || null,
    });
    setPending(false);
    if (res && "error" in res && res.error) {
      toast.error(res.error);
      return;
    }
    if (res && "data" in res && res.data) {
      setResult(res.data);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
      <div className="space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold">Match my jewelry</h2>
        <p className="text-sm text-muted-foreground">
          Choose an outfit piece and we&apos;ll match jewelry to its color, style and the
          occasion.
        </p>

        <div className="space-y-1.5">
          <Label>Outfit piece</Label>
          <Select value={itemId || "any"} onValueChange={(v) => setItemId(v === "any" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a piece (optional)" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <SelectItem value="any">Any piece</SelectItem>
              {items.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Occasion</Label>
          <Select value={occasion || "any"} onValueChange={(v) => setOccasion(v === "any" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Any occasion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any occasion</SelectItem>
              {OCCASIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Season</Label>
          <Select value={season || "any"} onValueChange={(v) => setSeason(v === "any" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Any season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any season</SelectItem>
              {SEASONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Style</Label>
          <Select value={style || "any"} onValueChange={(v) => setStyle(v === "any" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Any style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any style</SelectItem>
              {STYLES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Neckline</Label>
          <Select value={neckline || "any"} onValueChange={(v) => setNeckline(v === "any" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="No preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">No preference</SelectItem>
              {NECKLINES.map((n) => (
                <SelectItem key={n.value} value={n.value}>
                  {n.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" size="lg" onClick={handleMatch} disabled={pending || items.length === 0}>
          {pending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              Matching…
            </>
          ) : (
            <>
              <Gem className="mr-2 size-4" aria-hidden="true" />
              Match jewelry
            </>
          )}
        </Button>
      </div>

      <div>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
            <p className="font-heading text-lg font-semibold">No wardrobe items yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add a few pieces to your wardrobe first to start matching jewelry.
            </p>
            <Button asChild className="mt-6">
              <a href="/wardrobe">Add wardrobe items</a>
            </Button>
          </div>
        ) : result ? (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border bg-card px-3 py-1 text-sm">
                <span className="font-medium">Metal tone:</span> {result.metalTone}
              </span>
              <div className="flex flex-wrap gap-2">
                {result.colorPalette.map((color) => (
                  <span
                    key={color}
                    className="rounded-full border bg-card px-3 py-1 text-sm"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-heading text-xl font-semibold">
                <Gem className="size-5 text-brand-gold" aria-hidden="true" />
                Recommended jewelry
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.jewelry.map((rec, i) => (
                  <div key={`${rec.name}-${i}`} className="rounded-2xl border bg-card p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{rec.name}</p>
                        <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                          {optionLabel(rec.itemType)}
                        </p>
                      </div>
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <Gem className="size-4" aria-hidden="true" />
                      </span>
                    </div>
                    {rec.description && (
                      <p className="mt-3 text-sm text-muted-foreground">{rec.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border bg-card p-6">
                <h3 className="flex items-center gap-2 font-heading text-lg font-semibold">
                  <Palette className="size-5 text-brand-gold" aria-hidden="true" />
                  Colors that complement
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {result.colorPalette.join(" · ")}
                </p>
              </div>
              <div className="rounded-2xl border bg-card p-6">
                <h3 className="flex items-center gap-2 font-heading text-lg font-semibold">
                  <Sparkles className="size-5 text-brand-gold" aria-hidden="true" />
                  Stylist tips
                </h3>
                <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
                  {result.stylingTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-accent">
              <Gem className="size-7 text-muted-foreground" aria-hidden="true" />
            </span>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Select your piece and preferences, then hit &ldquo;Match jewelry&rdquo; to see
              your matches.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
