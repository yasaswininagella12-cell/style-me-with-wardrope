"use client";

import dynamic from "next/dynamic";
import { Loader2, Rotate3d, Shirt } from "lucide-react";

type MannequinItem = {
  id: string;
  name: string;
  category?: string | null;
  imageUrl?: string | null;
};

const Mannequin3D = dynamic(
  () => import("./mannequin-3d").then((mod) => mod.Mannequin3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3">
        <Loader2 className="size-7 animate-spin text-brand-gold" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Building your 3D mannequin…</p>
      </div>
    ),
  },
);

export function MannequinViewer({
  items,
  name,
}: {
  items: MannequinItem[];
  name?: string;
}) {
  const wearable = items.filter((item) => item.imageUrl);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-gold/15 text-brand-gold">
            <Rotate3d className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-semibold">
              {name ?? "My Look"} on a 3D mannequin
            </h2>
            <p className="text-sm text-muted-foreground">
              Your pieces are mapped onto a stylised 3D body. Drag to rotate, scroll to zoom.
            </p>
          </div>
        </div>
        {wearable.length > 0 && (
          <span className="shrink-0 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            {wearable.length} {wearable.length === 1 ? "piece" : "pieces"} worn
          </span>
        )}
      </div>

      <div
        className="relative h-[420px] sm:h-[460px]"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, #fbf5e9 0%, #f3ead6 55%, #e8dcc2 100%)",
        }}
      >
        {wearable.length > 0 ? (
          <Mannequin3D items={items} />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
            <Shirt className="size-7 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Add photos to the pieces in this look to see them on the 3D mannequin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
