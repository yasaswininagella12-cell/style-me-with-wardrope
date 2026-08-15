"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Download, Loader2, Shirt, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type TryOnItem = {
  id: string;
  name: string;
  category?: string | null;
  imageUrl?: string | null;
};

type Zone = {
  top: number;
  height: number;
  width: number;
  z: number;
  long: boolean;
};

function zoneFor(category?: string | null): Zone {
  const c = (category ?? "").toLowerCase();
  if (c === "hat") return { top: 4, height: 14, width: 52, z: 50, long: false };
  if (c === "jacket" || c === "blazer") return { top: 15, height: 40, width: 60, z: 40, long: false };
  if (c === "saree") return { top: 11, height: 76, width: 58, z: 30, long: true };
  if (c === "lehenga") return { top: 13, height: 62, width: 56, z: 30, long: true };
  if (c === "kurti") return { top: 15, height: 56, width: 52, z: 30, long: true };
  if (c === "dress") return { top: 13, height: 64, width: 50, z: 30, long: true };
  if (c === "skirt") return { top: 42, height: 40, width: 46, z: 20, long: true };
  if (c === "jeans" || c === "pants" || c === "shorts" || c === "trousers") {
    return { top: 43, height: 38, width: 40, z: 20, long: true };
  }
  return { top: 16, height: 34, width: 52, z: 30, long: false };
}

// Cut the garment out of its background on the client so it can sit on the
// person's photo like a real piece of clothing instead of a photo rectangle.
function useCutout(url?: string | null): string | null {
  const [cutout, setCutout] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setCutout(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const maxDim = 512;
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no canvas");
        ctx.drawImage(img, 0, 0, w, h);
        const src = ctx.getImageData(0, 0, w, h);
        const data = src.data;

        // If the image already has transparency, keep it as-is.
        const cornerIdx = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + w - 1) * 4];
        const cornerAlpha =
          cornerIdx.reduce((sum, i) => sum + data[i + 3], 0) / cornerIdx.length;
        if (cornerAlpha < 200) {
          if (!cancelled) setCutout(url);
          return;
        }

        // Robust background estimate: median of all border pixels.
        const border: number[] = [];
        const push = (x: number, y: number) => {
          const i = (y * w + x) * 4;
          border.push(data[i], data[i + 1], data[i + 2]);
        };
        for (let x = 0; x < w; x++) {
          push(x, 0);
          push(x, h - 1);
        }
        for (let y = 1; y < h - 1; y++) {
          push(0, y);
          push(w - 1, y);
        }
        const median = (arr: number[], ch: number) => {
          const col = [];
          for (let i = ch; i < arr.length; i += 3) col.push(arr[i]);
          col.sort((a, b) => a - b);
          return col[Math.floor(col.length / 2)];
        };
        const br = median(border, 0);
        const bg = median(border, 1);
        const bb = median(border, 2);

        const dist = (x: number, y: number) => {
          const i = (y * w + x) * 4;
          const dr = data[i] - br;
          const dg = data[i + 1] - bg;
          const db = data[i + 2] - bb;
          return Math.sqrt(dr * dr + dg * dg + db * db);
        };

        const state = new Uint8Array(w * h); // 0 unknown, 1 bg, 2 kept
        const queue: number[] = [];
        const seed = (x: number, y: number) => {
          const idx = y * w + x;
          if (state[idx] === 0 && dist(x, y) < 45) {
            state[idx] = 1;
            queue.push(idx);
          }
        };
        for (let x = 0; x < w; x++) {
          seed(x, 0);
          seed(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          seed(0, y);
          seed(w - 1, y);
        }
        const flood = (tolerance: number) => {
          let head = 0;
          while (head < queue.length) {
            const idx = queue[head++];
            const x = idx % w;
            const y = (idx / w) | 0;
            const tryCell = (nx: number, ny: number) => {
              if (nx < 0 || ny < 0 || nx >= w || ny >= h) return;
              const nIdx = ny * w + nx;
              if (state[nIdx] !== 0) return;
              if (dist(nx, ny) < tolerance) {
                state[nIdx] = 1;
                queue.push(nIdx);
              }
            };
            tryCell(x - 1, y);
            tryCell(x + 1, y);
            tryCell(x, y - 1);
            tryCell(x, y + 1);
          }
        };
        flood(45); // solid backdrop
        flood(85); // nibble gradient halo near the edges

        // Anything still unvisited is the garment.
        const out = ctx.createImageData(w, h);
        for (let i = 0; i < data.length; i += 4) {
          const idx = i / 4;
          const x = idx % w;
          const y = (idx / w) | 0;
          const isBg = state[idx] === 1;
          if (isBg) {
            out.data[i + 3] = 0;
            out.data[i] = data[i];
            out.data[i + 1] = data[i + 1];
            out.data[i + 2] = data[i + 2];
            continue;
          }
          // Feather the boundary so edges are soft, not pixelated.
          const nearBg =
            state[idx - 1] === 1 ||
            state[idx + 1] === 1 ||
            state[idx - w] === 1 ||
            state[idx + w] === 1 ||
            state[idx - 1 - w] === 1 ||
            state[idx + 1 - w] === 1 ||
            state[idx - 1 + w] === 1 ||
            state[idx + 1 + w] === 1;
          const d = dist(x, y);
          const a = nearBg
            ? Math.max(0, Math.min(255, Math.round(255 * ((d - 45) / 70))))
            : 255;
          out.data[i] = data[i];
          out.data[i + 1] = data[i + 1];
          out.data[i + 2] = data[i + 2];
          out.data[i + 3] = a;
        }
        ctx.putImageData(out, 0, 0);
        if (!cancelled) setCutout(canvas.toDataURL("image/png"));
      } catch {
        if (!cancelled) setCutout(url);
      }
    };
    img.onerror = () => {
      if (!cancelled) setCutout(url);
    };
    img.src = url;
    return () => {
      cancelled = true;
    };
  }, [url]);

  return cutout;
}

