"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { optionLabel } from "@/lib/constants";
import { styleOutfit } from "@/lib/actions";
import type { WardrobeItem } from "@/generated/prisma/client";
import { OCCASIONS, SEASONS, STYLES, NECKLINES } from "@/lib/constants";

export function StylePicker({ items }: { items: WardrobeItem[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [occasion, setOccasion] = useState("");
  const [season, setSeason] = useState("");
  const [style, setStyle] = useState("");
  const [neckline, setNeckline] = useState("");
  const [pending, setPending] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function generate() {
    if (selected.size === 0) {
      toast.error("Select at least one clothing item to get started.");
      return;
    }
    setPending(true);
    const result = await styleOutfit({
      wardrobeItemIds: Array.from(selected),
      occasion: occasion || null,
      season: season || null,
      style: style || null,
      neckline: neckline || null,
    });
    setPending(false);
    if (result && "error" in result && result.error) {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">Select your pieces</h2>
          <span className="text-sm text-muted-foreground">
            {selected.size} {selected.size === 1 ? "item" : "items"} selected
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick the clothing items you&apos;re thinking of wearing. We&apos;ll build the complete
          look around them.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
          <p className="font-heading text-lg font-semibold">No wardrobe items yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a few pieces to your wardrobe first, then come back to style them.
          </p>
          <Button asChild className="mt-6">
            <a href="/wardrobe">Add wardrobe items</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => {
            const isSelected = selected.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                aria-pressed={isSelected}
                className={`group relative overflow-hidden rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/50"
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
                  {isSelected && (
                    <span className="absolute left-2 top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                      <Check className="size-4" />
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {optionLabel(item.category)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold">How are you wearing it?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Optional details that help us tailor the recommendations.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <SelectValue placeholder="Neckline" />
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
        </div>

        <Button size="lg" className="mt-6 w-full sm:w-auto" onClick={generate} disabled={pending || items.length === 0}>
          <Wand2 className="mr-2 size-4" aria-hidden="true" />
          {pending ? "Generating your look…" : "Generate my look"}
        </Button>
      </div>
    </div>
  );
}
