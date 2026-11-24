"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { optionLabel } from "@/lib/constants";
import {
  markPlanWorn,
  removeOutfitPlan,
  scheduleOutfit,
} from "@/lib/feature-actions";

export type CalendarPlanItem = {
  id: string;
  date: string;
  note: string | null;
  isWorn: boolean;
  outfit: {
    id: string;
    name: string;
    occasion: string | null;
    images: string[];
  };
};

export type CalendarOutfitOption = {
  id: string;
  name: string;
  imageUrl: string | null;
  occasion: string | null;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type CalendarCell = {
  key: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatDateLabel(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildCells(year: number, month: number, todayKey: string): CalendarCell[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const start = new Date(year, month, 1 - firstWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + index,
    );
    const key = toDateKey(date);
    return {
      key,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isToday: key === todayKey,
    };
  });
}

export function CalendarClient({
  plans,
  outfits,
}: {
  plans: CalendarPlanItem[];
  outfits: CalendarOutfitOption[];
}) {
  const router = useRouter();
  const [today] = useState(() => new Date());
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [outfitId, setOutfitId] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const todayKey = toDateKey(today);

  const cells = useMemo(
    () => buildCells(viewYear, viewMonth, todayKey),
    [viewYear, viewMonth, todayKey],
  );

  const plansByDate = useMemo(() => {
    const grouped = new Map<string, CalendarPlanItem[]>();
    for (const plan of plans) {
      const dayPlans = grouped.get(plan.date);
      if (dayPlans) dayPlans.push(plan);
      else grouped.set(plan.date, [plan]);
    }
    return grouped;
  }, [plans]);

  const upcomingPlans = useMemo(
    () =>
      plans
        .filter((plan) => plan.date >= todayKey)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [plans, todayKey],
  );

  function changeMonth(offset: number) {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  function goToToday() {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  function openDay(dateKey: string) {
    setSelectedDate(dateKey);
    setOutfitId("");
    setNote("");
  }

  async function handleSchedule() {
    if (!selectedDate || !outfitId || saving) return;

    setSaving(true);
    const result = await scheduleOutfit({
      outfitId,
      date: selectedDate,
      note: note.trim() || null,
    });
    setSaving(false);

    const firstFieldError = Object.values(result.fieldErrors ?? {}).find(
      (messages) => messages.length > 0,
    )?.[0];
    if (result.error || firstFieldError) {
      toast.error(result.error ?? firstFieldError ?? "Could not schedule outfit.");
      return;
    }

    toast.success("Outfit added to your calendar.");
    setSelectedDate(null);
    router.refresh();
  }

  async function handleMarkWorn(plan: CalendarPlanItem) {
    if (busyPlanId) return;

    setBusyPlanId(plan.id);
    const result = await markPlanWorn(plan.id);
    setBusyPlanId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Marked as worn.");
    router.refresh();
  }

  async function handleRemove(plan: CalendarPlanItem) {
    if (busyPlanId) return;

    setBusyPlanId(plan.id);
    const result = await removeOutfitPlan(plan.id);
    setBusyPlanId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Plan removed.");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <Card className="rounded-2xl border">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-bold">
                {formatMonthLabel(viewYear, viewMonth)}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Click any day to plan an outfit.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous month"
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <Button variant="outline" onClick={goToToday}>
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next month"
                onClick={() => changeMonth(1)}
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs"
              >
                {weekday}
              </div>
            ))}

            {cells.map((cell) => {
              const dayPlans = plansByDate.get(cell.key) ?? [];
              const dayClasses = [
                "flex min-h-24 flex-col gap-1 rounded-2xl border p-1.5 text-left transition-colors sm:min-h-28 sm:p-2",
                cell.isToday
                  ? "border-brand-gold ring-2 ring-brand-gold/40"
                  : "border-border",
                cell.inMonth
                  ? "bg-card hover:border-brand-gold/50 hover:bg-accent/40"
                  : "bg-muted/20 opacity-60 hover:opacity-90",
              ].join(" ");

              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => openDay(cell.key)}
                  aria-label={`Plan an outfit for ${formatDateLabel(cell.key)}`}
                  className={dayClasses}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`flex size-6 items-center justify-center rounded-full text-xs font-medium ${
                        cell.isToday
                          ? "bg-brand-gold text-background"
                          : cell.inMonth
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {dayPlans.length > 0 && (
                      <Badge
                        variant={cell.isToday ? "default" : "secondary"}
                        className="h-5 px-1.5 text-[10px]"
                      >
                        {dayPlans.length}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayPlans.slice(0, 2).map((plan) => {
                      const image = plan.outfit.images[0];
                      return (
                        <div
                          key={plan.id}
                          className={`relative flex h-7 items-center gap-1 overflow-hidden rounded-lg border px-1 ${
                            plan.isWorn
                              ? "border-brand-gold/50 bg-brand-gold/10 text-brand-gold"
                              : "border-border bg-background/70"
                          }`}
                        >
                          {image && (
                            <span className="relative size-5 shrink-0 overflow-hidden rounded-md bg-muted">
                              <Image
                                src={image}
                                alt=""
                                fill
                                sizes="20px"
                                className="object-cover"
                              />
                            </span>
                          )}
                          {plan.isWorn && (
                            <Check className="size-3 shrink-0" aria-hidden="true" />
                          )}
                          <span className="truncate text-[10px] font-medium">
                            {plan.outfit.name}
                          </span>
                        </div>
                      );
                    })}
                    {dayPlans.length > 2 && (
                      <p className="pl-1 text-[10px] text-muted-foreground">
                        +{dayPlans.length - 2} more
                      </p>
                    )}
                  </div>

                  {dayPlans.length === 0 && (
                    <Plus
                      className="ml-auto mt-auto size-3 text-muted-foreground/50"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {outfits.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed px-6 py-8 text-center">
              <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
                <CalendarDays className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-3 font-heading text-base font-semibold">
                Create an outfit before planning your calendar
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Style an outfit once, then schedule it for as many days as you like.
              </p>
              <Button asChild className="mt-4">
                <Link href="/style">Style an outfit</Link>
              </Button>
            </div>
          )}

          {outfits.length > 0 && plans.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed px-6 py-6 text-center text-sm text-muted-foreground">
              Your calendar is clear. Click any day above to choose an outfit and add a
              note.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-brand-gold" aria-hidden="true" />
              <h2 className="font-heading text-xl font-bold">Upcoming plans</h2>
            </div>
            <Badge variant="secondary">{upcomingPlans.length}</Badge>
          </div>

          {upcomingPlans.length === 0 ? (
            <p className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Nothing coming up yet. Pick a day in the calendar to plan your first look.
            </p>
          ) : (
            <ul className="divide-y">
              {upcomingPlans.map((plan) => {
                const image = plan.outfit.images[0];
                return (
                  <li
                    key={plan.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                  >
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-xl border bg-muted">
                      {image ? (
                        <Image
                          src={image}
                          alt={plan.outfit.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <CalendarDays
                          className="absolute inset-0 m-auto size-5 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-heading font-semibold">
                          {plan.outfit.name}
                        </p>
                        {plan.outfit.occasion && (
                          <Badge variant="secondary">
                            {optionLabel(plan.outfit.occasion)}
                          </Badge>
                        )}
                        {plan.isWorn && (
                          <Badge
                            variant="outline"
                            className="border-brand-gold/50 text-brand-gold"
                          >
                            <Check aria-hidden="true" /> Worn
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDateLabel(plan.date)}
                      </p>
                      {plan.note && (
                        <p className="mt-1 text-sm text-muted-foreground">{plan.note}</p>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkWorn(plan)}
                        disabled={plan.isWorn || busyPlanId === plan.id}
                      >
                        <Check aria-hidden="true" /> Mark worn
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemove(plan)}
                        disabled={busyPlanId === plan.id}
                      >
                        <Trash2 aria-hidden="true" /> Remove
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={selectedDate !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedDate(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Plan an outfit</DialogTitle>
            <DialogDescription>
              {selectedDate ? formatDateLabel(selectedDate) : "Choose a date"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="calendar-outfit">Outfit</Label>
              <Select
                value={outfitId}
                onValueChange={setOutfitId}
                disabled={outfits.length === 0}
              >
                <SelectTrigger id="calendar-outfit" className="w-full">
                  <SelectValue placeholder="Choose an outfit" />
                </SelectTrigger>
                <SelectContent>
                  {outfits.map((outfit) => (
                    <SelectItem key={outfit.id} value={outfit.id}>
                      {outfit.name}
                      {outfit.occasion ? ` · ${optionLabel(outfit.occasion)}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="calendar-note">Note (optional)</Label>
              <Input
                id="calendar-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="e.g. dinner with friends"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedDate(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={saving || !outfitId || outfits.length === 0}
            >
              <Plus aria-hidden="true" />
              {saving ? "Saving…" : "Add to calendar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
