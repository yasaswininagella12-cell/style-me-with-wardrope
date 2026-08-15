import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Gem, Handbag, Users, Sparkles } from "lucide-react";

export default async function AdminOverviewPage() {
  const [trendCount, jewelryCount, accessoryCount, userCount, recommendationCount] =
    await Promise.all([
      prisma.trend.count(),
      prisma.jewelry.count(),
      prisma.accessory.count(),
      prisma.user.count(),
      prisma.styleRecommendation.count(),
    ]);

  const cards = [
    { label: "Trends", value: trendCount, icon: Flame, href: "/admin/trends" },
    { label: "Jewelry pieces", value: jewelryCount, icon: Gem, href: "/admin/catalog" },
    { label: "Accessories", value: accessoryCount, icon: Handbag, href: "/admin/catalog" },
    { label: "Style recommendations", value: recommendationCount, icon: Sparkles, href: "#" },
    { label: "Users", value: userCount, icon: Users, href: "#" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="font-heading text-base">{card.label}</CardTitle>
            <card.icon className="size-5 text-brand-gold" aria-hidden="true" />
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="font-heading text-3xl font-bold">{card.value}</p>
            {card.href !== "#" && (
              <Button asChild variant="ghost" size="sm">
                <Link href={card.href}>Manage</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
