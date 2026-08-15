import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";

const columns = [
  {
    title: "Features",
    links: [
      { href: "/wardrobe", label: "My Wardrobe" },
      { href: "/style", label: "Style My Outfit" },
      { href: "/jewelry", label: "Jewelry Matcher" },
      { href: "/trends", label: "Trend Setter" },
      { href: "/saved-looks", label: "Saved Looks" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <SiteLogo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Your personal fashion stylist. Turn the clothes you already own into complete,
            trend-setting looks with jewelry, footwear, bags and makeup suggestions that match
            your skin tone and style.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {column.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Style Me With Wardrobe. All rights reserved.</p>
          <p>Crafted with style, for your wardrobe.</p>
        </div>
      </div>
    </footer>
  );
}
