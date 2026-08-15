"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Flame } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { optionLabel } from "@/lib/constants";
import { toggleFavorite } from "@/lib/actions";
import type { Trend } from "@/generated/prisma/client";

export function TrendCard({
  trend,
  items,
  isFavorite,
}: {
  trend: Trend;
  items: { section: string; name: string; detail?: string | null }[];
  isFavorite: boolean;
}) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(isFavorite);
  const [pending, setPending] = useState(false);

  async function handleFavorite() {
    setPending(true);
    const result = await toggleFavorite({ targetType: "trend", targetId: trend.id });
    setPending(false);
    if (result && "data" in result && result.data) {
      setFavorite(result.data.isFavorite);
      toast.success(result.data.isFavorite ? "Added to favorites." : "Removed from favorites.");
      router.refresh();
    }
  }

  const sections = items.reduce<Record<string, string[]>>((acc, item) => {
    const list = acc[item.section] ?? [];
    list.push(item.name);
    acc[item.section] = list;
    return acc;
  }, {});

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9] bg-muted">
        {trend.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trend.imageUrl}
            alt={trend.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-sand/50 to-brand-gold-soft/40">
            <Flame className="size-10 text-brand-gold" aria-hidden="true" />
          </div>
        )}
        {trend.featured && (
          <Badge className="absolute left-3 top-3 rounded-full">
            <Flame className="mr-1 size-3" aria-hidden="true" />
            Trending now
          </Badge>
        )}
        <button
          type="button"
          onClick={handleFavorite}
          disabled={pending}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          className={`absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border bg-background/90 shadow-sm backdrop-blur transition-colors ${
            favorite ? "text-brand-rose" : "text-muted-foreground hover:text-brand-rose"
          }`}
        >
          <Heart className={`size-4 ${favorite ? "fill-current" : ""}`} />
        </button>
      </div>
      <CardContent className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-semibold">{trend.name}</h3>
        {trend.description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{trend.description}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {trend.style && (
            <Badge variant="secondary" className="rounded-full text-xs">
              {optionLabel(trend.style)}
            </Badge>
          )}
          {trend.occasion && (
            <Badge variant="outline" className="rounded-full text-xs">
              {optionLabel(trend.occasion)}
            </Badge>
          )}
          {trend.season && (
            <Badge variant="outline" className="rounded-full text-xs">
              {optionLabel(trend.season)}
            </Badge>
          )}
        </div>

        {Object.keys(sections).length > 0 && (
          <div className="mt-4 space-y-2 border-t pt-4">
            {Object.entries(sections).map(([section, names]) => (
              <div key={section} className="text-sm">
                <span className="font-medium">{optionLabel(section, section)}:</span>{" "}
                <span className="text-muted-foreground">{names.join(", ")}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-5">
          <Button asChild variant="outline" className="w-full">
            <Link href="/style">Style this trend</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
