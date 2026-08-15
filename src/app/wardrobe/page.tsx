import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { WardrobeClient } from "@/components/wardrobe/wardrobe-client";

export const metadata: Metadata = {
  title: "My Wardrobe",
  description: "Manage your wardrobe and clothing items.",
};

export default async function WardrobePage() {
  const session = await auth();
  const userId = session!.user.id;

  const items = await prisma.wardrobeItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <WardrobeClient items={items} />
    </div>
  );
}
