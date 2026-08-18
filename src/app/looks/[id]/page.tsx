import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { generateStyling } from "@/lib/recommendations";
import { LookDisplay } from "@/components/look/look-display";
import { LookActions } from "@/components/look/look-actions";
import { optionLabel } from "@/lib/constants";
import type { StylingResult } from "@/types";
import type { WardrobeItem } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Your complete look",
  description: "Your complete styled look with matching jewelry, footwear and more.",
};

export default async function LookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const outfit = await prisma.outfit.findFirst({
    where: { id, userId },
    include: {
      items: { include: { wardrobeItem: true } },
      savedLook: true,
    },
  });

  if (!outfit) notFound();

  const [user, items] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { bodyPhotoUrl: true, gender: true } }),
    Promise.resolve(outfit.items.map((oi) => oi.wardrobeItem)),
  ]);

  let result: StylingResult;
  if (outfit.lookData) {
    result = outfit.lookData as unknown as StylingResult;
  } else {
    result = await generateStyling({
      wardrobeItems: items,
      occasion: outfit.occasion,
      style: outfit.style,
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-gold">
          Your complete look
        </p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {outfit.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {outfit.occasion && (
            <span className="rounded-full border bg-card px-3 py-1">
              {optionLabel(outfit.occasion)}
            </span>
          )}
          {outfit.style && (
            <span className="rounded-full border bg-card px-3 py-1">
              {optionLabel(outfit.style)}
            </span>
          )}
          <span>{items.length} {items.length === 1 ? "piece" : "pieces"}</span>
        </div>
        <div className="mt-6">
          <LookActions
            outfitId={outfit.id}
            alreadySaved={!!outfit.savedLook}
            itemIds={items.map((i: WardrobeItem) => i.id)}
            occasion={outfit.occasion}
            style={outfit.style}
          />
        </div>
      </div>

      <LookDisplay
        result={result}
        name={outfit.name}
        occasion={outfit.occasion}
        bodyPhotoUrl={user?.bodyPhotoUrl}
        outfitId={outfit.id}
        aiTryOnUrl={outfit.aiTryOnUrl}
        gender={user?.gender}
      />
    </div>
  );
}
