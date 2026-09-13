"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Backpack,
  CalendarDays,
  CheckSquare,
  Gem,
  Footprints,
  Handbag,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEASONS, optionLabel } from "@/lib/constants";
import { planPacking } from "@/lib/actions";
import type { TripPlan } from "@/types";

const VIBES: { value: string; label: string; hint: string }[] = [
  { value: "beach", label: "Beach", hint: "Breezy, sun-ready separates." },
  { value: "city", label: "City break", hint: "Walkable chic for exploring." },
  { value: "mountains", label: "Mountains", hint: "Layers and warm bases." },
  { value: "desert", label: "Desert", hint: "Sun-proof, dust-friendly fabric." },
  { value: "festival", label: "Festival", hint: "Bold colors, comfortable feet." },
  { value: "formal", label: "Formal", hint: "Iron-free, sharp and polished." },
];

function SampleLookCard({ plan }: { plan: TripPlan }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {plan.sampleLooks.map((look) => (
        <Card key={look.lookUrl} className="flex h-full flex-col overflow-hidden">
          <CardHeader className="border-b bg-accent/40">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="font-heading text-lg">{look.name}</CardTitle>
              <Badge variant="secondary">{optionLabel(look.occasion)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3 p-5">
            <ul className="space-y-1.5 text-sm">
              {look.look.jewelry.length > 0 && (
                <li className="flex items-start gap-2">
                  <Gem className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                  <span className="text-muted-foreground">{look.look.jewelry.map((j) => j.name).join(" · ")}</span>
                </li>
              )}
              {look.look.footwear.length > 0 && (
                <li className="flex items-start gap-2">
                  <Footprints className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                  <span className="text-muted-foreground">{look.look.footwear.map((f) => f.name).join(" · ")}</span>
                </li>
              )}
              {look.look.bag.length > 0 && (
                <li className="flex items-start gap-2">
                  <Handbag className="mt-0.5 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                  <span className="text-muted-foreground">{look.look.bag.map((b) => b.name).join(" · ")}</span>
                </li>
              )}
            </ul>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{look.look.hairstyle.name}</span> · {look.look.makeup.name}
            </p>
            <Button asChild variant="outline" className="mt-auto">
              <a href={look.lookUrl}>Open full look</a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PackingClient() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("5");
  const [vibe, setVibe] = useState("beach");
  const [season, setSeason] = useState("auto");
  const [pending, setPending] = useState(false);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggleCheck(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function generate(resetChecklist = true) {
    if (!days || Number(days) < 1) {
      toast.error("Trips need at least one day.");
      return;
    }
    setPending(true);
    const result = await planPacking({
      destination,
      days: Number(days),
      vibe,
      season,
    });
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setPlan(result.data ?? null);
    if (resetChecklist) setChecked(new Set());
  }

  const totalItems = plan?.checklist.reduce((n, g) => n + g.items.length, 0) ?? 0;
  const packedCount = checked.size ?? 0;

  return (
    <div className="space-y-10">
      {/* Planner form */}
      <section className="rounded-2xl border bg-card p-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Destination</Label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Goa, Paris…"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Days</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Vibe</Label>
            <Select value={vibe} onValueChange={setVibe}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Vibe" />
              </SelectTrigger>
              <SelectContent>
                {VIBES.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Season (auto recommended)</Label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                {SEASONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {VIBES.find((v) => v.value === vibe) && (
            <p className="w-full text-sm text-muted-foreground sm:w-auto">
              {VIBES.find((v) => v.value === vibe)!.hint}
            </p>
          )}
          <Button size="lg" className="sm:ml-auto" onClick={() => generate(true)} disabled={pending}>
            <Backpack className="mr-2 size-4" aria-hidden="true" />
            {pending ? "Packing your capsule…" : "Pack my trip"}
          </Button>
        </div>
      </section>

      {/* Results */}
      {plan && (
        <>
          <section className="rounded-2xl border bg-gradient-to-br from-brand-sand/40 to-transparent p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
                <Sparkles className="size-5" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <h2 className="font-heading text-xl font-bold">
                  {plan.destination.charAt(0).toUpperCase() + plan.destination.slice(1)} · {plan.days} days
                </h2>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge variant="secondary">{optionLabel(plan.vibe)}</Badge>
                  <Badge variant="secondary">{optionLabel(plan.season)}</Badge>
                  <Badge variant="secondary">{plan.capsule.length} capsule pieces</Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{packedCount} / {totalItems} packed</p>
                <p>{plan.days} outfit days · {plan.sampleLooks.length} fully styled</p>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm text-muted-foreground">💡 {plan.tip}</p>
          </section>

          {plan.capsule.length === 0 && (
            <div className="rounded-2xl border border-dashed px-6 py-10 text-center">
              <p className="font-heading text-lg font-semibold">No wardrobe items to pack yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Add some pieces and regenerate — the packing list below still shows suggested extras.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <a href="/wardrobe">Add wardrobe items</a>
              </Button>
            </div>
          )}

          {/* Day-by-day */}
          {plan.dayPlans.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="size-5 text-brand-gold" aria-hidden="true" />
                <h2 className="font-heading text-xl font-bold">Day by day, mix and match</h2>
              </div>
              <p className="mb-5 text-sm text-muted-foreground">
                Every piece gets reused — that&apos;s the whole point of a capsule.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plan.dayPlans.map((day) => (
                  <Card key={day.day}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <span className="flex size-9 items-center justify-center rounded-full bg-accent font-heading text-sm font-bold">
                          {day.day}
                        </span>
                        <Badge variant="secondary">{optionLabel(day.occasion)}</Badge>
                      </div>
                      <p className="mt-3 font-heading text-base font-semibold">{day.name}</p>
                      {day.itemIds.length === 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">Mix from what you packed.</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Capsule */}
          {plan.capsule.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Backpack className="size-5 text-brand-gold" aria-hidden="true" />
                <h2 className="font-heading text-xl font-bold">Your capsule</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                {plan.capsule.map((item) => (
                  <div key={item.id} className="text-center">
                    <span className="relative block size-20 overflow-hidden rounded-2xl border bg-muted">
                      <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
                    </span>
                    <span className="mt-1 block max-w-24 truncate text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Checklist */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <CheckSquare className="size-5 text-brand-gold" aria-hidden="true" />
              <h2 className="font-heading text-xl font-bold">Packing checklist</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {plan.checklist.map((group) => {
                const done = group.items.filter((item) => checked.has(`${group.group}-${item.name}`)).length;
                return (
                  <Card key={group.group}>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle className="font-heading text-base">{group.group}</CardTitle>
                        <p className="mt-0.5 text-xs text-muted-foreground">{group.note}</p>
                      </div>
                      <Badge variant="secondary">
                        {done}/{group.items.length}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {group.items.map((item) => {
                        const key = `${group.group}-${item.name}`;
                        const isChecked = checked.has(key);
                        return (
                          <label
                            key={key}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                              isChecked ? "border-primary/40 bg-accent/50" : "border-border bg-background/60 hover:bg-accent/30"
                            }`}
                          >
                            <Checkbox checked={isChecked} onCheckedChange={() => toggleCheck(key)} />
                            <span className="flex-1 text-sm font-medium">{item.name}</span>
                            {item.imageUrl && (
                              <span className="relative size-8 shrink-0 overflow-hidden rounded-lg border bg-muted">
                                <Image src={item.imageUrl} alt="" fill sizes="32px" className="object-cover" />
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Styled sample looks */}
          {plan.sampleLooks.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Wand2 className="size-5 text-brand-gold" aria-hidden="true" />
                <h2 className="font-heading text-xl font-bold">Fully styled looks</h2>
              </div>
              <SampleLookCard plan={plan} />
            </section>
          )}

          <div className="flex justify-center">
            <Button variant="outline" onClick={() => generate(false)} disabled={pending}>
              <RefreshCw className="mr-2 size-4" aria-hidden="true" />
              Repack / reshuffle
            </Button>
          </div>
        </>
      )}
    </div>
  );
}