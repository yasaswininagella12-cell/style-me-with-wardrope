"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Sparkles, UserCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { optionLabel } from "@/lib/constants";
import { toggleFollow, toggleLookLike } from "@/lib/feature-actions";
import { cn } from "@/lib/utils";

export type FeedLook = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  author: { id: string; name: string; image: string | null };
  images: string[];
  itemNames: string[];
  occasion: string | null;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isFollowing: boolean;
  isOwn: boolean;
};

export type FeedComment = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; image: string | null };
  isMine: boolean;
};

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || "SL";
}

export function FeedLookCollage({
  look,
  className,
}: {
  look: FeedLook;
  className?: string;
}) {
  const images = look.images.slice(0, 3);

  return (
    <div className={cn("relative aspect-[16/10] overflow-hidden bg-muted", className)}>
      {images.length > 0 ? (
        <div className="flex h-full w-full gap-0.5">
          {images.map((src, index) => (
            <div key={`${src}-${index}`} className="relative h-full flex-1">
              <Image
                src={src}
                alt={look.itemNames[index] ?? look.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-sand/50 to-brand-gold-soft/40">
          <Sparkles className="size-10 text-brand-gold" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export function FeedClient({ looks }: { looks: FeedLook[] }) {
  const router = useRouter();
  const [items, setItems] = useState(looks);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [followingId, setFollowingId] = useState<string | null>(null);

  async function handleLike(look: FeedLook) {
    if (likingId) return;
    setLikingId(look.id);
    const result = await toggleLookLike(look.id);
    setLikingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const data = result.data;
    if (data) {
      setItems((current) =>
        current.map((item) =>
          item.id === look.id
            ? { ...item, isLiked: data.isLiked, likeCount: data.likeCount }
            : item,
        ),
      );
      router.refresh();
    }
  }

  async function handleFollow(look: FeedLook) {
    if (followingId) return;
    const authorId = look.author.id;
    setFollowingId(authorId);
    const result = await toggleFollow(authorId);
    setFollowingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const data = result.data;
    if (data) {
      setItems((current) =>
        current.map((item) =>
          item.author.id === authorId ? { ...item, isFollowing: data.isFollowing } : item,
        ),
      );
      toast.success(data.isFollowing ? "Following this stylist." : "Unfollowed this stylist.");
      router.refresh();
    }
  }

  function renderCard(look: FeedLook) {
    return (
      <Card key={look.id} className="flex h-full flex-col overflow-hidden">
        <Link href={`/feed/${look.id}`} className="relative block">
          <FeedLookCollage look={look} />
          {look.occasion && (
            <Badge className="absolute left-3 top-3 rounded-full">
              {optionLabel(look.occasion, look.occasion)}
            </Badge>
          )}
        </Link>
        <CardContent className="flex flex-1 flex-col p-5">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={`/users/${look.author.id}`}
              className="flex min-w-0 items-center gap-2 hover:underline"
            >
              <Avatar size="sm">
                <AvatarImage src={look.author.image ?? ""} alt={look.author.name} />
                <AvatarFallback>{initials(look.author.name)}</AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-medium">
                {look.author.name || "Style lover"}
              </span>
            </Link>
            {!look.isOwn && (
              <Button
                type="button"
                variant={look.isFollowing ? "outline" : "secondary"}
                size="xs"
                className="ml-auto rounded-full"
                onClick={() => handleFollow(look)}
                disabled={followingId === look.author.id}
              >
                {look.isFollowing ? (
                  <UserCheck className="size-3" aria-hidden="true" />
                ) : (
                  <UserPlus className="size-3" aria-hidden="true" />
                )}
                {look.isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>

          <Link href={`/feed/${look.id}`} className="mt-3 block">
            <h3 className="truncate font-heading text-lg font-semibold">{look.name}</h3>
            {look.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {look.description}
              </p>
            )}
          </Link>

          {look.itemNames.length > 0 && (
            <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
              {look.itemNames.slice(0, 3).join(" · ")}
              {look.itemNames.length > 3 ? " · more" : ""}
            </p>
          )}

          <div className="mt-auto flex items-center gap-1 pt-5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleLike(look)}
              disabled={likingId === look.id}
              aria-label={look.isLiked ? "Unlike look" : "Like look"}
              className={look.isLiked ? "text-brand-rose" : "text-muted-foreground"}
            >
              <Heart className={cn("size-4", look.isLiked && "fill-current")} />
              {look.likeCount}
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link href={`/feed/${look.id}`} aria-label="View comments">
                <MessageCircle className="size-4" aria-hidden="true" />
                {look.commentCount}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="ml-auto">
              <Link href={`/feed/${look.id}`}>View look</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const followingLooks = items.filter((look) => look.isFollowing);

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gold-soft">
          <Sparkles className="size-5 text-brand-gold" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Style Feed</h1>
          <p className="mt-1 text-muted-foreground">
            Discover public looks from the community and follow the styles you love.
          </p>
        </div>
      </div>

      <Tabs defaultValue="discover">
        <TabsList>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
        <TabsContent value="discover" className="mt-6">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
              <p className="font-heading text-lg font-semibold">No public looks yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Share a look from your saved looks to start the feed.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(renderCard)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="following" className="mt-6">
          {followingLooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
              <p className="font-heading text-lg font-semibold">Nothing here yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Follow someone to see their looks
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {followingLooks.map(renderCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
