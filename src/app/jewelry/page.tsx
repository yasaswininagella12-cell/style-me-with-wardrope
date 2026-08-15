import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { JewelryMatcher } from "@/components/jewelry/jewelry-matcher";

export const metadata: Metadata = {
  title: "Jewelry Matcher",
  description: "Match jewelry to your outfit based on color, style and occasion.",
};

export default async function JewelryPage() {
  const session = await auth();
  const userId = session!.user.id;

  const items = await prisma.wardrobeItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Jewelry Matcher</h1>
        <p className="mt-1 text-muted-foreground">
          Find the perfect jewelry for any outfit piece in your wardrobe.
        </p>
      </div>
      <JewelryMatcher items={items} />
    </div>
  );
}
