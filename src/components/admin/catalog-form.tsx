"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STYLES, OCCASIONS, COLORS, JEWELRY_CATEGORIES, ACCESSORY_TYPES } from "@/lib/constants";
import { createCatalogItem } from "@/lib/admin-actions";

export function CatalogForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    category: "jewelry",
    name: "",
    type: "",
    color: "",
    style: "",
    occasion: "",
    imageUrl: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const category = form.category as "jewelry" | "accessory";
  const typeOptions = category === "jewelry" ? JEWELRY_CATEGORIES : ACCESSORY_TYPES;

  async function handleSubmit() {
    setPending(true);
    setError(null);
    const result = await createCatalogItem({
      category,
      name: form.name,
      type: form.type,
      color: form.color || null,
      style: form.style || null,
      occasion: form.occasion || null,
      imageUrl: form.imageUrl || "",
      description: form.description || null,
    });
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    toast.success(result?.success ?? "Item added.");
    setForm({ category: "jewelry", name: "", type: "", color: "", style: "", occasion: "", imageUrl: "", description: "" });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Add a catalog item</CardTitle>
        <CardDescription>
          Add jewelry or accessories to the styling engine&apos;s recommendation catalog.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            value={form.category}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, category: v, type: "" }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jewelry">Jewelry</SelectItem>
              <SelectItem value="accessory">Accessory</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="catalog-name">Name</Label>
          <Input
            id="catalog-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Color</Label>
            <Select
              value={form.color || "none"}
              onValueChange={(v) => setForm((f) => ({ ...f, color: v === "none" ? "" : v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Any</SelectItem>
                {COLORS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Style</Label>
            <Select
              value={form.style || "none"}
              onValueChange={(v) => setForm((f) => ({ ...f, style: v === "none" ? "" : v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Any</SelectItem>
                {STYLES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Occasion</Label>
            <Select
              value={form.occasion || "none"}
              onValueChange={(v) => setForm((f) => ({ ...f, occasion: v === "none" ? "" : v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Any</SelectItem>
                {OCCASIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="catalog-image">Image URL</Label>
          <Input
            id="catalog-image"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            placeholder="https://…"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="catalog-description">Description</Label>
          <Textarea
            id="catalog-description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <Button onClick={handleSubmit} disabled={pending}>
          {pending ? "Adding…" : "Add item"}
        </Button>
      </CardContent>
    </Card>
  );
}
