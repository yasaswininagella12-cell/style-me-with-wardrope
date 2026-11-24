import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WearClient, type WearItem } from "@/components/wear/wear-client";

export const metadata: Metadata = {
  title: "Wear & Care",
  description: "Track how often you wear your pieces and stay on top of garment care.",
};

export default async function WearPage() {
  const session = await auth();
  const userId = session!.user.id;

  const items = await prisma.wardrobeItem.findMany({
    where: { userId },
    include: {
      wearLogs: { orderBy: { wornAt: "desc" }, take: 1 },
      careLogs: { orderBy: { caredAt: "desc" }, take: 1 },
      _count: { select: { wearLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const wearItems: WearItem[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    imageUrl: item.imageUrl,
    category: item.category,
    purchasePrice: item.purchasePrice,
    careInstructions: item.careInstructions,
    careIntervalDays: item.careIntervalDays,
    wearCount: item._count.wearLogs,
    lastWornAt: item.wearLogs[0]?.wornAt.toISOString() ?? null,
    lastCareAt: item.careLogs[0]?.caredAt.toISOString() ?? null,
    nextCareDueAt: item.careLogs[0]?.nextDueAt?.toISOString() ?? null,
    lastCareType: item.careLogs[0]?.careType ?? null,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Wear &amp; Care</h1>
        <p className="mt-1 text-muted-foreground">
          See what you reach for most, what each wear costs, and which pieces need a little care.
        </p>
      </div>
      <WearClient items={wearItems} />
    </div>
  );
}
