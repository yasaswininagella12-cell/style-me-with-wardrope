"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError } from "@/components/ui/field-error";
import { ImageUploader } from "@/components/wardrobe/image-uploader";
import { CATEGORIES, COLORS, MATERIALS, OCCASIONS, PATTERNS, SEASONS, STYLES } from "@/lib/constants";
import { addWardrobeItem, updateWardrobeItem, type ActionResult } from "@/lib/actions";
import type { WardrobeItem } from "@/generated/prisma/client";

type FormState = {
  name: string;
  imageUrl: string;
  category: string;
  color: string;
  secondaryColor: string;
  pattern: string;
  material: string;
  occasion: string;
  season: string;
  style: string;
};

const emptyForm: FormState = {
  name: "",
  imageUrl: "",
  category: "",
  color: "",
  secondaryColor: "",
  pattern: "",
  material: "",
  occasion: "",
  season: "",
  style: "",
};

export function WardrobeFormDialog({
  open,
  onOpenChange,
  item,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: WardrobeItem | null;
  onSaved?: () => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setError(null);
    setForm(
      item
        ? {
            name: item.name,
            imageUrl: item.imageUrl,
            category: item.category,
            color: item.color,
            secondaryColor: item.secondaryColor ?? "",
            pattern: item.pattern ?? "",
            material: item.material ?? "",
            occasion: item.occasion ?? "",
            season: item.season ?? "",
            style: item.style ?? "",
          }
        : emptyForm,
    );
  }, [open, item]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setPending(true);
    setError(null);
    setErrors({});
    const result = item
      ? await updateWardrobeItem(item.id, form)
      : await addWardrobeItem(form);

    if (result && "error" in result && result.error) {
      setError(result.error);
      setErrors((result as ActionResult).fieldErrors ?? {});
      setPending(false);
      return;
    }
    setPending(false);
    toast.success(item ? "Item updated." : "Item added to your wardrobe.");
    onOpenChange(false);
    onSaved?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {item ? "Edit item" : "Add to wardrobe"}
          </DialogTitle>
          <DialogDescription>
            {item
              ? "Update the details of this clothing item."
              : "Upload a photo and tell us a little about this piece."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Photo</Label>
            <ImageUploader value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />
            {errors.imageUrl && <FieldError messages={errors.imageUrl} />}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-name">Name</Label>
            <Input
              id="item-name"
              placeholder="e.g. Cream silk blouse"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name && <FieldError messages={errors.name} />}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <FieldError messages={errors.category} />}
            </div>
            <div className="space-y-1.5">
              <Label>Main color</Label>
              <Select value={form.color} onValueChange={(v) => set("color", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <span
                          className="size-3 rounded-full border"
                          style={{
                            backgroundColor: c.hex.startsWith("linear") ? "transparent" : c.hex,
                            backgroundImage: c.hex.startsWith("linear") ? c.hex : undefined,
                          }}
                        />
                        {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.color && <FieldError messages={errors.color} />}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Secondary color</Label>
              <Select
                value={form.secondaryColor || "none"}
                onValueChange={(v) => set("secondaryColor", v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {COLORS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Pattern</Label>
              <Select value={form.pattern || "none"} onValueChange={(v) => set("pattern", v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {PATTERNS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Material</Label>
              <Select value={form.material || "none"} onValueChange={(v) => set("material", v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {MATERIALS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Season</Label>
              <Select value={form.season || "none"} onValueChange={(v) => set("season", v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any season</SelectItem>
                  {SEASONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Occasion</Label>
              <Select value={form.occasion || "none"} onValueChange={(v) => set("occasion", v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any occasion</SelectItem>
                  {OCCASIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Style</Label>
              <Select value={form.style || "none"} onValueChange={(v) => set("style", v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any style</SelectItem>
                  {STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={pending || !form.imageUrl}>
            {pending ? "Saving…" : item ? "Save changes" : "Add item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
