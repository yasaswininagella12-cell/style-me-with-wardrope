import type { Metadata } from "next";
import { auth } from "@/auth";
import { FeedClient, type FeedLook } from "@/components/feed/feed-client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Style Feed",
  description: "Discover public looks from the Style Me community.",
};

export default async function FeedPage() {
  const session = await auth();
  const userId = session?.user.id ?? "";

  const [looks, follows] = await Promise.all([
    prisma.savedLook.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { id: true, name: true, image: true } },
        outfit: {
          include: {
            items: {
              include: {
                wardrobeItem: { select: { imageUrl: true, name: true } },
              },
            },
          },
        },
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    }),
  ]);

  const followedIds = new Set(follows.map((follow) => follow.followingId));

  const feedLooks: FeedLook[] = looks.map((look) => {
    const items = look.outfit.items.map((item) => item.wardrobeItem);
    return {
      id: look.id,
      name: look.name,
      description: look.description,
      createdAt: look.createdAt.toISOString(),
      author: {
        id: look.user.id,
        name: look.user.name ?? "Style lover",
        image: look.user.image,
      },
      images: items.slice(0, 3).map((item) => item.imageUrl),
      itemNames: items.map((item) => item.name),
      occasion: look.outfit.occasion,
      likeCount: look._count.likes,
      commentCount: look._count.comments,
      isLiked: look.likes.length > 0,
      isFollowing: followedIds.has(look.userId),
      isOwn: look.userId === userId,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <FeedClient looks={feedLooks} />
    </div>
  );
}
