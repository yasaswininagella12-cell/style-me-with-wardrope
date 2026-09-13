import type { Metadata } from "next";
import { auth } from "@/auth";
import { PackingClient } from "@/components/packing/packing-client";

export const metadata: Metadata = {
  title: "Trip Packing Planner",
  description: "Turn your wardrobe into a travel capsule with a day-by-day packing plan.",
};

export default async function PackingPage() {
  const session = await auth();
  void session!.user.id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-gold">Packing</p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
          Turn your closet into a travel capsule
        </h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Tell us your destination, trip length and vibe, and we&apos;ll pick a compact capsule from
          your wardrobe, plan a mix-and-match outfit for every day, and generate a packing checklist.
        </p>
      </div>
      <PackingClient />
    </div>
  );
}