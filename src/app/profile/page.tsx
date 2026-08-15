import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata: Metadata = {
  title: "Profile",
  description: "Edit your Style Me With Wardrobe profile.",
};

export default async function ProfilePage() {
  const session = await auth();
  const userId = session!.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Your account details and style preferences.
        </p>
      </div>
      <ProfileForm
        name={user?.name}
        image={user?.image}
        bodyPhotoUrl={user?.bodyPhotoUrl}
        preferredStyle={user?.preferredStyle}
        preferredColorPalette={user?.preferredColorPalette}
      />
    </div>
  );
}
