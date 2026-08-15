import { Gem, Footprints, Handbag, Sparkles, Palette, Scissors, Brush, Wand2, UserRound } from "lucide-react";
import type { RecommendationItem, StylingResult } from "@/types";
import { LookCollage } from "@/components/look/look-collage";
import { MannequinViewer } from "@/components/look/mannequin-viewer";
import { TryOnPreview } from "@/components/look/try-on-preview";
import { AiTryOn } from "@/components/look/ai-try-on";
import { Button } from "@/components/ui/button";

function RecommendationGroup({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Gem;
  title: string;
  items: RecommendationItem[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <h3 className="font-heading text-lg font-semibold">{title}</h3>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item, i) => (
          <li key={`${item.name}-${i}`} className="rounded-xl border bg-background/60 p-3">
            <p className="text-sm font-medium">{item.name}</p>
            {item.description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LookDisplay({
  result,
  name,
  occasion,
  bodyPhotoUrl,
  outfitId,
  aiTryOnUrl,
}: {
  result: StylingResult;
  name?: string;
  occasion?: string | null;
  bodyPhotoUrl?: string | null;
  outfitId?: string;
  aiTryOnUrl?: string | null;
}) {
  return (
    <div className="space-y-8">
      {/* Try-on on your photo */}
      {bodyPhotoUrl ? (
        <div className="space-y-8">
          {outfitId && (
            <AiTryOn
              outfitId={outfitId}
              bodyPhotoUrl={bodyPhotoUrl}
              items={result.outfit}
              existingUrl={aiTryOnUrl}
            />
          )}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <UserRound className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-semibold">Worn on your photo</h2>
                <p className="text-sm text-muted-foreground">
                  Quick preview — your selected pieces overlaid on your full-body photo.
                </p>
              </div>
            </div>
            <TryOnPreview
              bodyPhotoUrl={bodyPhotoUrl}
              items={result.outfit}
              name={name}
              occasion={occasion}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border border-dashed bg-card p-6">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <UserRound className="size-5" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="font-heading text-lg font-semibold">
              See this look worn on your photo
            </p>
            <p className="text-sm text-muted-foreground">
              Upload a full top-to-bottom picture once, and every generated look will be shown
              over it — like a virtual dressing room.
            </p>
          </div>
          <Button asChild>
            <a href="/onboarding">Upload photo</a>
          </Button>
        </div>
      )}

      {/* 3D mannequin */}
      <MannequinViewer items={result.outfit} name={name} />

      {/* Look image */}
      <LookCollage result={result} name={name} occasion={occasion} />

      {/* Recommendations */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecommendationGroup icon={Gem} title="Jewelry" items={result.jewelry} />
        <RecommendationGroup icon={Footprints} title="Footwear" items={result.footwear} />
        <RecommendationGroup icon={Handbag} title="Bag" items={result.bag} />
        <RecommendationGroup icon={Wand2} title="Accessories" items={result.accessories} />
      </div>

      {/* Hairstyle & makeup */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Scissors className="size-4" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-lg font-semibold">Hairstyle</h3>
          </div>
          <p className="mt-3 font-medium">{result.hairstyle.name}</p>
          {result.hairstyle.description && (
            <p className="mt-1 text-sm text-muted-foreground">{result.hairstyle.description}</p>
          )}
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Brush className="size-4" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-lg font-semibold">Makeup</h3>
          </div>
          <p className="mt-3 font-medium">{result.makeup.name}</p>
          {result.makeup.description && (
            <p className="mt-1 text-sm text-muted-foreground">{result.makeup.description}</p>
          )}
        </div>
      </div>

      {/* Palette & tips */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Palette className="size-4" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-lg font-semibold">Color palette</h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Colors that complement your base pieces.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.colorPalette.map((color) => (
              <span
                key={color}
                className="rounded-full border bg-background px-3 py-1 text-xs font-medium"
              >
                {color}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm">
            <span className="font-medium">Metal tone:</span>{" "}
            <span className="text-muted-foreground">{result.metalTone}</span>
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-lg font-semibold">Stylist tips</h3>
          </div>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-muted-foreground">
            {result.stylingTips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
