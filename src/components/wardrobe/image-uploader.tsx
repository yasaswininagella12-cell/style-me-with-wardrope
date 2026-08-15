"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export function ImageUploader({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (file?: File) => {
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
        onChange(json.url);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.");
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange],
  );

  return (
    <div className="flex items-center gap-4">
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Item preview"
            className="size-20 rounded-xl border object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground"
            aria-label="Remove image"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex size-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <ImagePlus className="size-5" aria-hidden="true" />
          <span className="text-[10px] font-medium">Upload</span>
        </button>
      )}
      <div className="text-xs text-muted-foreground">
        {uploading ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            Uploading…
          </span>
        ) : (
          "JPG, PNG, WEBP · up to 8MB"
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
