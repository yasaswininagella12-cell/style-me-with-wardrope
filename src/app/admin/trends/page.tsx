import { prisma } from "@/lib/prisma";
import { deleteTrend } from "@/lib/admin-actions";
import { TrendForm } from "@/components/admin/trend-form";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { optionLabel } from "@/lib/constants";

export default async function AdminTrendsPage() {
  const trends = await prisma.trend.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: { items: true },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">Existing trends ({trends.length})</h2>
        {trends.length === 0 ? (
          <p className="text-sm text-muted-foreground">No trends yet — create your first one.</p>
        ) : (
          <div className="space-y-3">
            {trends.map((trend) => (
              <Card key={trend.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="font-heading text-base">{trend.name}</CardTitle>
                      {trend.description && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {trend.description}
                        </CardDescription>
                      )}
                    </div>
                    <AdminDeleteButton
                      run={() => deleteTrend(trend.id)}
                      description={`Delete "${trend.name}" and its ${trend.items.length} item(s)? This cannot be undone.`}
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2">
                  {trend.featured && (
                    <Badge className="rounded-full bg-brand-gold text-brand-espresso">Featured</Badge>
                  )}
                  {trend.style && (
                    <Badge variant="secondary" className="rounded-full text-xs">
                      {optionLabel(trend.style)}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {trend.items.length} items
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <TrendForm />
    </div>
  );
}
