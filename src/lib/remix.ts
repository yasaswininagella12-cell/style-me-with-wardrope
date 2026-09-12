import "server-only";

import { prisma } from "@/lib/prisma";
import { generateStyling } from "@/lib/recommendations";
import type { RemixCombo, RemixComboItem, RemixMood, RemixPlan, StylingInput } from "@/types";
import type { Prisma, WardrobeItem } from "@/generated/prisma/client";

// =============================================================
// Mood presets — each combo is one "way to wear" the hero piece.
// =============================================================

interface ComboSpec {
  tab: string;
  occasion: string;
  style: string;
  extra: Array<"upper" | "bottom" | "layer">;
}

const MOODS: Record<RemixMood, ComboSpec[]> = {
  everyday: [
    { tab: "Easy everyday", occasion: "casual", style: "casual", extra: [] },
    { tab: "Errands & runs", occasion: "college", style: "sporty", extra: [] },
    { tab: "Coffee-date polish", occasion: "date", style: "chic", extra: ["layer"] },
  ],
  work: [
    { tab: "Boardroom ready", occasion: "office", style: "formal", extra: [] },
    { tab: "Smart casual", occasion: "work", style: "minimal", extra: [] },
    { tab: "After-hours", occasion: "evening", style: "elegant", extra: ["layer"] },
  ],
  weekend: [
    { tab: "Sunny weekend", occasion: "casual", style: "casual", extra: [] },
    { tab: "Street vibe", occasion: "casual", style: "streetwear", extra: ["layer"] },
    { tab: "Travel light", occasion: "vacation", style: "minimal", extra: [] },
  ],
  night: [
    { tab: "Date night", occasion: "date", style: "elegant", extra: [] },
    { tab: "Party ready", occasion: "party", style: "party", extra: ["layer"] },
    { tab: "Evening glow", occasion: "evening", style: "chic", extra: [] },
  ],
};

// Role heuristics based on where the hero sits in the outfit.
const BASE_ROLES: Record<string, Array<"upper" | "bottom" | "layer">> = {
  top: ["bottom"],
  shirt: ["bottom"],
  tshirt: ["bottom"],
  kurti: ["bottom"],
  jeans: ["upper"],
  pants: ["upper"],
  skirt: ["upper"],
  shorts: ["upper"],
  dress: [],
  saree: [],
  lehenga: [],
  jacket: ["upper", "bottom"],
  blazer: ["upper", "bottom"],
  other: ["upper", "bottom"],
};

const ROLE_CATEGORIES: Record<"upper" | "bottom" | "layer", string[]> = {
  upper: ["top", "shirt", "tshirt", "kurti"],
  bottom: ["jeans", "pants", "skirt", "shorts"],
  layer: ["jacket", "blazer"],
};

function toComboItem(item: WardrobeItem): RemixComboItem {
  return { id: item.id, name: item.name, category: item.category, imageUrl: item.imageUrl };
}

function pickByRole(
  items: WardrobeItem[],
  role: "upper" | "bottom" | "layer",
  index: number,
  exclude: Set<string>,
): WardrobeItem | undefined {
  const pool = items.filter(
    (item) => ROLE_CATEGORIES[role].includes(item.category) && !exclude.has(item.id),
  );
  if (pool.length === 0) return undefined;
  return pool[index % pool.length];
}

// =============================================================
// Build the three "ways to wear it"
// =============================================================

export async function buildRemixPlan({
  userId,
  heroId,
  mood,
}: {
  userId: string;
  heroId: string;
  mood: RemixMood;
}): Promise<RemixPlan> {
  const wardrobe = await prisma.wardrobeItem.findMany({ where: { userId } });
  const hero = wardrobe.find((item) => item.id === heroId);
  if (!hero) throw new Error("Item not found in your wardrobe.");

  const baseRoles = BASE_ROLES[hero.category] ?? ["upper", "bottom"];
  const combos = (MOODS[mood] ?? MOODS.everyday).map((spec) => buildCombo(hero, wardrobe, spec, baseRoles));

  return {
    hero: toComboItem(hero),
    combos: await Promise.all(combos),
  };
}

async function buildCombo(
  hero: WardrobeItem,
  wardrobe: WardrobeItem[],
  spec: ComboSpec,
  baseRoles: Array<"upper" | "bottom" | "layer">,
): Promise<RemixCombo> {
  const roles = [...new Set([...baseRoles, ...spec.extra])];
  const companions: WardrobeItem[] = [];
  const exclude = new Set<string>([hero.id]);

  roles.forEach((role, index) => {
    const pick = pickByRole(wardrobe, role, index, exclude);
    if (pick) {
      companions.push(pick);
      exclude.add(pick.id);
    }
  });

  const outfitItems = [hero, ...companions];
  const name = `${hero.name} — ${spec.tab}`;

  const look = await generateStyling({
    wardrobeItems: outfitItems.map(toStylingItem),
    occasion: spec.occasion,
    style: spec.style,
  });

  const outfit = await prisma.outfit.create({
    data: {
      userId: hero.userId,
      name,
      occasion: spec.occasion,
      style: spec.style,
      lookData: look as unknown as Prisma.InputJsonValue,
    },
  });

  if (companions.length > 0) {
    await prisma.outfitItem.createMany({
      data: companions.map((item) => ({ outfitId: outfit.id, wardrobeItemId: item.id })),
    });
  }

  return {
    tab: spec.tab,
    occasion: spec.occasion,
    style: spec.style,
    items: outfitItems.map(toComboItem),
    lookId: outfit.id,
    look,
  };
}

function toStylingItem(item: WardrobeItem): StylingInput["wardrobeItems"][number] {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    color: item.color,
    secondaryColor: item.secondaryColor,
    pattern: item.pattern,
    occasion: item.occasion,
    season: item.season,
    style: item.style,
    imageUrl: item.imageUrl,
  };
}