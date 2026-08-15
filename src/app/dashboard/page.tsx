import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shirt, Bookmark, Heart, Wand2, Gem, TrendingUp, Plus, UserRound } from "lucide-react";
import { optionLabel } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Style Me With Wardrobe overview.",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [
    user,
    wardrobeCount,
    savedLooksCount,
    outfitCount,
    favoriteCount,
    recentItems,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.wardrobeItem.count({ where: { userId } }),
    prisma.savedLook.count({ where: { userId } }),
    prisma.outfit.count({ where: { userId } }),
    prisma.favorite.count({ where: { userId } }),
    prisma.wardrobeItem.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const stats = [
    { label: "Wardrobe items", value: wardrobeCount, icon: Shirt, href: "/wardrobe" },
    { label: "Saved looks", value: savedLooksCount, icon: Bookmark, href: "/saved-looks" },
    { label: "Outfits created", value: outfitCount, icon: Wand2, href: "/style" },
    { label: "Favorites", value: favoriteCount, icon: Heart, href: "/favorites" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-brand-gold">Dashboard</p>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
        </div>
        <Button asChild>
          <Link href="/style">
            <Wand2 className="mr-2 size-4" aria-hidden="true" />
            Style an outfit
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group">
            <Card className="transition-shadow group-hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <stat.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-heading text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {!user?.bodyPhotoUrl && (
        <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-brand-gold/40 bg-brand-gold/5 p-5">
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
            <UserRound className="size-5" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="font-heading text-lg font-semibold">Try outfits on your own photo</p>
            <p className="text-sm text-muted-foreground">
              Upload one full top-to-bottom photo, and every generated look will be shown worn on
              your picture — like a virtual dressing room.
            </p>
          </div>
          <Button asChild>
            <Link href="/onboarding">
              <UserRound className="mr-2 size-4" aria-hidden="true" />
              Add my photo
            </Link>
          </Button>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="font-heading text-lg">Recent wardrobe items</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/wardrobe">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentItems.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Shirt className="size-8 text-muted-foreground" aria-hidden="true" />
                <p className="mt-3 text-sm text-muted-foreground">Your wardrobe is empty.</p>
                <Button asChild className="mt-4">
                  <Link href="/wardrobe">
                    <Plus className="mr-2 size-4" aria-hidden="true" />
                    Add your first item
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {recentItems.map((item) => (
                  <Link key={item.id} href="/wardrobe" className="group">
                    <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="(min-width: 1024px) 20vw, 50vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 truncate text-sm font-medium">{item.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {optionLabel(item.category)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/jewelry">
                  <Gem className="mr-2 size-4" aria-hidden="true" />
                  Match jewelry
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/trends">
                  <TrendingUp className="mr-2 size-4" aria-hidden="true" />
                  Browse trends
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/saved-looks">
                  <Bookmark className="mr-2 size-4" aria-hidden="true" />
                  Saved looks
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Your style profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Preferred style</span>
                <span className="font-medium">{optionLabel(user?.preferredStyle, "Not set")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Color palette</span>
                <span className="font-medium">
                  {optionLabel(user?.preferredColorPalette, "Not set")}
                </span>
              </div>
              <Button asChild variant="link" className="h-auto px-0 text-sm">
                <Link href="/profile">Edit profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
