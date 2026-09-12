import "server-only";

import { prisma } from "@/lib/prisma";
import { generateStyling } from "@/lib/recommendations";
import type {
  StylingInput,
  StylingResult,
  TripChecklistGroup,
  TripDayPlan,
  TripPackingItem,
  TripPlan,
  TripSampleLook,
} from "@/types";
import type { Prisma, WardrobeItem } from "@/generated/prisma/client";

export type TripVibe = "beach" | "city" | "mountains" | "desert" | "festival" | "formal";

interface VibeProfile {
  style: string;
  occasion: string;
  season: string;
  tip: string;
  footwear: string[];
  extras: string[];
}

const VIBES: Record<TripVibe, VibeProfile> = {
  beach: {
    style: "casual",
    occasion: "vacation",
    season: "summer",
    tip: "Go light and breathable — linen, cottons and swim-ready layers mix and dry fast.",
    footwear: ["Flat sandals", "Flip-flops / slides", "Beach sneakers", "Water shoes"],
    extras: ["Sunglasses", "Straw hat", "Crossbody bag", "Light cardigan for evenings"],
  },
  city: {
    style: "chic",
    occasion: "evening",
    season: "all-season",
    tip: "Mix a few statement pieces with walkable shoes — you'll be on your feet all day.",
    footwear: ["Comfy sneakers", "Loafers / mules", "Strappy flats", "One pair of heels"],
    extras: ["Crossbody bag", "Sunglasses", "Scarf / wrap", "Camera", "Reusable water bottle"],
  },
  mountains: {
    style: "casual",
    occasion: "vacation",
    season: "winter",
    tip: "Build layers, not bulk — thin thermals under one warm coat beat five sweaters.",
    footwear: ["Waterproof hiking boots", "Warm insulated boots", "Thick socks ×3"],
    extras: ["Beanie", "Gloves", "Scarf", "Thermals", "Backpack"],
  },
  desert: {
    style: "casual",
    occasion: "vacation",
    season: "summer",
    tip: "Cover skin from the sun with flowing fabrics and always carry a light layer for cool nights.",
    footwear: ["Closed-toe sandals", "Sturdy flats", "Light sneakers"],
    extras: ["Sunglasses", "Wide-brim hat", "Shawl / throw", "Reusable bottle"],
  },
  festival: {
    style: "traditional",
    occasion: "festival",
    season: "summer",
    tip: "Bright colors and easy separates rule — keep patterns planned so every top meets every bottom.",
    footwear: ["Juttis / embellished flats", "Comfortable sandals", "One stand-out heel"],
    extras: ["Clutch / potli", "Statement earrings", "Bangle stack", "Compact fan"],
  },
  formal: {
    style: "formal",
    occasion: "work",
    season: "all-season",
    tip: "Pack iron-free fabrics and a capsule in one accent color — 8 pieces become 10+ outfit pairs.",
    footwear: ["Polished loafers", "Neutral pumps", "Clean leather pair"],
    extras: ["Structured tote", "Minimal watch", "Steamer", "Spare blazer"],
  },
};

const NEUTRALS = new Set(["black", "white", "grey", "beige", "nude", "navy"]);

const UPPER = ["top", "shirt", "tshirt", "kurti"];
const BOTTOM = ["jeans", "pants", "skirt", "shorts"];
const FULL = ["dress", "saree", "lehenga"];
const LAYER = ["jacket", "blazer", "other"];

function scoreItem(item: WardrobeItem, profile: VibeProfile): number {
  let score = 1;
  if (item.style && item.style === profile.style) score += 3;
  if (item.occasion && item.occasion === profile.occasion) score += 3;
  if (item.season && item.season === profile.season) score += 2;
  if (NEUTRALS.has(item.color)) score += 1;
  return score;
}

function toTripItem(item: WardrobeItem): TripPackingItem {
  return { id: item.id, name: item.name, imageUrl: item.imageUrl, category: item.category };
}

