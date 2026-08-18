"use client";

import dynamic from "next/dynamic";
import { Loader2, Sparkles } from "lucide-react";

const CyberpunkScene = dynamic(
  () => import("./cyberpunk-character").then((mod) => mod.CyberpunkScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3">
        <Loader2 className="size-7 animate-spin text-cyan-400" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Rendering the neon district…</p>
      </div>
    ),
  },
);

export function CyberpunkViewer() {
  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-amber-400/10 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-fuchsia-500/15 text-fuchsia-500">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-semibold">The Neon District</h2>
            <p className="text-sm text-muted-foreground">
              A stylised futuristic scene — real-time WebGL. Drag to orbit, scroll to zoom.
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          React Three Fiber
        </span>
      </div>

      <div className="relative h-[560px] sm:h-[620px]">
        <CyberpunkScene />
      </div>
    </div>
  );
}
