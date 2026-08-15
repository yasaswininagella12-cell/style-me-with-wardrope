import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { StylePicker } from "@/components/style/style-picker";

export const metadata: Metadata = {
  title: "Style My Outfit",
  description: "Pick your pieces and get a complete, occasion-ready look.",
};

export default async function StylePage() {
  const session = await auth();
  const userId = session!.user.id;

  const items = await prisma.wardrobeItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Style My Outfit</h1>
        <p className="mt-1 text-muted-foreground">
          Select pieces from your wardrobe and we&apos;ll complete the look with jewelry,
          footwear, bags, makeup and more.
        </p>
      </div>
      <StylePicker items={items} />
    </div>
  );
}
