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
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { STYLES, OCCASIONS, SEASONS } from "@/lib/constants";
import { createTrend } from "@/lib/admin-actions";

export function TrendForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    style: "",
    occasion: "",
    season: "",
    featured: false,
    sections: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    setPending(true);
    setError(null);
    const result = await createTrend({
      name: form.name,
      description: form.description || null,
      imageUrl: form.imageUrl || "",
      style: form.style || null,
      occasion: form.occasion || null,
      season: form.season || null,
      featured: form.featured,
      sections: form.sections,
    });
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    toast.success(result?.success ?? "Trend created.");
    setForm({ name: "", description: "", imageUrl: "", style: "", occasion: "", season: "", featured: false, sections: "" });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Create a trend</CardTitle>
        <CardDescription>
          Add a Trend Setter trend. List its items on lines in the format{" "}
          <code className="text-xs">Section | Item name | Optional detail</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="trend-name">Trend name</Label>
          <Input
            id="trend-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          {error === "Name is required" && <FieldError messages={[error]} />}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="trend-description">Description</Label>
          <Textarea
            id="trend-description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="trend-image">Image URL</Label>
          <Input
            id="trend-image"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            placeholder="https://…"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
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
          <div className="space-y-1.5">
            <Label>Season</Label>
            <Select
              value={form.season || "none"}
              onValueChange={(v) => setForm((f) => ({ ...f, season: v === "none" ? "" : v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Year-round</SelectItem>
                {SEASONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="trend-featured"
            checked={form.featured}
            onCheckedChange={(v) => setForm((f) => ({ ...f, featured: !!v }))}
          />
          <Label htmlFor="trend-featured" className="text-sm font-normal">
            Feature this trend on the homepage
          </Label>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="trend-sections">Trend items</Label>
          <Textarea
            id="trend-sections"
            value={form.sections}
            onChange={(e) => setForm((f) => ({ ...f, sections: e.target.value }))}
            placeholder={"Outerwear | Cropped leather jacket | Chunky zip\nBottoms | Wide-leg trousers | High waist"}
            rows={5}
            className="font-mono text-xs"
          />
        </div>

        <Button onClick={handleSubmit} disabled={pending}>
          {pending ? "Creating…" : "Create trend"}
        </Button>
      </CardContent>
    </Card>
  );
}
