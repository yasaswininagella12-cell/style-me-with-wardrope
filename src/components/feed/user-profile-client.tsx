"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Sparkles, UserCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";

import {
  FeedLookCollage,
  type FeedLook,
} from "@/components/feed/feed-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatValue, optionLabel } from "@/lib/constants";
import { toggleFollow } from "@/lib/feature-actions";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || "SL";
}

export function UserProfileClient({
  user,
  viewerId,
  counts,
  isFollowing,
  looks,
}: {
  user: { id: string; name: string; image: string | null; preferredStyle: string | null };
  viewerId: string;
  counts: { looks: number; followers: number; following: number };
  isFollowing: boolean;
  looks: FeedLook[];
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(isFollowing);
  const [followers, setFollowers] = useState(counts.followers);
  const [pending, setPending] = useState(false);
  const isOwn = user.id === viewerId;

  async function handleFollow() {
    if (pending) return;
    setPending(true);
    const result = await toggleFollow(user.id);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const data = result.data;
    if (data) {
      setFollowing(data.isFollowing);
      setFollowers((current) => Math.max(0, current + (data.isFollowing ? 1 : -1)));
      toast.success(data.isFollowing ? "Following this stylist." : "Unfollowed this stylist.");
      router.refresh();
    }
  }

  const stats = [
    { label: "Looks", value: counts.looks },
    { label: "Followers", value: followers },
    { label: "Following", value: counts.following },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          <Avatar className="size-20">
            <AvatarImage src={user.image ?? ""} alt={user.name} />
            <AvatarFallback className="text-xl">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-brand-gold">
              <Sparkles className="size-4" aria-hidden="true" />
              Community stylist
            </p>
            <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
              {user.name}
            </h1>
            {user.preferredStyle && (
              <Badge variant="secondary" className="mt-3 rounded-full">
                {optionLabel(user.preferredStyle, formatValue(user.preferredStyle))}
              </Badge>
            )}
          </div>
          {!isOwn && (
            <Button
              type="button"
              variant={following ? "outline" : "default"}
              onClick={handleFollow}
              disabled={pending}
            >
              {following ? (
                <UserCheck className="size-4" aria-hidden="true" />
              ) : (
                <UserPlus className="size-4" aria-hidden="true" />
              )}
              {following ? "Following" : "Follow"}
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 text-center">
              <p className="font-heading text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="font-heading text-xl font-semibold">Public looks</h2>
        {looks.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed px-6 py-16 text-center">
            <p className="font-heading text-lg font-semibold">No public looks yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              This stylist has not shared any looks yet.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {looks.map((look) => (
              <Card key={look.id} className="flex h-full flex-col overflow-hidden">
                <Link href={`/feed/${look.id}`} className="relative block">
                  <FeedLookCollage look={look} />
                </Link>
                <CardContent className="flex flex-1 flex-col p-5">
                  <Link href={`/feed/${look.id}`} className="block">
                    <h3 className="truncate font-heading text-lg font-semibold">{look.name}</h3>
                    {look.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {look.description}
                      </p>
                    )}
                  </Link>
                  <div className="mt-auto flex items-center gap-4 pt-5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Heart className={cn("size-4", look.isLiked && "fill-current text-brand-rose")} />
                      {look.likeCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="size-4" aria-hidden="true" />
                      {look.commentCount}
                    </span>
                    <Button asChild variant="outline" size="sm" className="ml-auto">
                      <Link href={`/feed/${look.id}`}>View look</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
