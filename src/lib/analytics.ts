import type { StyleReport, CoverageCheck } from "@/types";
import { COLORS, optionLabel } from "@/lib/constants";
import type { WardrobeItem } from "@/generated/prisma/client";

const UPPER = new Set(["top", "shirt", "tshirt", "kurti"]);
const LOWER = new Set(["jeans", "pants", "skirt", "shorts"]);
const FULL = new Set(["dress", "saree", "lehenga"]);
const LAYER = new Set(["jacket", "blazer"]);

const CATEGORY_LABELS: Record<string, string> = {
  top: "Tops",
  shirt: "Shirts",
  tshirt: "T-Shirts",
  kurti: "Kurtis",
  jeans: "Jeans",
  pants: "Pants",
  skirt: "Skirts",
  shorts: "Shorts",
  dress: "Dresses",
  saree: "Sarees",
  lehenga: "Lehengas",
  jacket: "Jackets",
  blazer: "Blazers",
  other: "Other",
};

function group(
  items: WardrobeItem[],
  pick: (item: WardrobeItem) => string | null | undefined,
  label: (value: string) => string,
): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  let other = 0;
  for (const item of items) {
    const value = pick(item);
    if (!value) {
      other += 1;
      continue;
    }
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const buckets = [...counts.entries()]
    .map(([value, count]) => ({ label: label(value), count }))
    .sort((a, b) => b.count - a.count);
  if (other > 0) buckets.push({ label: "Unspecified", count: other });
  return buckets;
}

function scoreVersatility(
  distinctColors: number,
  totalCategories: number,
  taggedOccasions: number,
  taggedStyles: number,
  totalItems: number,
): number {
  let score = 0;
  score += Math.min(30, distinctColors * 4);
  score += Math.min(30, totalCategories * 5);
  if (totalItems > 0) {
    score += Math.min(20, Math.round((taggedOccasions / totalItems) * 20));
    score += Math.min(20, Math.round((taggedStyles / totalItems) * 20));
  }
  return Math.min(100, Math.max(0, score));
}

function labelForScore(score: number): string {
  if (score >= 90) return "Wardrobe goals";
  if (score >= 75) return "Versatile";
  if (score >= 60) return "Balanced";
  if (score >= 40) return "Getting there";
  return "Bare bones";
}

export function buildStyleReport(items: WardrobeItem[]): StyleReport {
  const totalItems = items.length;
  const distinctColors = new Set(items.map((i) => i.color)).size;
  const totalCategories = new Set(items.map((i) => i.category)).size;

  const byCategory = group(items, (i) => i.category, (v) => CATEGORY_LABELS[v] ?? optionLabel(v));
  const byColor = group(items, (i) => i.color, (v) => optionLabel(v)).map((b) => ({
    ...b,
    hex: COLORS.find((c) => optionLabel(c.value) === b.label)?.hex ?? "#b8b8b8",
  }));
  const byOccasion = group(items, (i) => i.occasion, (v) => optionLabel(v));
  const bySeason = group(items, (i) => i.season, (v) => optionLabel(v));
  const byStyle = group(items, (i) => i.style, (v) => optionLabel(v));
  const byMaterial = group(items, (i) => i.material, (v) => optionLabel(v));

  const countByCategory = (set: Set<string>) =>
    items.filter((i) => set.has(i.category)).length;

  const coverage: CoverageCheck[] = [
    {
      id: "tops",
      label: "Tops & shirts",
      hint: "Tees, shirts, blouses and kurtis — the everyday layer.",
      present: countByCategory(UPPER) > 0,
      count: countByCategory(UPPER),
    },
    {
      id: "bottoms",
      label: "Bottoms",
      hint: "Jeans, trousers, skirts and shorts to mix with tops.",
      present: countByCategory(LOWER) > 0,
      count: countByCategory(LOWER),
    },
    {
      id: "dresses",
      label: "Dresses & one-pieces",
      hint: "Dresses, sarees and lehengas for low-effort full looks.",
      present: countByCategory(FULL) > 0,
      count: countByCategory(FULL),
    },
    {
      id: "layers",
      label: "Layers",
      hint: "Jackets and blazers to make every look 3-dimensional.",
      present: countByCategory(LAYER) > 0,
      count: countByCategory(LAYER),
    },
    {
      id: "occasions",
      label: "Occasion tags",
      hint: "Tagged items let the stylist skip to the right mood.",
      present: items.some((i) => i.occasion),
      count: items.filter((i) => i.occasion).length,
    },
    {
      id: "season",
      label: "Season tags",
      hint: "Know which pieces work in which weather.",
      present: items.some((i) => i.season),
      count: items.filter((i) => i.season).length,
    },
    {
      id: "colors",
      label: "Color variety",
      hint: "Five or more color families unlock real mixing.",
      present: distinctColors >= 5,
      count: distinctColors,
    },
  ];

  const gaps: string[] = [];
  const strengths: string[] = [];

  const missing = coverage.filter((c) => !c.present);
  const present = coverage.filter((c) => c.present);

  for (const check of missing) {
    if (check.id === "tops" && items.some((i) => FULL.has(i.category))) continue;
    if (check.id === "colors" && totalItems < 5) {
      gaps.push("Too few items to judge color variety yet.");
      continue;
    }
    gaps.push(check.label);
  }

  for (const check of present) {
    if (check.id === "colors" && distinctColors >= 6) {
      strengths.push(`${distinctColors} color families`);
    } else if (check.id !== "colors") {
      strengths.push(check.label);
    }
  }

  const best = byColor[0];
  const mostVersatileColor: StyleReport["mostVersatileColor"] = best
    ? { label: best.label, hex: best.hex, count: best.count }
    : { label: "—", hex: "#b8b8b8", count: 0 };

  const taggedOccasions = items.filter((i) => i.occasion).length;
  const taggedStyles = items.filter((i) => i.style).length;
  const versatilityScore = scoreVersatility(
    distinctColors,
    totalCategories,
    taggedOccasions,
    taggedStyles,
    totalItems,
  );
  const versatilityLabel = labelForScore(versatilityScore);

  let summary: string;
  if (totalItems === 0) {
    summary = "Your closet is an open page. Add a few pieces and watch the score climb.";
  } else if (versatilityScore >= 75) {
    summary = `${strengths.slice(0, 2).join(" and ") || "Plenty of pieces"} make this a closet that can nearly dress itself.`;
  } else if (versatilityScore >= 40) {
    summary = `A solid start — focus on ${gaps.slice(0, 2).join(" and ") || "adding more color variety"} to take it further.`;
  } else {
    summary = `${gaps.slice(0, 3).join(", ") || "A little more variety"} would turn this into a much more mixable wardrobe.`;
  }

  return {
    totalItems,
    distinctColors,
    totalCategories,
    byCategory,
    byColor,
    byOccasion,
    bySeason,
    byStyle,
    byMaterial,
    coverage,
    strengths,
    gaps,
    mostVersatileColor,
    versatilityScore,
    versatilityLabel,
    summary,
  };
}