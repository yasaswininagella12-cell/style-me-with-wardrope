import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TrendCard } from "@/components/trends/trend-card";

export const metadata: Metadata = {
  title: "Trend Setter",
  description: "Discover the latest fashion trends and style them with your wardrobe.",
};

export default async function TrendsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const trends = await prisma.trend.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: { items: true },
  });

  const favoriteTrendIds = await prisma.favorite.findMany({
    where: { userId, trendId: { not: null } },
    select: { trendId: true },
  });
  const favoriteIds = new Set(favoriteTrendIds.map((f) => f.trendId!));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Trend Setter</h1>
        <p className="mt-1 text-muted-foreground">
          The latest fashion trends — and how to wear them with your own wardrobe.
        </p>
      </div>

      {trends.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
          <p className="font-heading text-lg font-semibold">Trends are coming soon</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Check back soon for fresh fashion trends.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trends.map((trend) => (
            <TrendCard
              key={trend.id}
              trend={trend}
              items={trend.items}
              isFavorite={favoriteIds.has(trend.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
