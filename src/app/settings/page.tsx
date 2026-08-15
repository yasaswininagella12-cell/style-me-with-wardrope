import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth-buttons";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Style Me With Wardrobe account settings.",
};

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Account</CardTitle>
            <CardDescription>Your sign-in details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user?.name ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">{user?.role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Member since</span>
              <span className="font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                    })
                  : "—"}
              </span>
            </div>
            <div className="pt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/profile">Edit profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-destructive">
              Sign out
            </CardTitle>
            <CardDescription>
              End your session on this device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignOutButton className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
