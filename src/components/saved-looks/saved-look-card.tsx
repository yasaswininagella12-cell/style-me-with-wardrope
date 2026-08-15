"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bookmark, Heart, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteSavedLook, toggleFavorite } from "@/lib/actions";

export type SavedLookItem = {
  id: string;
  name: string;
  description?: string | null;
  outfitId: string;
  createdAt: Date;
  outfit: {
    name: string;
    items: { wardrobeItem: { id: string; name: string; imageUrl: string } }[];
  };
  isFavorite: boolean;
};

export function SavedLookCard({ look }: { look: SavedLookItem }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [favorite, setFavorite] = useState(look.isFavorite);
  const [pending, setPending] = useState(false);

  async function handleFavorite() {
    setPending(true);
    const result = await toggleFavorite({ targetType: "savedLook", targetId: look.id });
    setPending(false);
    if (result && "data" in result && result.data) {
      setFavorite(result.data.isFavorite);
      router.refresh();
    }
  }

  async function handleDelete() {
    const result = await deleteSavedLook(look.id);
    if (result && "error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Look deleted.");
    router.refresh();
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/10] bg-muted">
        {look.outfit.items.length > 0 ? (
          <div className="flex h-full w-full gap-0.5">
            {look.outfit.items.slice(0, 3).map((oi) => (
              <div key={oi.wardrobeItem.id} className="relative flex-1">
                <Image
                  src={oi.wardrobeItem.imageUrl}
                  alt={oi.wardrobeItem.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            No items
          </div>
        )}
        <button
          type="button"
          onClick={handleFavorite}
          disabled={pending}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          className={`absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border bg-background/90 shadow-sm backdrop-blur transition-colors ${
            favorite ? "text-brand-rose" : "text-muted-foreground hover:text-brand-rose"
          }`}
        >
          <Heart className={`size-4 ${favorite ? "fill-current" : ""}`} />
        </button>
      </div>
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <Bookmark className="size-4 text-brand-gold" aria-hidden="true" />
          <h3 className="truncate font-heading text-lg font-semibold">{look.name}</h3>
        </div>
        {look.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
            {look.description}
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {look.outfit.items.length} {look.outfit.items.length === 1 ? "piece" : "pieces"}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-5">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/looks/${look.outfitId}`}>
              View look
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmOpen(true)}
            aria-label="Delete look"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this look?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{look.name}&rdquo; will be removed from your saved looks. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
