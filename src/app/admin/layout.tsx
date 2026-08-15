import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin",
  description: "Style Me With Wardrobe administration.",
};

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/trends", label: "Trends" },
  { href: "/admin/catalog", label: "Catalog" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
        <ShieldAlert className="size-10 text-destructive" aria-hidden="true" />
        <h1 className="mt-4 font-heading text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is restricted to administrators only.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-gold">Admin</p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
          Management console
        </h1>
      </div>

      <nav className="mb-8 flex flex-wrap gap-2 border-b pb-4">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
