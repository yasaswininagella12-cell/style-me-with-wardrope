"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import {
  FeedLookCollage,
  type FeedComment,
  type FeedLook,
} from "@/components/feed/feed-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { optionLabel } from "@/lib/constants";
import {
  addLookComment,
  deleteLookComment,
  toggleFollow,
  toggleLookLike,
} from "@/lib/feature-actions";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || "SL";
}

export function LookDetailClient({
  look,
  comments,
}: {
  look: FeedLook;
  comments: FeedComment[];
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(look.isLiked);
  const [likeCount, setLikeCount] = useState(look.likeCount);
  const [following, setFollowing] = useState(look.isFollowing);
  const [liking, setLiking] = useState(false);
  const [followingPending, setFollowingPending] = useState(false);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleLike() {
    if (liking) return;
    setLiking(true);
    const result = await toggleLookLike(look.id);
    setLiking(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const data = result.data;
    if (data) {
      setLiked(data.isLiked);
      setLikeCount(data.likeCount);
      router.refresh();
    }
  }

  async function handleFollow() {
    if (followingPending) return;
    setFollowingPending(true);
    const result = await toggleFollow(look.author.id);
    setFollowingPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    const data = result.data;
    if (data) {
      setFollowing(data.isFollowing);
      toast.success(data.isFollowing ? "Following this stylist." : "Unfollowed this stylist.");
      router.refresh();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    const result = await addLookComment({ savedLookId: look.id, body: trimmed });
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setBody("");
    toast.success("Comment added.");
    router.refresh();
  }

  async function handleDelete(commentId: string) {
    if (deletingId) return;
    setDeletingId(commentId);
    const result = await deleteLookComment(commentId);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Comment deleted.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/feed">
          <ArrowLeft aria-hidden="true" />
          Back to feed
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <FeedLookCollage look={look} className="aspect-[4/5] rounded-2xl" />
          {look.itemNames.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-base">Pieces in this look</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {look.itemNames.map((name, index) => (
                  <Badge key={`${name}-${index}`} variant="secondary" className="rounded-full">
                    {name}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-brand-gold">
              <Sparkles className="size-4" aria-hidden="true" />
              Shared look
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {look.name}
            </h1>
            {look.description && (
              <p className="mt-3 text-muted-foreground">{look.description}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {look.occasion && (
                <Badge variant="outline" className="rounded-full">
                  {optionLabel(look.occasion, look.occasion)}
                </Badge>
              )}
              <span>{new Date(look.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 p-4">
              <Link
                href={`/users/${look.author.id}`}
                className="flex min-w-0 items-center gap-3 hover:underline"
              >
                <Avatar>
                  <AvatarImage src={look.author.image ?? ""} alt={look.author.name} />
                  <AvatarFallback>{initials(look.author.name)}</AvatarFallback>
                </Avatar>
                <span className="truncate font-medium">
                  {look.author.name || "Style lover"}
                </span>
              </Link>
              <div className="ml-auto flex items-center gap-2">
                {!look.isOwn && (
                  <Button
                    type="button"
                    variant={following ? "outline" : "secondary"}
                    size="sm"
                    onClick={handleFollow}
                    disabled={followingPending}
                  >
                    {following ? (
                      <UserCheck className="size-3.5" aria-hidden="true" />
                    ) : (
                      <UserPlus className="size-3.5" aria-hidden="true" />
                    )}
                    {following ? "Following" : "Follow"}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={liking}
                  aria-label={liked ? "Unlike look" : "Like look"}
                  className={liked ? "text-brand-rose" : "text-muted-foreground"}
                >
                  <Heart className={cn("size-4", liked && "fill-current")} />
                  {likeCount}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-heading text-base">
                <MessageCircle className="size-4 text-brand-gold" aria-hidden="true" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No comments yet. Be the first to share your thoughts.
                </p>
              ) : (
                <ul className="space-y-5">
                  {comments.map((comment) => (
                    <li key={comment.id} className="flex gap-3">
                      <Link href={`/users/${comment.author.id}`} className="shrink-0">
                        <Avatar size="sm">
                          <AvatarImage
                            src={comment.author.image ?? ""}
                            alt={comment.author.name}
                          />
                          <AvatarFallback>{initials(comment.author.name)}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/users/${comment.author.id}`}
                            className="text-sm font-medium hover:underline"
                          >
                            {comment.author.name || "Style lover"}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                          {comment.isMine && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              className="ml-auto text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(comment.id)}
                              disabled={deletingId === comment.id}
                              aria-label="Delete comment"
                            >
                              <Trash2 className="size-3.5" aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                          {comment.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 border-t pt-5">
                <Label htmlFor="look-comment">Add a comment</Label>
                <Textarea
                  id="look-comment"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="What do you think of this look?"
                  rows={3}
                  maxLength={500}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting || !body.trim()}>
                    {submitting ? "Posting..." : "Post comment"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
