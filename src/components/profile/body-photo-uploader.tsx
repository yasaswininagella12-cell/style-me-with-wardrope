"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/lib/actions";

export function BodyPhotoUploader({
  value,
  onSaved,
}: {
  value?: string | null;
  onSaved?: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value ?? null);

  async function handleFile(file?: File) {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Upload failed. Please try again.");
      }
      const url = json.url;
      setPreview(url);
      const result = await updateProfile({ bodyPhotoUrl: url });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      onSaved?.(url);
      toast.success("Full-body photo saved. Your looks will now be shown on it.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setPreview(null);
    const result = await updateProfile({ bodyPhotoUrl: "" });
    if (result.error) toast.error(result.error);
    else toast.success("Photo removed.");
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="relative w-32 shrink-0">
        <div
          className="relative w-32 overflow-hidden rounded-2xl border bg-muted"
          style={{ aspectRatio: "3 / 4" }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Your full-body photo" className="h-full w-full object-cover" />
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {uploading ? (
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                <Camera className="size-5" aria-hidden="true" />
              )}
              <span className="px-2 text-center text-[10px] font-medium">Upload</span>
            </button>
          )}
        </div>
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground"
            aria-label="Remove photo"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Full top-to-bottom photo</p>
        <p className="mt-1 max-w-sm text-xs">
          Stand at full length in plain, tight-fitting clothing (a fitted t-shirt and leggings
          work best). Face the camera with your arms slightly away from your body and good,
          even lighting.
        </p>
        <p className="mt-1 text-xs">
          {preview ? "Saved." : "JPG, PNG, WEBP · up to 8MB"}
        </p>
        {!preview && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Choose photo"}
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
