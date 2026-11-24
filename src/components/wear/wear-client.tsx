"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, Droplets, Footprints, Shirt, Sparkles, WashingMachine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { logCare, logWear, updateItemCare, type ActionResult } from "@/lib/feature-actions";
import { formatValue, optionLabel } from "@/lib/constants";

export type WearItem = {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  purchasePrice: number | null;
  careInstructions: string | null;
  careIntervalDays: number;
  wearCount: number;
  lastWornAt: string | null;
  lastCareAt: string | null;
  nextCareDueAt: string | null;
  lastCareType: string | null;
};

const CARE_TYPES = [
  { value: "wash", label: "Wash" },
  { value: "dry-clean", label: "Dry clean" },
  { value: "iron", label: "Iron" },
  { value: "repair", label: "Repair" },
  { value: "other", label: "Other" },
] as const;

type CareType = (typeof CARE_TYPES)[number]["value"];

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function lastWornText(value: string | null): string {
  if (!value) return "Not worn yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not worn yet";
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days < 0) return `Last worn ${formatDate(value)}`;
  if (days === 0) return "Worn today";
  if (days === 1) return "Worn yesterday";
  if (days < 30) return `Worn ${days} days ago`;
  return `Last worn ${formatDate(value)}`;
}

function isCareDue(item: WearItem): boolean {
  if (item.nextCareDueAt) {
    const due = new Date(item.nextCareDueAt).getTime();
    return !Number.isNaN(due) && due < Date.now();
  }
  return !item.lastCareAt && item.wearCount >= 3;
}

function money(value: number): string {
  return `$${value.toFixed(2)}`;
}

function notifyError(result: ActionResult) {
  const fieldError = Object.values(result.fieldErrors ?? {})[0]?.[0];
  toast.error(result.error ?? fieldError ?? "Something went wrong.");
}

