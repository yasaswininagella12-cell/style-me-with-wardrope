import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { SavedLookCard } from "@/components/saved-looks/saved-look-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Saved Looks",
  description: "Your saved complete looks.",
};

export default async function SavedLooksPage() {
  const session = await auth();
  const userId = session!.user.id;

  const savedLooks = await prisma.savedLook.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      outfit: {
        include: {
          items: { include: { wardrobeItem: { select: { id: true, name: true, imageUrl: true } } } },
        },
      },
    },
  });

  const favoriteLookIds = await prisma.favorite.findMany({
    where: { userId, savedLookId: { not: null } },
    select: { savedLookId: true },
  });
  const favoriteIds = new Set(favoriteLookIds.map((f) => f.savedLookId!));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Saved Looks</h1>
        <p className="mt-1 text-muted-foreground">
          The complete looks you loved — revisit them anytime.
        </p>
      </div>

      {savedLooks.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
          <p className="font-heading text-lg font-semibold">No saved looks yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Generate a look with Style My Outfit, then hit &ldquo;Save this look&rdquo; to keep
            it here.
          </p>
          <Button asChild className="mt-6">
            <Link href="/style">Style an outfit</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {savedLooks.map((look) => (
            <SavedLookCard
              key={look.id}
              look={{
                id: look.id,
                name: look.name,
                description: look.description,
                outfitId: look.outfitId,
                createdAt: look.createdAt,
                outfit: {
                  name: look.outfit.name,
                  items: look.outfit.items,
                },
                isFavorite: favoriteIds.has(look.id),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