function genericItem(name: string, category: string): TripPackingItem {
  return { id: `generic-${category}-${name}`, name, imageUrl: "", category };
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

function pickTop(items: WardrobeItem[], relevant: string[], profile: VibeProfile, count: number): WardrobeItem[] {
  return items
    .filter((item) => relevant.includes(item.category))
    .sort((a, b) => scoreItem(b, profile) - scoreItem(a, profile))
    .slice(0, count);
}

function capsuleFor(wardrobe: WardrobeItem[], profile: VibeProfile, days: number): WardrobeItem[] {
  const maxCapsule = Math.min(12, Math.max(5, 3 + Math.ceil(days * 1.2)));
  const topCount = Math.min(3, Math.max(2, Math.ceil(days / 3)));
  const bottomCount = Math.min(3, Math.max(2, Math.ceil(days / 4)));
  const dressCount = Math.min(2, Math.max(1, Math.ceil(days / 6)));
  const layerCount = Math.min(2, Math.max(1, Math.ceil(days / 7)));

  const tops = pickTop(wardrobe, UPPER, profile, topCount);
  const bottoms = pickTop(wardrobe, BOTTOM, profile, bottomCount);
  const dresses = pickTop(wardrobe, FULL, profile, dressCount);
  const layers = pickTop(wardrobe, LAYER, profile, layerCount);

  const capsule: WardrobeItem[] = [];
  for (const group of [tops, bottoms, dresses, layers]) {
    for (const item of group) {
      if (capsule.length >= maxCapsule) break;
      capsule.push(item);
    }
  }
  return capsule;
}

function dayOccasions(profile: VibeProfile, days: number): string[] {
  const rotation = [profile.occasion, "casual", "casual", profile.occasion, "evening"];
  if (profile.occasion === "festival") rotation.splice(0, 0, "festival");
  const out: string[] = [];
  for (let i = 0; i < days; i++) out.push(rotation[i % rotation.length]);
  return out;
}

function buildDayPlans(
  capsule: WardrobeItem[],
  profile: VibeProfile,
  days: number,
): TripDayPlan[] {
  const uppers = capsule.filter((i) => UPPER.includes(i.category));
  const bottoms = capsule.filter((i) => BOTTOM.includes(i.category));
  const fulls = capsule.filter((i) => FULL.includes(i.category));
  const layers = capsule.filter((i) => LAYER.includes(i.category));
  const occasions = dayOccasions(profile, days);
  const maxDays = Math.min(days, 30);

  const plans: TripDayPlan[] = [];
  let fullIndex = 0;
  let comboIndex = 0;

  for (let day = 1; day <= maxDays; day++) {
    const items: string[] = [];
    let name = "";

    if (fulls.length > 0 && day % 2 === 0) {
      const piece = fulls[fullIndex % fulls.length];
      fullIndex += 1;
      items.push(piece.id);
      name = `Wear the ${piece.name}`;
    } else if (uppers.length > 0 && bottoms.length > 0) {
      const upper = uppers[comboIndex % uppers.length];
      const bottom = bottoms[(comboIndex + Math.floor(comboIndex / uppers.length)) % bottoms.length];
      comboIndex += 1;
      items.push(upper.id, bottom.id);
      name = `${upper.name} + ${bottom.name}`;
    } else if (uppers.length > 0) {
      items.push(uppers[comboIndex % uppers.length].id);
      comboIndex += 1;
      name = `Just the ${uppers[(comboIndex - 1) % uppers.length].name}`;
    } else if (fulls.length > 0) {
      const piece = fulls[fullIndex % fulls.length];
      fullIndex += 1;
      items.push(piece.id);
      name = `Wear the ${piece.name}`;
    } else if (bottoms.length > 0) {
      items.push(bottoms[comboIndex % bottoms.length].id);
      comboIndex += 1;
      name = "Keep it simple";
    } else {
      name = "Mix from what you packed";
    }

    if (layers.length > 0 && day % 3 === 0) {
      const layer = layers[day % layers.length];
      if (layer && !items.includes(layer.id)) items.push(layer.id);
    }

    plans.push({ day, name, occasion: occasions[day - 1], itemIds: items });
  }

  return plans;
}

function checklistFor(
  capsule: WardrobeItem[],
  profile: VibeProfile,
): TripChecklistGroup[] {
  const groups: TripChecklistGroup[] = [];

  const tops = capsule.filter((i) => UPPER.includes(i.category)).map(toTripItem);
  const bottoms = capsule.filter((i) => BOTTOM.includes(i.category)).map(toTripItem);
  const fulls = capsule.filter((i) => FULL.includes(i.category)).map(toTripItem);
  const layers = capsule.filter((i) => LAYER.includes(i.category)).map(toTripItem);

  if (tops.length > 0) groups.push({ group: "Tops", note: "The mixable base of every day.", items: tops });
  if (bottoms.length > 0) groups.push({ group: "Bottoms", note: "Reused across the whole trip.", items: bottoms });
  if (fulls.length > 0) groups.push({ group: "Dresses & one-pieces", note: "One piece, zero effort.", items: fulls });
  if (layers.length > 0) groups.push({ group: "Layers", note: "Weather insurance.", items: layers });

  if (layers.length === 0) {
    groups.push({
      group: "Layers",
      note: "You have no jackets — add a light one.",
      items: [genericItem("Light jacket / cardigan", "layer")],
    });
  }

  groups.push({
    group: "Footwear",
    note: "Suggested pairs for the vibe.",
    items: profile.footwear.map((f) => genericItem(f, "footwear")),
  });

  const accessories = capsule
    .filter((i) => i.category === "other")
    .slice(0, 4)
    .map(toTripItem);
  const extraItems = [
    ...profile.extras.map((e) => genericItem(e, "accessories")),
    ...accessories,
  ];
  groups.push({ group: "Bags & accessories", note: "The finishing touches.", items: extraItems });

  groups.push({
    group: "Self-care & must-haves",
    note: "Non-clothing essentials.",
    items: [
      genericItem("Charger + power bank", "misc"),
      genericItem("Toiletries (under 100 ml)", "misc"),
      genericItem("Medications + prescriptions", "misc"),
      genericItem("Travel documents & IDs", "misc"),
    ],
  });

  return groups;
}

export async function buildTripPlan({
  userId,
  destination,
  days,
  vibe,
  season,
}: {
  userId: string;
  destination?: string | null;
  days: number;
  vibe: TripVibe;
  season: string | null;
}): Promise<TripPlan> {
  const profile = VIBES[vibe] ?? VIBES.city;
  const resolvedSeason = season && season !== "auto" ? season : profile.season;

  if (season && season !== "auto") {
    profile.season = season;
  }

  const wardrobe = await prisma.wardrobeItem.findMany({ where: { userId } });
  const capsule = capsuleFor(wardrobe, profile, days);
  const dayPlans = buildDayPlans(capsule, profile, days);
  const checklist = checklistFor(capsule, profile);

  const sampleLooks: TripSampleLook[] = [];
  if (capsule.length > 0 && dayPlans.length > 0) {
    const sampleDays = [dayPlans[0], dayPlans[Math.min(3, dayPlans.length - 1)], ...(dayPlans[dayPlans.length - 1] ? [dayPlans[dayPlans.length - 1]] : [])].slice(0, 3);
    const uniqueDays = [...new Map(sampleDays.map((d) => [d.day, d])).values()];

    for (const day of uniqueDays.slice(0, 2)) {
      const items = day.itemIds
        .map((id) => wardrobe.find((w) => w.id === id))
        .filter((w): w is WardrobeItem => Boolean(w));
      if (items.length === 0) continue;

      const look = await generateStyling({
        wardrobeItems: items.map(toStylingItem),
        occasion: day.occasion,
        style: profile.style,
      });

      const outfit = await prisma.outfit.create({
        data: {
          userId,
          name: `Trip look — Day ${day.day}: ${day.name}`,
          occasion: day.occasion,
          style: profile.style,
          lookData: look as unknown as Prisma.InputJsonValue,
        },
      });
      if (items.length > 1) {
        await prisma.outfitItem.createMany({
          data: items.map((item) => ({ outfitId: outfit.id, wardrobeItemId: item.id })),
        });
      }

      sampleLooks.push({
        id: outfit.id,
        name: day.name,
        occasion: day.occasion,
        lookUrl: `/looks/${outfit.id}`,
        look,
      });
    }
  }

  return {
    destination: destination?.trim() || "your trip",
    days,
    vibe,
    season: resolvedSeason,
    capsule: capsule.map(toTripItem),
    checklist,
    dayPlans,
    sampleLooks,
    tip: profile.tip,
  };
}

export type TripLook = StylingResult;