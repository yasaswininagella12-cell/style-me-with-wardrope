import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { RemixClient } from "@/components/remix/remix-client";

export const metadata: Metadata = {
  title: "Remix a Piece",
  description: "One piece, three complete looks — the anti outfit-repeat tool.",
};

export default async function RemixPage() {
  const session = await auth();
  const userId = session!.user.id;

  const items = await prisma.wardrobeItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-gold">Remix</p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
          One piece, three looks
        </h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Pick the piece you keep wearing the same way, and get three completely styled outfits
          built around it — jewelry, footwear, hair, makeup and all.
        </p>
      </div>
      <RemixClient items={items} />
    </div>
  );
}