import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Shirt, Bookmark, Flame } from "lucide-react";
import { optionLabel } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your favorite looks, trends and wardrobe items.",
};

export default async function FavoritesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      savedLook: {
        include: {
          outfit: {
            include: {
              items: {
                include: { wardrobeItem: { select: { id: true, name: true, imageUrl: true } } },
              },
            },
          },
        },
      },
      trend: { include: { items: true } },
      wardrobeItem: true,
    },
  });

  const savedLookFavs = favorites.filter((f) => f.savedLook);
  const trendFavs = favorites.filter((f) => f.trend);
  const itemFavs = favorites.filter((f) => f.wardrobeItem);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Favorites</h1>
        <p className="mt-1 text-muted-foreground">
          Everything you&apos;ve hearted — looks, trends and wardrobe pieces.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
          <Heart className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-4 font-heading text-lg font-semibold">No favorites yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap the heart on any look, trend or wardrobe item to save it here.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {savedLookFavs.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-heading text-xl font-semibold">
                <Bookmark className="size-5 text-brand-gold" aria-hidden="true" />
                Saved looks
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedLookFavs.map((fav) => (
                  <Card key={fav.id} className="overflow-hidden">
                    <div className="flex aspect-[16/9] gap-0.5 bg-muted">
                      {fav.savedLook!.outfit.items.slice(0, 3).map((oi) => (
                        <div key={oi.wardrobeItem.id} className="relative flex-1">
                          <Image
                            src={oi.wardrobeItem.imageUrl}
                            alt={oi.wardrobeItem.name}
                            fill
                            sizes="(min-width: 1024px) 25vw, 50vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <CardContent className="p-4">
                      <p className="truncate font-medium">{fav.savedLook!.name}</p>
                      <Button asChild variant="link" className="h-auto px-0 text-sm">
                        <Link href={`/looks/${fav.savedLook!.outfitId}`}>View look</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {trendFavs.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-heading text-xl font-semibold">
                <Flame className="size-5 text-brand-gold" aria-hidden="true" />
                Trends
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trendFavs.map((fav) => (
                  <Card key={fav.id}>
                    <CardContent className="p-4">
                      <p className="font-medium">{fav.trend!.name}</p>
                      {fav.trend!.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {fav.trend!.description}
                        </p>
                      )}
                      {fav.trend!.style && (
                        <Badge variant="secondary" className="mt-2 rounded-full text-xs">
                          {optionLabel(fav.trend!.style)}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {itemFavs.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-heading text-xl font-semibold">
                <Shirt className="size-5 text-brand-gold" aria-hidden="true" />
                Wardrobe items
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {itemFavs.map((fav) => (
                  <Card key={fav.id} className="overflow-hidden">
                    <div className="relative aspect-square bg-muted">
                      <Image
                        src={fav.wardrobeItem!.imageUrl}
                        alt={fav.wardrobeItem!.name}
                        fill
                        sizes="(min-width: 1024px) 20vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      <p className="truncate text-sm font-medium">{fav.wardrobeItem!.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {optionLabel(fav.wardrobeItem!.category)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
