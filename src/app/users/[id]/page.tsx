import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { UserProfileClient } from "@/components/feed/user-profile-client";
import type { FeedLook } from "@/components/feed/feed-client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Stylist profile",
  description: "Explore public looks from a Style Me community member.",
};

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const viewerId = session?.user.id ?? "";

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      preferredStyle: true,
    },
  });

  if (!user) notFound();

  const [looks, followers, following, follow] = await Promise.all([
    prisma.savedLook.findMany({
      where: { userId: id, isPublic: true },
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
        likes: { where: { userId: viewerId }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.follow.count({ where: { followingId: id } }),
    prisma.follow.count({ where: { followerId: id } }),
    prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: viewerId, followingId: id },
      },
      select: { id: true },
    }),
  ]);

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
      isFollowing: !!follow,
      isOwn: look.userId === viewerId,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <UserProfileClient
        user={{ ...user, name: user.name ?? "Style lover" }}
        viewerId={viewerId}
        counts={{ looks: feedLooks.length, followers, following }}
        isFollowing={!!follow}
        looks={feedLooks}
      />
    </div>
  );
}
