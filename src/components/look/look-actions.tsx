"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { saveLook, styleOutfit } from "@/lib/actions";

export function LookActions({
  outfitId,
  alreadySaved,
  itemIds,
  occasion,
  style,
}: {
  outfitId: string;
  alreadySaved: boolean;
  itemIds: string[];
  occasion?: string | null;
  style?: string | null;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await saveLook({ outfitId, name, description: description || null });
    setSaving(false);
    if (result && "error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    setDialogOpen(false);
    toast.success("Look saved to your collection.");
    router.refresh();
  }

  async function handleRegenerate() {
    setRegenerating(true);
    const result = await styleOutfit({
      wardrobeItemIds: itemIds,
      occasion: occasion ?? null,
      style: style ?? null,
    });
    setRegenerating(false);
    if (result && "error" in result && result.error) {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => setDialogOpen(true)} disabled={alreadySaved || saving}>
        <Bookmark className="mr-2 size-4" aria-hidden="true" />
        {alreadySaved ? "Look saved" : saving ? "Saving…" : "Save this look"}
      </Button>
      <Button variant="outline" onClick={handleRegenerate} disabled={regenerating}>
        <RefreshCcw className="mr-2 size-4" aria-hidden="true" />
        {regenerating ? "Regenerating…" : "Regenerate look"}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Save this look</DialogTitle>
            <DialogDescription>
              Give your look a name so you can find it again in your collection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="look-name">Look name</Label>
              <Input
                id="look-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Date night in cream"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="look-desc">Description (optional)</Label>
              <Textarea
                id="look-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What makes this look special?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? "Saving…" : "Save look"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
