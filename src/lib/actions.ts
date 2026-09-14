"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { generateStyling } from "@/lib/recommendations";
import { buildRemixPlan } from "@/lib/remix";
import { buildTripPlan } from "@/lib/packing";
import {
  favoriteSchema,
  jewelryInputSchema,
  outfitSchema,
  packingInputSchema,
  profileSchema,
  remixInputSchema,
  savedLookSchema,
  stylingInputSchema,
  wardrobeItemSchema,
} from "@/lib/validations";
import type { RecommendationItem, RemixPlan, StylingResult, TripPlan } from "@/types";
import type { Prisma } from "@/generated/prisma/client";

export type ActionResult<T = undefined> = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
};

function toFieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

// =============================================================
// Wardrobe
// =============================================================

export async function addWardrobeItem(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const parsed = wardrobeItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };
  }

  const item = await prisma.wardrobeItem.create({
    data: {
      ...parsed.data,
      userId,
      secondaryColor: parsed.data.secondaryColor || null,
      pattern: parsed.data.pattern || null,
      material: parsed.data.material || null,
      occasion: parsed.data.occasion || null,
      season: parsed.data.season || null,
      style: parsed.data.style || null,
    },
  });

  revalidatePath("/wardrobe");
  revalidatePath("/dashboard");
  return { data: { id: item.id } };
}

export async function updateWardrobeItem(id: string, input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = wardrobeItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };
  }

  const existing = await prisma.wardrobeItem.findFirst({ where: { id, userId } });
  if (!existing) {
    return { error: "Item not found." };
  }

  await prisma.wardrobeItem.update({
    where: { id },
    data: {
      ...parsed.data,
      secondaryColor: parsed.data.secondaryColor || null,
      pattern: parsed.data.pattern || null,
      material: parsed.data.material || null,
      occasion: parsed.data.occasion || null,
      season: parsed.data.season || null,
      style: parsed.data.style || null,
    },
  });

  revalidatePath("/wardrobe");
  return {};
}

export async function deleteWardrobeItem(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const existing = await prisma.wardrobeItem.findFirst({ where: { id, userId } });
  if (!existing) {
    return { error: "Item not found." };
  }
  await prisma.wardrobeItem.delete({ where: { id } });
  revalidatePath("/wardrobe");
  revalidatePath("/dashboard");
  return {};
}

// =============================================================
// Styling
// =============================================================

export async function styleOutfit(input: unknown) {
  const userId = await requireUserId();
  const parsed = stylingInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please select at least one clothing item." };
  }

  const { wardrobeItemIds, occasion, season, style, neckline } = parsed.data;

  const items = await prisma.wardrobeItem.findMany({
    where: { id: { in: wardrobeItemIds }, userId },
  });

  if (items.length !== wardrobeItemIds.length) {
    return { error: "Some selected items were not found." };
  }

  const result = await generateStyling({
    wardrobeItems: items,
    occasion,
    season,
    style,
    neckline,
  });

  const primaryStyle = style ?? items[0]?.style ?? "casual";
  const primaryOccasion = occasion ?? items[0]?.occasion ?? "casual";

  const outfit = await prisma.outfit.create({
    data: {
      userId,
      name: `${items[0]?.name ?? "My Outfit"} look`,
      occasion: primaryOccasion,
      style: primaryStyle,
      lookData: result as unknown as object,
    },
  });

  await prisma.outfitItem.createMany({
    data: wardrobeItemIds.map((wardrobeItemId) => ({
      outfitId: outfit.id,
      wardrobeItemId,
    })),
  });

  revalidatePath("/style");
  revalidatePath("/saved-looks");
  redirect(`/looks/${outfit.id}`);
}

// =============================================================
// Jewelry matcher
// =============================================================

export async function matchJewelry(input: unknown): Promise<
  ActionResult<{
    jewelry: RecommendationItem[];
    metalTone: string;
    colorPalette: string[];
    stylingTips: string[];
  }>
> {
  const userId = await requireUserId();
  const parsed = jewelryInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please choose a clothing item." };
  }

  const where = {
    userId,
    ...(parsed.data.itemId ? { id: parsed.data.itemId } : {}),
  };

  const items = await prisma.wardrobeItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  if (items.length === 0) {
    return { error: "No wardrobe items to match with. Add some pieces first." };
  }

  const result = await generateStyling({
    wardrobeItems: items,
    occasion: parsed.data.occasion,
    season: parsed.data.season,
    style: parsed.data.style,
    neckline: parsed.data.neckline,
  });

  return {
    data: {
      jewelry: result.jewelry,
      metalTone: result.metalTone,
      colorPalette: result.colorPalette,
      stylingTips: result.stylingTips,
    },
  };
}

