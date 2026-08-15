"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError } from "@/components/ui/field-error";
import { STYLES, COLORS } from "@/lib/constants";
import { updateProfile } from "@/lib/actions";
import { BodyPhotoUploader } from "@/components/profile/body-photo-uploader";

export function ProfileForm({
  name,
  image,
  bodyPhotoUrl,
  preferredStyle,
  preferredColorPalette,
}: {
  name?: string | null;
  image?: string | null;
  bodyPhotoUrl?: string | null;
  preferredStyle?: string | null;
  preferredColorPalette?: string | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: name ?? "",
    image: image ?? "",
    preferredStyle: preferredStyle ?? "",
    preferredColorPalette: preferredColorPalette ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    setPending(true);
    setError(null);
    setErrors({});
    const result = await updateProfile({
      name: form.name,
      image: form.image,
      preferredStyle: form.preferredStyle || null,
      preferredColorPalette: form.preferredColorPalette || null,
    });
    setPending(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
      setErrors(result.fieldErrors ?? {});
      return;
    }
    toast.success("Profile updated.");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">Edit profile</CardTitle>
        <CardDescription>
          Your style preferences help us personalize every recommendation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Full name</Label>
          <Input
            id="profile-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          {errors.name && <FieldError messages={errors.name} />}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-image">Profile photo URL (optional)</Label>
          <Input
            id="profile-image"
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            placeholder="https://…"
          />
          {errors.image && <FieldError messages={errors.image} />}
        </div>

        <div className="border-t pt-5">
          <Label className="text-base">Virtual try-on photo</Label>
          <p className="mb-3 mt-1 text-sm text-muted-foreground">
            A full top-to-bottom photo of you. Every generated look will be shown worn on this
            photo.
          </p>
          <BodyPhotoUploader value={bodyPhotoUrl} onSaved={() => router.refresh()} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Preferred style</Label>
            <Select
              value={form.preferredStyle || "none"}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, preferredStyle: v === "none" ? "" : v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No preference</SelectItem>
                {STYLES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Favorite color palette</Label>
            <Select
              value={form.preferredColorPalette || "none"}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, preferredColorPalette: v === "none" ? "" : v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No preference</SelectItem>
                {COLORS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
