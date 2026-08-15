"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type AiTryOnItem = {
  id: string;
  name: string;
  category?: string | null;
  imageUrl?: string | null;
};

export function AiTryOn({
  outfitId,
  bodyPhotoUrl,
  items,
  existingUrl,
}: {
  outfitId: string;
  bodyPhotoUrl?: string | null;
  items: AiTryOnItem[];
  existingUrl?: string | null;
}) {
  const [status, setStatus] = useState<"idle" | "running" | "done">(
    existingUrl ? "done" : "idle",
  );
  const [url, setUrl] = useState<string | null>(existingUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  const garmentCount = items.filter((item) => item.imageUrl).length;

  async function generate() {
    if (!bodyPhotoUrl || status === "running") return;
    setStatus("running");
    setError(null);
    try {
      const res = await fetch("/api/vton", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outfitId }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data?.error ?? "Generation failed.");
      }
      setUrl(data.url);
      setStatus("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setStatus("idle");
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand-gold/15 text-brand-gold">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-heading text-xl font-semibold">AI photorealistic try-on</h2>
          <p className="text-sm text-muted-foreground">
            An AI places this exact outfit on your uploaded photo — like a real fitting.
          </p>
        </div>
      </div>

      {status === "done" && url ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="mx-auto w-full max-w-[420px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="AI try-on result"
              className="w-full rounded-2xl shadow-sm ring-1 ring-border"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button type="button" onClick={generate}>
              <RefreshCw className="mr-2 size-4" aria-hidden="true" />
              Regenerate
            </Button>
            <Button type="button" variant="outline" asChild>
              <a href={url} download>
                <Download className="mr-2 size-4" aria-hidden="true" />
                Download photo
              </a>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              AI results are photorealistic but may differ slightly from your real photo.
            </p>
          </div>
        </div>
      ) : status === "running" ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed bg-background/60 px-6 py-14 text-center">
          <Loader2 className="size-8 animate-spin text-brand-gold" aria-hidden="true" />
          <p className="mt-4 font-heading text-lg font-semibold">
            Dressing your outfit on your photo…
          </p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            This usually takes 15–60 seconds. The AI puts your selected pieces on your photo — keep
            this tab open.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed bg-background/60 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">
                {garmentCount > 0 ? (
                  <>
                    Try on {garmentCount} piece{garmentCount === 1 ? "" : "s"} from this look.
                  </>
                ) : (
                  "This look has no garment photos to try on yet."
                )}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Uses your uploaded full-body photo and generates a realistic photo of you wearing
                the outfit.
              </p>
              {error && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-destructive">{error}</p>
                  {error.includes("GEMINI_API_KEY") && (
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-sm font-medium text-brand-gold underline underline-offset-2"
                    >
                      Get a free Gemini API key (no card needed) →
                    </a>
                  )}
                  {error.includes("FASHN_API_KEY") && (
                    <a
                      href="https://app.fashn.ai/api"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-sm font-medium text-brand-gold underline underline-offset-2"
                    >
                      Get a Fashn API key →
                    </a>
                  )}
                </div>
              )}
            </div>
            <Button
              type="button"
              onClick={generate}
              disabled={!bodyPhotoUrl || garmentCount === 0}
              className="shrink-0"
            >
              <Sparkles className="mr-2 size-4" aria-hidden="true" />
              Generate AI try-on
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