// =============================================================
// Saved looks
// =============================================================

export async function saveLook(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const parsed = savedLookSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please enter a name for your look.", fieldErrors: toFieldErrors(parsed.error) };
  }

  const outfit = await prisma.outfit.findFirst({ where: { id: parsed.data.outfitId, userId } });
  if (!outfit) {
    return { error: "Outfit not found." };
  }

  const existing = await prisma.savedLook.findFirst({
    where: { outfitId: outfit.id, userId },
  });
  if (existing) {
    return { error: "This look is already saved." };
  }

  const saved = await prisma.savedLook.create({
    data: {
      userId,
      outfitId: outfit.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      lookData: (outfit.lookData ?? parsed.data.lookData ?? undefined) as
        | Prisma.InputJsonValue
        | undefined,
    },
  });

  revalidatePath("/saved-looks");
  revalidatePath("/looks/" + outfit.id);
  return { data: { id: saved.id } };
}

export async function deleteSavedLook(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const existing = await prisma.savedLook.findFirst({ where: { id, userId } });
  if (!existing) {
    return { error: "Look not found." };
  }
  await prisma.savedLook.delete({ where: { id } });
  revalidatePath("/saved-looks");
  revalidatePath("/dashboard");
  return {};
}

// =============================================================
// Favorites
// =============================================================

export async function toggleFavorite(input: unknown): Promise<ActionResult<{ isFavorite: boolean }>> {
  const userId = await requireUserId();
  const parsed = favoriteSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid favorite target." };
  }

  const { targetType, targetId } = parsed.data;

  const existing = await prisma.favorite.findFirst({
    where: {
      userId,
      ...(targetType === "savedLook" ? { savedLookId: targetId } : {}),
      ...(targetType === "trend" ? { trendId: targetId } : {}),
      ...(targetType === "wardrobeItem" ? { wardrobeItemId: targetId } : {}),
    },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/favorites");
    revalidatePath("/trends");
    revalidatePath("/saved-looks");
    revalidatePath("/dashboard");
    return { data: { isFavorite: false } };
  }

  await prisma.favorite.create({
    data: {
      userId,
      ...(targetType === "savedLook" ? { savedLookId: targetId } : {}),
      ...(targetType === "trend" ? { trendId: targetId } : {}),
      ...(targetType === "wardrobeItem" ? { wardrobeItemId: targetId } : {}),
    },
  });

  revalidatePath("/favorites");
  revalidatePath("/trends");
  revalidatePath("/saved-looks");
  revalidatePath("/dashboard");
  return { data: { isFavorite: true } };
}

// =============================================================
// One piece, many looks (remix)
// =============================================================

export async function buildRemixes(input: unknown): Promise<ActionResult<RemixPlan>> {
  const userId = await requireUserId();
  const parsed = remixInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Choose a piece to style first." };
  }

  try {
    const plan = await buildRemixPlan({
      userId,
      heroId: parsed.data.heroId,
      mood: parsed.data.mood,
    });
    revalidatePath("/remix");
    revalidatePath("/dashboard");
    return { data: plan };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not build the looks." };
  }
}

// =============================================================
// Trip packing / capsule planner
// =============================================================

export async function planPacking(input: unknown): Promise<ActionResult<TripPlan>> {
  const userId = await requireUserId();
  const parsed = packingInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields." };
  }

  try {
    const plan = await buildTripPlan({
      userId,
      destination: parsed.data.destination?.trim() || null,
      days: parsed.data.days,
      vibe: parsed.data.vibe as "beach" | "city" | "mountains" | "desert" | "festival" | "formal",
      season: parsed.data.season || null,
    });
    revalidatePath("/packing");
    revalidatePath("/dashboard");
    return { data: plan };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not plan your trip." };
  }
}

// =============================================================
// Profile
// =============================================================

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      image: parsed.data.image || null,
      bodyPhotoUrl: parsed.data.bodyPhotoUrl || null,
      gender: parsed.data.gender || null,
      preferredStyle: parsed.data.preferredStyle || null,
      preferredColorPalette: parsed.data.preferredColorPalette || null,
    },
  });
  revalidatePath("/profile");
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/looks");
  return {};
}

export type { StylingResult };