function WearItemCard({ item }: { item: WearItem }) {
  const router = useRouter();
  const [careOpen, setCareOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [careType, setCareType] = useState<CareType>("wash");
  const [careNote, setCareNote] = useState("");
  const [purchasePrice, setPurchasePrice] = useState(
    item.purchasePrice === null ? "" : String(item.purchasePrice)
  );
  const [careInstructions, setCareInstructions] = useState(item.careInstructions ?? "");
  const [careIntervalDays, setCareIntervalDays] = useState(String(item.careIntervalDays));
  const [pending, setPending] = useState(false);

  const due = isCareDue(item);
  const costPerWear =
    item.purchasePrice !== null && item.wearCount > 0 ? item.purchasePrice / item.wearCount : null;

  async function markWorn() {
    setPending(true);
    const result = await logWear({ itemIds: [item.id] });
    setPending(false);
    if (result.error || result.fieldErrors) {
      notifyError(result);
      return;
    }
    toast.success(`Logged a wear for ${item.name}.`);
    router.refresh();
  }

  async function submitCare() {
    setPending(true);
    const result = await logCare({
      wardrobeItemId: item.id,
      careType,
      note: careNote.trim() || null,
    });
    setPending(false);
    if (result.error || result.fieldErrors) {
      notifyError(result);
      return;
    }
    toast.success(`Care logged for ${item.name}.`);
    setCareNote("");
    setCareOpen(false);
    router.refresh();
  }

  async function submitDetails() {
    const price = purchasePrice.trim() === "" ? null : Number(purchasePrice);
    const interval = Number(careIntervalDays);
    if (price !== null && Number.isNaN(price)) {
      toast.error("Enter a valid purchase price.");
      return;
    }
    if (!Number.isInteger(interval) || interval < 1) {
      toast.error("Care interval must be at least 1 day.");
      return;
    }

    setPending(true);
    const result = await updateItemCare({
      wardrobeItemId: item.id,
      purchasePrice: price,
      careInstructions: careInstructions.trim() || null,
      careIntervalDays: interval,
    });
    setPending(false);
    if (result.error || result.fieldErrors) {
      notifyError(result);
      return;
    }
    toast.success("Care details saved.");
    setDetailsOpen(false);
    router.refresh();
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-square bg-muted">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="bg-background/90">
            {item.wearCount} {item.wearCount === 1 ? "wear" : "wears"}
          </Badge>
          {due && <Badge variant="destructive" className="bg-background/90">Needs care</Badge>}
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col p-4">
        <h3 className="truncate font-heading text-base font-semibold">{item.name}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{optionLabel(item.category)}</p>

        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <Footprints className="size-3.5 shrink-0 text-brand-gold" aria-hidden="true" />
            {lastWornText(item.lastWornAt)}
          </p>
          <p className="flex items-center gap-2">
            <WashingMachine className="size-3.5 shrink-0 text-brand-gold" aria-hidden="true" />
            {item.lastCareType
              ? `${formatValue(item.lastCareType)} · ${formatDate(item.lastCareAt)}`
              : "No care logged"}
          </p>
          {item.nextCareDueAt && (
            <p className="flex items-center gap-2">
              <CalendarClock className="size-3.5 shrink-0 text-brand-gold" aria-hidden="true" />
              Next care due {formatDate(item.nextCareDueAt)}
            </p>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
          <span className="font-medium">{item.purchasePrice !== null ? money(item.purchasePrice) : "No price set"}</span>
          <span className="text-muted-foreground">
            {costPerWear !== null ? `${money(costPerWear)} / wear` : "— / wear"}
          </span>
        </div>
        {item.careInstructions && (
          <p className="mt-2 truncate text-xs text-muted-foreground">{item.careInstructions}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={markWorn} disabled={pending}>
            <Footprints aria-hidden="true" />
            Mark worn
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCareOpen(true)} disabled={pending}>
            <Droplets aria-hidden="true" />
            Log care
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDetailsOpen(true)} disabled={pending}>
            Details
          </Button>
        </div>
      </CardContent>

      <Dialog open={careOpen} onOpenChange={setCareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Log care for {item.name}</DialogTitle>
            <DialogDescription>
              Record how you cared for this piece. The next due date is set from its care interval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor={`care-type-${item.id}`}>Care type</Label>
              <Select value={careType} onValueChange={(value) => setCareType(value as CareType)}>
                <SelectTrigger id={`care-type-${item.id}`} className="w-full">
                  <SelectValue placeholder="Select care type" />
                </SelectTrigger>
                <SelectContent>
                  {CARE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`care-note-${item.id}`}>Note (optional)</Label>
              <Input
                id={`care-note-${item.id}`}
                value={careNote}
                onChange={(event) => setCareNote(event.target.value)}
                placeholder="e.g. Cold wash, air dried"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCareOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={submitCare} disabled={pending}>
              {pending ? "Saving…" : "Save care log"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Care details for {item.name}</DialogTitle>
            <DialogDescription>
              Add a price and care notes to see cost per wear and know when to care for it next.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor={`price-${item.id}`}>Purchase price</Label>
              <Input
                id={`price-${item.id}`}
                type="number"
                min={0}
                step="0.01"
                value={purchasePrice}
                onChange={(event) => setPurchasePrice(event.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`instructions-${item.id}`}>Care instructions</Label>
              <Textarea
                id={`instructions-${item.id}`}
                value={careInstructions}
                onChange={(event) => setCareInstructions(event.target.value)}
                placeholder="e.g. Machine wash cold, do not tumble dry"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`interval-${item.id}`}>Care interval (days)</Label>
              <Input
                id={`interval-${item.id}`}
                type="number"
                min={1}
                max={365}
                value={careIntervalDays}
                onChange={(event) => setCareIntervalDays(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={submitDetails} disabled={pending}>
              {pending ? "Saving…" : "Save details"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export function WearClient({ items }: { items: WearItem[] }) {
  const totalWears = items.reduce((sum, item) => sum + item.wearCount, 0);
  const wornItems = items.filter((item) => item.wearCount > 0).length;
  const pricedItems = items.filter((item) => item.purchasePrice !== null && item.wearCount > 0);
  const averageCostPerWear =
    pricedItems.length > 0
      ? pricedItems.reduce(
          (sum, item) => sum + (item.purchasePrice ?? 0) / item.wearCount,
          0
        ) / pricedItems.length
      : null;
  const careDueCount = items.filter(isCareDue).length;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
        <p className="font-heading text-lg font-semibold">No wardrobe items to track yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Add pieces to your wardrobe to start logging wears and garment care.
        </p>
        <Button asChild className="mt-6">
          <Link href="/wardrobe">Add wardrobe items</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
              <Shirt className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Total wears</p>
              <p className="font-heading text-2xl font-bold">{totalWears}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
              <Footprints className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Items worn</p>
              <p className="font-heading text-2xl font-bold">
                {wornItems} <span className="text-sm font-normal text-muted-foreground">/ {items.length}</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Avg cost / wear</p>
              <p className="font-heading text-2xl font-bold">
                {averageCostPerWear !== null ? money(averageCostPerWear) : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-rose/15 text-brand-rose">
              <CalendarClock className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Needs care</p>
              <p className="font-heading text-2xl font-bold">{careDueCount}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Droplets className="size-5 text-brand-gold" aria-hidden="true" />
          <h2 className="font-heading text-xl font-bold">Your pieces</h2>
          <Badge variant="secondary">{items.length} items</Badge>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <WearItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
