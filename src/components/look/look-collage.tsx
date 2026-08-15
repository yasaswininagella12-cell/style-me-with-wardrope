"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecommendationItem, StylingResult } from "@/types";

function withImages(...groups: RecommendationItem[][]): RecommendationItem[] {
  return groups.flat().filter((r) => r.imageUrl).slice(0, 6);
}

const PALETTE_HEX: Record<string, string> = {
  black: "#1c1c1c",
  white: "#ffffff",
  ivory: "#fbf6ea",
  cream: "#f5eedb",
  beige: "#d8c8a8",
  sand: "#e4d6b8",
  camel: "#c19a6b",
  tan: "#d2b48c",
  brown: "#8b5e34",
  gold: "#d4af37",
  silver: "#c0c0c0",
  pearl: "#f1f1ee",
  nude: "#e0c3a0",
  blush: "#f4cdc5",
  "pastel pink": "#f6cfd6",
  pink: "#e8a5b8",
  "dusty pink": "#d9a0a6",
  "muted pink": "#e3b7bd",
  rose: "#e8a6ab",
  "rose gold": "#e8b4a0",
  red: "#c63b3b",
  maroon: "#7a2e2e",
  burgundy: "#6e2b3d",
  terracotta: "#c4643f",
  rust: "#b4653a",
  orange: "#e8863d",
  peach: "#f7c9a8",
  yellow: "#f0d25c",
  navy: "#23324d",
  blue: "#3b6ea5",
  "light blue": "#a9c8e8",
  denim: "#5a7ba0",
  teal: "#2e7f7a",
  turquoise: "#3fc1bd",
  mint: "#a9e2cd",
  green: "#5d8a4e",
  olive: "#7a7a3a",
  emerald: "#1f7a52",
  grey: "#8b8b8b",
  gray: "#8b8b8b",
  lavender: "#c5b8e8",
  purple: "#7d6bb0",
  periwinkle: "#9a97e8",
  multicolor: "#d9c9b8",
  other: "#e2d9c9",
};

function hexFor(name: string): string {
  return PALETTE_HEX[name.toLowerCase()] ?? "#e2d9c9";
}

export function LookCollage({
  result,
  name,
  occasion,
}: {
  result: StylingResult;
  name?: string;
  occasion?: string | null;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const outfit = result.outfit.slice(0, 8);
  const extras = withImages(result.jewelry, result.footwear, result.bag, result.accessories);

  async function handleDownload() {
    if (!nodeRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(nodeRef.current, {
        pixelRatio: 2,
        backgroundColor: "#fdfbf7",
        cacheBust: true,
      });
      const link = document.createElement("a");
      const slug =
        (name ?? "look").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() ||
        "look";
      link.download = `${slug}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error(
        "Could not build the image. Some photos may come from an external source without sharing permission.",
      );
    } finally {
      setDownloading(false);
    }
  }

  const tilt = ["-rotate-2", "rotate-1", "rotate-2", "-rotate-1", "rotate-1", "-rotate-2", "rotate-2", "-rotate-1"];

  return (
    <div className="flex flex-col items-start gap-3">
      <div
        ref={nodeRef}
        className="w-full max-w-[520px] rounded-3xl bg-[#fdfbf7] p-6 shadow-sm ring-1 ring-border"
      >
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b08d3e]">
            Style Me With Wardrobe
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-[#2b2118]">
            {name ?? "My Complete Look"}
          </h2>
          {occasion && (
            <span className="mt-2 inline-block rounded-full bg-[#2b2118] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[#fdfbf7]">
              {occasion}
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {outfit.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className={`h-24 w-24 overflow-hidden rounded-2xl ring-1 ring-black/10 ${tilt[i % tilt.length]}`}
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#f1e7d3] text-[10px] font-medium text-[#8a7a5c]">
                  {item.name}
                </div>
              )}
            </div>
          ))}
        </div>

        {extras.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {extras.map((item, i) => (
              <div key={`${item.id}-${i}`} className="flex items-center gap-2">
                {item.imageUrl && (
                  <div className="h-12 w-12 overflow-hidden rounded-xl ring-1 ring-black/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <span className="max-w-[80px] truncate text-[10px] font-medium text-[#6b5b3f]">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-[#e8dcc2] pt-4">
          <div className="flex items-center gap-1.5">
            {result.colorPalette.map((color) => (
              <span
                key={color}
                className="h-6 w-6 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: hexFor(color) }}
                title={color}
              />
            ))}
          </div>
          <p className="text-xs font-medium text-[#6b5b3f]">
            Metal tone: <span className="text-[#2b2118]">{result.metalTone}</span>
          </p>
        </div>
      </div>

      <Button type="button" variant="outline" onClick={handleDownload} disabled={downloading}>
        {downloading ? (
          <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="mr-2 size-4" aria-hidden="true" />
        )}
        {downloading ? "Building image…" : "Download look as image"}
      </Button>
    </div>
  );
}
