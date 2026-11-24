"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  budgetSchema,
  careLogSchema,
  itemCareSchema,
  lookCommentSchema,
  outfitPlanSchema,
  wearLogSchema,
  wishlistItemSchema,
} from "@/lib/validations";

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
// Outfit calendar
// =============================================================

export async function scheduleOutfit(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const parsed = outfitPlanSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Choose an outfit and a date.", fieldErrors: toFieldErrors(parsed.error) };
  }

  const outfit = await prisma.outfit.findFirst({
    where: { id: parsed.data.outfitId, userId },
    select: { id: true },
  });
  if (!outfit) {
    return { error: "Outfit not found." };
  }

  const plan = await prisma.outfitPlan.upsert({
    where: {
      userId_outfitId_date: { userId, outfitId: outfit.id, date: parsed.data.date },
    },
    update: { note: parsed.data.note || null },
    create: {
      userId,
      outfitId: outfit.id,
      date: parsed.data.date,
      note: parsed.data.note || null,
    },
  });

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { data: { id: plan.id } };
}

export async function removeOutfitPlan(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const plan = await prisma.outfitPlan.findFirst({ where: { id, userId }, select: { id: true } });
  if (!plan) {
    return { error: "Plan not found." };
  }
  await prisma.outfitPlan.delete({ where: { id } });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return {};
}

export async function markPlanWorn(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const plan = await prisma.outfitPlan.findFirst({
    where: { id, userId },
    include: { outfit: { include: { items: { select: { wardrobeItemId: true } } } } },
  });
  if (!plan) {
    return { error: "Plan not found." };
  }
  if (plan.isWorn) {
    return {};
  }

  const itemIds = plan.outfit.items.map((item) => item.wardrobeItemId);
  await prisma.$transaction([
    prisma.outfitPlan.update({ where: { id }, data: { isWorn: true } }),
    ...(itemIds.length > 0
      ? [
          prisma.wearLog.createMany({
            data: itemIds.map((wardrobeItemId) => ({
              userId,
              wardrobeItemId,
              source: "calendar",
              note: `Worn from calendar plan on ${plan.date}`,
            })),
          }),
        ]
      : []),
  ]);

  revalidatePath("/calendar");
  revalidatePath("/wear");
  revalidatePath("/dashboard");
  return {};
}

// =============================================================
// Wear tracking & garment care
// =============================================================

export async function logWear(input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = wearLogSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Select at least one item to log.", fieldErrors: toFieldErrors(parsed.error) };
  }

  const items = await prisma.wardrobeItem.findMany({
    where: { id: { in: parsed.data.itemIds }, userId },
    select: { id: true },
  });
  if (items.length !== parsed.data.itemIds.length) {
    return { error: "Some selected items were not found." };
  }

  await prisma.wearLog.createMany({
    data: parsed.data.itemIds.map((wardrobeItemId) => ({
      userId,
      wardrobeItemId,
      note: parsed.data.note || null,
    })),
  });

  revalidatePath("/wear");
  revalidatePath("/dashboard");
  return {};
}

export async function logCare(input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = careLogSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please check the care details.", fieldErrors: toFieldErrors(parsed.error) };
  }

  const item = await prisma.wardrobeItem.findFirst({
    where: { id: parsed.data.wardrobeItemId, userId },
    select: { careIntervalDays: true },
  });
  if (!item) {
    return { error: "Item not found." };
  }

  await prisma.careLog.create({
    data: {
      userId,
      wardrobeItemId: parsed.data.wardrobeItemId,
      careType: parsed.data.careType,
      note: parsed.data.note || null,
      nextDueAt: new Date(Date.now() + item.careIntervalDays * 24 * 60 * 60 * 1000),
    },
  });

  revalidatePath("/wear");
  revalidatePath("/wardrobe");
  return {};
}

export async function updateItemCare(input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = itemCareSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please check the details.", fieldErrors: toFieldErrors(parsed.error) };
  }

  const item = await prisma.wardrobeItem.findFirst({
    where: { id: parsed.data.wardrobeItemId, userId },
    select: { id: true },
  });
  if (!item) {
    return { error: "Item not found." };
  }

  await prisma.wardrobeItem.update({
    where: { id: item.id },
    data: {
      purchasePrice: parsed.data.purchasePrice ?? null,
      careInstructions: parsed.data.careInstructions || null,
      careIntervalDays: parsed.data.careIntervalDays,
    },
  });

  revalidatePath("/wear");
  revalidatePath("/wardrobe");
  return {};
}

// =============================================================
// Wishlist & budget
// =============================================================

export async function addWishlistItem(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const parsed = wishlistItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please check the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };
  }

  const item = await prisma.wishlistItem.create({
    data: {
      userId,
      name: parsed.data.name,
      category: parsed.data.category || null,
      estimatedPrice: parsed.data.estimatedPrice ?? null,
      priority: parsed.data.priority,
      link: parsed.data.link || null,
      imageUrl: parsed.data.imageUrl || null,
      note: parsed.data.note || null,
    },
  });

  revalidatePath("/wishlist");
  revalidatePath("/dashboard");
  return { data: { id: item.id } };
}