function FitControls({
  scale,
  shift,
  onScale,
  onShift,
  onReset,
}: {
  scale: number;
  shift: number;
  onScale: (v: number) => void;
  onShift: (v: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Fit adjustments
        <button
          type="button"
          onClick={onReset}
          className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3" aria-hidden="true" />
          Reset
        </button>
      </div>
      <label className="block text-xs text-muted-foreground">
        Size <span className="float-right font-medium text-foreground">{scale}%</span>
      </label>
      <input
        type="range"
        min={50}
        max={150}
        step={1}
        value={scale}
        onChange={(e) => onScale(Number(e.target.value))}
        className="mt-1 w-full"
      />
      <label className="mt-3 block text-xs text-muted-foreground">
        Vertical position <span className="float-right font-medium text-foreground">{shift}%</span>
      </label>
      <input
        type="range"
        min={-10}
        max={10}
        step={0.5}
        value={shift}
        onChange={(e) => onShift(Number(e.target.value))}
        className="mt-1 w-full"
      />
    </div>
  );
}

function GarmentLayer({
  item,
  zone,
  scale,
  shift,
}: {
  item: TryOnItem;
  zone: Zone;
  scale: number;
  shift: number;
}) {
  const src = useCutout(item.imageUrl);
  const width = Math.max(14, zone.width * (scale / 100));
  const top = zone.top + shift;
  return (
    <div
      className="absolute"
      style={{
        top: `${top}%`,
        height: `${zone.height}%`,
        width: `${width}%`,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: zone.z,
        pointerEvents: "none",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src ?? item.imageUrl!}
        alt={item.name}
        className="h-full w-full"
        style={{
          objectFit: "cover",
          objectPosition: "center top",
          mixBlendMode: src ? "normal" : "multiply",
          opacity: src ? 1 : 0.92,
          filter: src ? "drop-shadow(0 3px 5px rgba(0,0,0,0.28))" : "none",
        }}
      />
    </div>
  );
}

export function TryOnPreview({
  bodyPhotoUrl,
  items,
  name,
  occasion,
}: {
  bodyPhotoUrl: string;
  items: TryOnItem[];
  name?: string;
  occasion?: string | null;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const storageKey = useMemo(
    () => `tryon-fit-${bodyPhotoUrl.split("/").pop() ?? "photo"}`,
    [bodyPhotoUrl],
  );
  const [scale, setScale] = useState(100);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { scale: s, shift: sh } = JSON.parse(saved) as { scale: number; shift: number };
        if (typeof s === "number") setScale(s);
        if (typeof sh === "number") setShift(sh);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ scale, shift }));
    } catch {
      // ignore
    }
  }, [storageKey, scale, shift]);

  const garments = items.filter((i) => i.imageUrl);
  const layered = [...garments].sort((a, b) => zoneFor(a.category).z - zoneFor(b.category).z);

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
        (name ?? "look").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "look";
      link.download = `${slug}-tryon.png`;
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

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex flex-col items-start gap-3">
        <div
          ref={nodeRef}
          className="relative w-full max-w-[400px] overflow-hidden rounded-3xl bg-[#fdfbf7] shadow-sm ring-1 ring-border"
          style={{ aspectRatio: "3 / 4" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bodyPhotoUrl}
            alt="Your full-body photo"
            className="absolute inset-0 h-full w-full object-contain"
          />
          {layered.map((item) => {
            const zone = zoneFor(item.category);
            return (
              <GarmentLayer key={item.id} item={item} zone={zone} scale={scale} shift={shift} />
            );
          })}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
            <p className="truncate font-heading text-lg font-bold text-white">
              {name ?? "My Complete Look"}
            </p>
            {occasion && (
              <span className="shrink-0 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#2b2118]">
                {occasion}
              </span>
            )}
          </div>
        </div>

        <Button type="button" variant="outline" onClick={handleDownload} disabled={downloading}>
          {downloading ? (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="mr-2 size-4" aria-hidden="true" />
          )}
          {downloading ? "Building image…" : "Download try-on image"}
        </Button>
        <p className="text-xs text-muted-foreground">
          {garments.length === 0 ? (
            <>
              <Shirt className="mr-1 inline size-3.5" aria-hidden="true" />
              Add images to your wardrobe items to see them on your photo.
            </>
          ) : (
            <>
              Clothes are cut out from their photos and placed on you. Use the fit controls to
              adjust size and position. For a photorealistic result, clothes should be photographed
              alone on a plain, single-colour background.
            </>
          )}
        </p>
      </div>

      {garments.length > 0 && (
        <FitControls
          scale={scale}
          shift={shift}
          onScale={setScale}
          onShift={setShift}
          onReset={() => {
            setScale(100);
            setShift(0);
          }}
        />
      )}
    </div>
  );
}
