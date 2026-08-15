"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Trash2, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tilt3D } from "@/components/ui/tilt-3d";
import { optionLabel } from "@/lib/constants";
import { deleteWardrobeItem } from "@/lib/actions";
import type { WardrobeItem } from "@/generated/prisma/client";

export function WardrobeItemCard({
  item,
  onEdit,
}: {
  item: WardrobeItem;
  onEdit: (item: WardrobeItem) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteWardrobeItem(item.id);
    setDeleting(false);
    if (result && "error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Item removed from your wardrobe.");
  }

  return (
    <Card className="group overflow-hidden">
      <Tilt3D className="relative aspect-square overflow-hidden bg-muted [transform-style:preserve-3d]">
        <div className="absolute inset-0 [transform:translateZ(26px)]">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="absolute right-2 top-2 [transform:translateZ(46px)]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="size-8 bg-background/90 backdrop-blur"
                aria-label={`Actions for ${item.name}`}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Tilt3D>
      <CardContent className="p-4">
        <h3 className="truncate font-heading text-base font-semibold">{item.name}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {optionLabel(item.category)}
          {item.color ? ` · ${optionLabel(item.color)}` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.occasion && (
            <Badge variant="secondary" className="rounded-full text-xs">
              {optionLabel(item.occasion)}
            </Badge>
          )}
          {item.season && (
            <Badge variant="outline" className="rounded-full text-xs">
              {optionLabel(item.season)}
            </Badge>
          )}
          {item.style && (
            <Badge variant="outline" className="rounded-full text-xs">
              {optionLabel(item.style)}
            </Badge>
          )}
        </div>
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{item.name}&rdquo; will be removed from your wardrobe. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
