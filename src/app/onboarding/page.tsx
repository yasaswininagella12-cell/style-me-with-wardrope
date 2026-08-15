import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { BodyPhotoUploader } from "@/components/profile/body-photo-uploader";
import { Button } from "@/components/ui/button";
import { UserRound, Wand2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Upload your photo",
  description: "Add your full-body photo so looks are shown on you.",
};

export default async function OnboardingPage() {
  const session = await auth();
  const userId = session!.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bodyPhotoUrl: true },
  });

  if (user?.bodyPhotoUrl) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold">
          <UserRound className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight">
          Try outfits on your own photo
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload one full top-to-bottom photo. From now on, every look you generate will be shown
          worn on your picture — a virtual dressing room.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <BodyPhotoUploader value={user?.bodyPhotoUrl} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/style">
            <Wand2 className="mr-2 size-4" aria-hidden="true" />
            Start styling
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/dashboard">Skip for now</Link>
        </Button>
      </div>
    </div>
  );
}
