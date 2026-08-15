"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Shirt, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WardrobeItemCard } from "@/components/wardrobe/wardrobe-item-card";
import { WardrobeFormDialog } from "@/components/wardrobe/wardrobe-form-dialog";
import { CATEGORIES, COLORS, OCCASIONS, SEASONS, STYLES } from "@/lib/constants";
import type { WardrobeItem } from "@/generated/prisma/client";

type SortKey = "newest" | "oldest" | "name";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name (A–Z)" },
];

export function WardrobeClient({ items }: { items: WardrobeItem[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [color, setColor] = useState("all");
  const [occasion, setOccasion] = useState("all");
  const [season, setSeason] = useState("all");
  const [style, setStyle] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WardrobeItem | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = items.filter((item) => {
      if (q && !`${item.name} ${item.category} ${item.color}`.toLowerCase().includes(q)) return false;
      if (category !== "all" && item.category !== category) return false;
      if (color !== "all" && item.color !== color) return false;
      if (occasion !== "all" && item.occasion !== occasion) return false;
      if (season !== "all" && item.season !== season) return false;
      if (style !== "all" && item.style !== style) return false;
      return true;
    });

    return result.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      return sort === "newest"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [items, search, category, color, occasion, season, style, sort]);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(item: WardrobeItem) {
    setEditing(item);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">My Wardrobe</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} · {filtered.length} shown
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/style">
              <Wand2 className="mr-2 size-4" aria-hidden="true" />
              Style an outfit
            </Link>
          </Button>
          <Button onClick={openAdd}>
            <Plus className="mr-2 size-4" aria-hidden="true" />
            Add item
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(5,minmax(0,1fr))_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your wardrobe…"
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={color} onValueChange={setColor}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All colors</SelectItem>
            {COLORS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={occasion} onValueChange={setOccasion}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Occasion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All occasions</SelectItem>
            {OCCASIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={season} onValueChange={setSeason}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All seasons</SelectItem>
            {SEASONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All styles</SelectItem>
            {STYLES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-accent">
            <Shirt className="size-7 text-muted-foreground" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-heading text-xl font-semibold">
            {items.length === 0 ? "Your wardrobe is empty" : "No items match your filters"}
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {items.length === 0
              ? "Add your first piece to start building outfits and getting styled."
              : "Try clearing a filter or changing your search."}
          </p>
          {items.length === 0 ? (
            <Button className="mt-6" onClick={openAdd}>
              <Plus className="mr-2 size-4" aria-hidden="true" />
              Add your first item
            </Button>
          ) : (
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setColor("all");
                setOccasion("all");
                setSeason("all");
                setStyle("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => (
            <WardrobeItemCard key={item.id} item={item} onEdit={openEdit} />
          ))}
        </div>
      )}

      <WardrobeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editing}
        onSaved={() => setEditing(null)}
      />
    </div>
  );
}
