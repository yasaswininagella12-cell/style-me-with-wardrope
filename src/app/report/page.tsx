import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, Sparkles, Palette, Layers, ArrowRight, TrendingUp, PieChart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { buildStyleReport } from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AnalysisBucket } from "@/types";

export const metadata: Metadata = {
  title: "Style Report",
  description: "Wardrobe analytics, color distribution and styling gaps.",
};

function maxCount(buckets: AnalysisBucket[]): number {
  return buckets.reduce((m, b) => Math.max(m, b.count), 1);
}

function BarList({
  buckets,
  className = "",
}: {
  buckets: AnalysisBucket[];
  className?: string;
}) {
  const max = maxCount(buckets);
  if (buckets.length === 0) {
    return <p className="py-6 text-sm text-muted-foreground">No tagged items yet.</p>;
  }
  return (
    <div className={`space-y-2.5 ${className}`}>
      {buckets.map((bucket) => (
        <div key={bucket.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{bucket.label}</span>
            <span className="text-muted-foreground">{bucket.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-rose"
              style={{ width: `${Math.max(6, (bucket.count / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SwatchBar({ label, hex, count }: { label: string; hex: string; count: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-background/60 p-3">
      <span
        className="size-8 shrink-0 rounded-full border shadow-inner"
        style={{ backgroundColor: hex }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{count} {count === 1 ? "item" : "items"}</p>
      </div>
    </div>
  );
}

export default async function StyleReportPage() {
  const session = await auth();
  const userId = session!.user.id;

  const items = await prisma.wardrobeItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  const report = buildStyleReport(items);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-gold">Style Report</p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">What your closet can do</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          A live read of your wardrobe — colors, coverage, gaps and a versatility score.
          {items.length === 0 && " Add items to your wardrobe and this report comes alive."}
        </p>
      </div>

      {/* Score + palette highlight */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div
              className="relative flex size-36 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(var(--gold) ${report.versatilityScore * 3.6}deg, var(--gold-soft) 0deg)`,
              }}
            >
              <div className="flex size-28 flex-col items-center justify-center rounded-full bg-card">
                <span className="font-heading text-4xl font-bold">{report.versatilityScore}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">/ 100</span>
              </div>
            </div>
            <h2 className="mt-4 font-heading text-xl font-semibold">{report.versatilityLabel}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{report.summary}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <Palette className="size-4 text-brand-gold" aria-hidden="true" />
              Color families
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.byColor.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">No items yet — colors will appear here.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {report.byColor.slice(0, 12).map((c) => (
                  <SwatchBar key={c.label} {...c} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList buckets={report.byCategory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Occasions</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList buckets={report.byOccasion} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Season readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList buckets={report.bySeason} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <Layers className="size-4 text-brand-gold" aria-hidden="true" />
              Most versatile color
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.mostVersatileColor.count === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">Add items to find your workhorse color.</p>
            ) : (
              <div className="flex items-center gap-4 rounded-2xl border bg-accent/40 p-4">
                <span
                  className="size-14 rounded-full border-4 border-background shadow-inner"
                  style={{ backgroundColor: report.mostVersatileColor.hex }}
                  aria-hidden="true"
                />
                <div>
                  <p className="font-heading text-lg font-semibold">{report.mostVersatileColor.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {report.mostVersatileColor.count} {report.mostVersatileColor.count === 1 ? "piece" : "pieces"} —
                    your wardrobe&apos;s anchor.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <TrendingUp className="size-4 text-brand-gold" aria-hidden="true" />
              Styling tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Style</p>
                <BarList buckets={report.byStyle} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Material</p>
                <BarList buckets={report.byMaterial} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coverage + strengths / gaps */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <PieChart className="size-4 text-brand-gold" aria-hidden="true" />
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.coverage.map((check) => (
              <div
                key={check.id}
                className={`flex items-start gap-3 rounded-xl border p-3 ${
                  check.present ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-background/60"
                }`}
              >
                <span
                  className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
                    check.present ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {check.present ? <Check className="size-3.5" aria-hidden="true" /> : <X className="size-3.5" aria-hidden="true" />}
                </span>
                <div>
                  <p className="text-sm font-medium">{check.label}</p>
                  <p className="text-xs text-muted-foreground">{check.hint}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <Sparkles className="size-4 text-brand-gold" aria-hidden="true" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.strengths.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">No standout categories yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {report.strengths.map((strength) => (
                  <Badge key={strength} variant="secondary" className="gap-1">
                    <Check className="size-3" aria-hidden="true" />
                    {strength}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-brand-rose/40 bg-brand-rose/5">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Gaps to watch</CardTitle>
          </CardHeader>
          <CardContent>
            {report.gaps.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">
                No obvious gaps — this closet is well-rounded.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {report.gaps.map((gap) => (
                  <li key={gap} className="flex items-center gap-2">
                    <X className="size-4 shrink-0 text-brand-rose" aria-hidden="true" />
                    {gap}
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="outline" size="sm" className="mt-6">
              <Link href="/wardrobe">
                Fill a gap in your wardrobe
                <ArrowRight className="ml-2 size-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}