export async function updateWishlistItem(id: string, input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = wishlistItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please check the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };
  }

  const existing = await prisma.wishlistItem.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) {
    return { error: "Wishlist item not found." };
  }

  await prisma.wishlistItem.update({
    where: { id },
    data: {
      name: parsed.data.name,
      category: parsed.data.category || null,
      estimatedPrice: parsed.data.estimatedPrice ?? null,
      priority: parsed.data.priority,
      link: parsed.data.link || null,
      imageUrl: parsed.data.imageUrl || null,
      note: parsed.data.note || null,
    },
  });

  revalidatePath("/wishlist");
  return {};
}

export async function deleteWishlistItem(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const existing = await prisma.wishlistItem.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) {
    return { error: "Wishlist item not found." };
  }
  await prisma.wishlistItem.delete({ where: { id } });
  revalidatePath("/wishlist");
  return {};
}

export async function toggleWishlistPurchased(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const item = await prisma.wishlistItem.findFirst({
    where: { id, userId },
    select: { status: true },
  });
  if (!item) {
    return { error: "Wishlist item not found." };
  }

  const purchased = item.status !== "purchased";
  await prisma.wishlistItem.update({
    where: { id },
    data: { status: purchased ? "purchased" : "planned", purchasedAt: purchased ? new Date() : null },
  });

  revalidatePath("/wishlist");
  return {};
}

export async function setMonthlyBudget(input: unknown): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Enter a valid monthly budget.", fieldErrors: toFieldErrors(parsed.error) };
  }

  await prisma.budget.upsert({
    where: { userId },
    update: { monthlyLimit: parsed.data.monthlyLimit },
    create: { userId, monthlyLimit: parsed.data.monthlyLimit },
  });

  revalidatePath("/wishlist");
  revalidatePath("/dashboard");
  return {};
}

// =============================================================
// Social look feed
// =============================================================

export async function toggleLookPublic(savedLookId: string): Promise<ActionResult<{ isPublic: boolean }>> {
  const userId = await requireUserId();
  const look = await prisma.savedLook.findFirst({
    where: { id: savedLookId, userId },
    select: { isPublic: true },
  });
  if (!look) {
    return { error: "Look not found." };
  }

  const isPublic = !look.isPublic;
  await prisma.savedLook.update({ where: { id: savedLookId }, data: { isPublic } });

  revalidatePath("/feed");
  revalidatePath("/saved-looks");
  revalidatePath("/users/[id]", "page");
  return { data: { isPublic } };
}

export async function toggleFollow(targetUserId: string): Promise<ActionResult<{ isFollowing: boolean }>> {
  const userId = await requireUserId();
  if (userId === targetUserId) {
    return { error: "You can't follow yourself." };
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true },
  });
  if (!target) {
    return { error: "User not found." };
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: userId, followingId: targetUserId } },
    select: { id: true },
  });

  let isFollowing: boolean;
  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    isFollowing = false;
  } else {
    await prisma.follow.create({ data: { followerId: userId, followingId: targetUserId } });
    isFollowing = true;
  }

  revalidatePath("/feed");
  revalidatePath("/users/[id]", "page");
  return { data: { isFollowing } };
}

export async function toggleLookLike(savedLookId: string): Promise<
  ActionResult<{ isLiked: boolean; likeCount: number }>
> {
  const userId = await requireUserId();
  const look = await prisma.savedLook.findFirst({
    where: { id: savedLookId },
    select: { userId: true, isPublic: true },
  });
  if (!look || (!look.isPublic && look.userId !== userId)) {
    return { error: "Look not found." };
  }

  const existing = await prisma.lookLike.findUnique({
    where: { userId_savedLookId: { userId, savedLookId } },
    select: { id: true },
  });

  let isLiked: boolean;
  if (existing) {
    await prisma.lookLike.delete({ where: { id: existing.id } });
    isLiked = false;
  } else {
    await prisma.lookLike.create({ data: { userId, savedLookId } });
    isLiked = true;
  }

  const likeCount = await prisma.lookLike.count({ where: { savedLookId } });
  revalidatePath("/feed");
  revalidatePath("/feed/[id]", "page");
  return { data: { isLiked, likeCount } };
}

export async function addLookComment(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId();
  const parsed = lookCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Write a comment first.", fieldErrors: toFieldErrors(parsed.error) };
  }

  const look = await prisma.savedLook.findFirst({
    where: { id: parsed.data.savedLookId },
    select: { userId: true, isPublic: true },
  });
  if (!look || (!look.isPublic && look.userId !== userId)) {
    return { error: "Look not found." };
  }

  const comment = await prisma.lookComment.create({
    data: { userId, savedLookId: parsed.data.savedLookId, body: parsed.data.body },
  });

  revalidatePath("/feed");
  revalidatePath("/feed/[id]", "page");
  return { data: { id: comment.id } };
}

export async function deleteLookComment(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const comment = await prisma.lookComment.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!comment) {
    return { error: "Comment not found." };
  }
  await prisma.lookComment.delete({ where: { id } });
  revalidatePath("/feed");
  revalidatePath("/feed/[id]", "page");
  return {};
}
