import { CATEGORIES, optionLabel } from "@/lib/constants";
import type { WardrobeItem, WishlistItem } from "@/generated/prisma/client";
import type { WishlistSuggestion } from "@/types";

const FOCUS_CATEGORIES = ["top", "tshirt", "pants", "jeans", "dress", "blazer", "jacket", "skirt"];

const OCCASION_GAPS: { id: string; label: string; occasion: string; reason: string }[] = [
  {
    id: "work",
    label: "Workwear staples",
    occasion: "work",
    reason: "Nothing tagged for work yet — a sharp layer changes that.",
  },
  {
    id: "evening",
    label: "Evening-ready piece",
    occasion: "evening",
    reason: "Add one dressier piece to cover dinners and events.",
  },
  {
    id: "vacation",
    label: "Vacation separates",
    occasion: "vacation",
    reason: "A light, mixable piece makes travel packing easier.",
  },
];

export function buildWishlistSuggestions(
  wardrobeItems: WardrobeItem[],
  wishlistItems: WishlistItem[],
): WishlistSuggestion[] {
  const planned = wishlistItems.filter((item) => item.status !== "purchased");
  const suggestions: WishlistSuggestion[] = [];

  for (const category of FOCUS_CATEGORIES) {
    const owned = wardrobeItems.filter((item) => item.category === category).length;
    const queued = planned.filter((item) => item.category === category).length;
    const total = owned + queued;
    if (total > 1) continue;

    const label = CATEGORIES.find((c) => c.value === category)?.label ?? optionLabel(category);
    suggestions.push({
      id: `category-${category}`,
      label,
      reason:
        owned === 0
          ? `Your wardrobe has no ${label.toLowerCase()} yet — this is the biggest gap.`
          : `Only one ${label.toLowerCase()} in rotation. A second one unlocks more looks.`,
      category,
      priority: owned === 0 ? "essential" : "nice-to-have",
    });
  }

  for (const gap of OCCASION_GAPS) {
    const owned = wardrobeItems.some((item) => item.occasion === gap.occasion);
    const queued = planned.some((item) => item.category === gap.id);
    if (owned || queued) continue;
    suggestions.push({
      id: `occasion-${gap.id}`,
      label: gap.label,
      reason: gap.reason,
      category: gap.id,
      priority: "nice-to-have",
    });
  }

  return suggestions.slice(0, 4);
}
