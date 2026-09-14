"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bookmark, Heart, Trash2, ArrowRight, Pencil, Copy, ImageDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { deleteSavedLook, toggleFavorite, updateSavedLook, cloneSavedLook } from "@/lib/actions";
import { lookCardImage } from "@/lib/look-card";

export type SavedLookItem = {
  id: string;
  name: string;
  description?: string | null;
  outfitId: string;
  createdAt: Date;
  outfit: {
    name: string;
    occasion?: string | null;
    items: { wardrobeItem: { id: string; name: string; imageUrl: string } }[];
  };
  isFavorite: boolean;
};

export function SavedLookCard({ look }: { look: SavedLookItem }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [favorite, setFavorite] = useState(look.isFavorite);
  const [pending, setPending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [cloning, setCloning] = useState(false);

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

  function openEdit() {
    setEditName(look.name);
    setEditDescription(look.description ?? "");
    setEditOpen(true);
  }

  async function handleUpdate() {
    setUpdating(true);
    const result = await updateSavedLook(look.id, {
      name: editName,
      description: editDescription || null,
    });
    setUpdating(false);
    if (result && "error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    setEditOpen(false);
    toast.success("Look updated.");
    router.refresh();
  }

  async function handleClone() {
    setCloning(true);
    const result = await cloneSavedLook(look.id);
    if (result && "error" in result && result.error) {
      setCloning(false);
      toast.error(result.error);
    }
  }

  function downloadCard() {
    const blob = new Blob(
      [
        lookCardImage({
          name: look.name,
          description: look.description,
          pieceCount: look.outfit.items.length,
          occasion: look.outfit.occasion,
          images: look.outfit.items.map((oi) => ({
            name: oi.wardrobeItem.name,
            imageUrl: oi.wardrobeItem.imageUrl,
          })),
        }),
      ],
      { type: "image/svg+xml" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "look-card.svg";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Look card downloaded.");
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
            onClick={openEdit}
            aria-label="Edit look"
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClone}
            disabled={cloning}
            aria-label="Clone look"
            className="text-muted-foreground hover:text-foreground"
          >
            <Copy className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={downloadCard}
            aria-label="Download look card"
            className="text-muted-foreground hover:text-foreground"
          >
            <ImageDown className="size-4" />
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Edit look</DialogTitle>
            <DialogDescription>
              Rename or add a note to this saved look.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-look-name">Look name</Label>
              <Input
                id="edit-look-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Date night in cream"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-look-desc">Description (optional)</Label>
              <Textarea
                id="edit-look-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="What makes this look special?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updating || !editName.trim()}>
              {updating ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}