import Link from "next/link";
import { Sparkles } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/wardrobe", label: "My Wardrobe" },
  { href: "/style", label: "Style My Outfit" },
  { href: "/jewelry", label: "Jewelry" },
  { href: "/trends", label: "Trends" },
  { href: "/saved-looks", label: "Saved Looks" },
  { href: "/how-it-works", label: "How It Works" },
];

export function SiteLogo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Sparkles className="size-5" aria-hidden="true" />
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight">
        Style Me
        <span className="text-brand-gold"> With Wardrobe</span>
      </span>
    </Link>
  );
}

export { navLinks };
