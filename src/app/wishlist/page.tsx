import type { Metadata } from "next";
import { auth } from "@/auth";
import { WishlistClient, type WishlistView } from "@/components/wishlist/wishlist-client";
import { prisma } from "@/lib/prisma";
import { buildWishlistSuggestions } from "@/lib/wishlist";

export const metadata: Metadata = {
  title: "Wishlist & Budget",
  description: "Plan wardrobe gaps, track purchases and stay within a monthly budget.",
};

export default async function WishlistPage() {
  const session = await auth();
  const userId = session!.user.id;

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  const budget = await prisma.budget.findUnique({ where: { userId } });
  const wardrobeItems = await prisma.wardrobeItem.findMany({ where: { userId } });

  const now = new Date();
  const spentThisMonth = wishlistItems.reduce((total, item) => {
    if (!item.purchasedAt) return total;
    if (
      item.purchasedAt.getUTCFullYear() !== now.getUTCFullYear() ||
      item.purchasedAt.getUTCMonth() !== now.getUTCMonth()
    ) {
      return total;
    }
    return total + (item.estimatedPrice ?? 0);
  }, 0);

  const suggestions = buildWishlistSuggestions(wardrobeItems, wishlistItems);

  const items: WishlistView["items"] = wishlistItems.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    estimatedPrice: item.estimatedPrice,
    priority: item.priority as WishlistView["items"][number]["priority"],
    status: item.status as WishlistView["items"][number]["status"],
    link: item.link,
    imageUrl: item.imageUrl,
    note: item.note,
    purchasedAt: item.purchasedAt ? item.purchasedAt.toISOString() : null,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-gold">Wishlist</p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">Wishlist &amp; budget</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Turn wardrobe gaps into an intentional shopping list and keep this month&apos;s spend in view.
        </p>
      </div>
      <WishlistClient
        data={{
          items,
          monthlyLimit: budget?.monthlyLimit ?? 0,
          spentThisMonth,
          suggestions,
        }}
      />
    </div>
  );
}
