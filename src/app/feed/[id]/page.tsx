import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { LookDetailClient } from "@/components/feed/look-detail-client";
import type { FeedComment, FeedLook } from "@/components/feed/feed-client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Community look",
  description: "See the details and comments on a shared look.",
};

export default async function PublicLookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user.id ?? "";

  const look = await prisma.savedLook.findFirst({
    where: { id },
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
      comments: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!look || (!look.isPublic && look.userId !== userId)) notFound();

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId: userId, followingId: look.userId },
    },
    select: { id: true },
  });

  const items = look.outfit.items.map((item) => item.wardrobeItem);

  const feedLook: FeedLook = {
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
    isOwn: look.userId === userId,
  };

  const feedComments: FeedComment[] = look.comments.map((comment) => ({
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    author: {
      id: comment.user.id,
      name: comment.user.name ?? "Style lover",
      image: comment.user.image,
    },
    isMine: comment.userId === userId,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <LookDetailClient look={feedLook} comments={feedComments} />
    </div>
  );
}
