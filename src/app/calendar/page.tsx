import type { Metadata } from "next";
import { auth } from "@/auth";
import {
  CalendarClient,
  type CalendarOutfitOption,
  type CalendarPlanItem,
} from "@/components/calendar/calendar-client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Outfit Calendar",
  description: "Plan your outfits day by day and keep track of what you have worn.",
};

export default async function CalendarPage() {
  const session = await auth();
  const userId = session!.user.id;

  const plans = await prisma.outfitPlan.findMany({
    where: { userId },
    include: {
      outfit: {
        include: {
          items: {
            include: { wardrobeItem: { select: { imageUrl: true } } },
            take: 3,
          },
        },
      },
    },
    orderBy: { date: "asc" },
  });

  const outfits = await prisma.outfit.findMany({
    where: { userId },
    include: {
      items: {
        include: { wardrobeItem: { select: { imageUrl: true } } },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  const planItems: CalendarPlanItem[] = plans.map((plan) => ({
    id: plan.id,
    date: plan.date,
    note: plan.note,
    isWorn: plan.isWorn,
    outfit: {
      id: plan.outfit.id,
      name: plan.outfit.name,
      occasion: plan.outfit.occasion,
      images: plan.outfit.items.map((item) => item.wardrobeItem.imageUrl),
    },
  }));

  const outfitOptions: CalendarOutfitOption[] = outfits.map((outfit) => ({
    id: outfit.id,
    name: outfit.name,
    imageUrl: outfit.items[0]?.wardrobeItem.imageUrl ?? null,
    occasion: outfit.occasion,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-gold">Calendar</p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">Outfit calendar</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Give every outfit a day, add a note, and mark it worn when you have dressed up.
        </p>
      </div>
      <CalendarClient plans={planItems} outfits={outfitOptions} />
    </div>
  );
}
