import { prisma } from "@/lib/prisma";
import { deleteCatalogItem } from "@/lib/admin-actions";
import { CatalogForm } from "@/components/admin/catalog-form";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { optionLabel } from "@/lib/constants";
import { Gem, Handbag } from "lucide-react";

export default async function AdminCatalogPage() {
  const [jewelry, accessories] = await Promise.all([
    prisma.jewelry.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.accessory.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const section = (title: string, Icon: typeof Gem, items: { id: string; name: string; type: string; color?: string | null; style?: string | null }[]) => (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 font-heading text-base font-semibold">
        <Icon className="size-4 text-brand-gold" aria-hidden="true" />
        {title} ({items.length})
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">None yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="font-heading text-sm">{item.name}</CardTitle>
                  <AdminDeleteButton
                    run={() =>
                      deleteCatalogItem(
                        title.toLowerCase().startsWith("jewelry") ? "jewelry" : "accessory",
                        item.id,
                      )
                    }
                    description={`Delete "${item.name}" from the catalog?`}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2 pb-3">
                <Badge variant="secondary" className="rounded-full text-xs">
                  {optionLabel(item.type)}
                </Badge>
                {item.color && (
                  <Badge variant="outline" className="rounded-full text-xs">
                    {optionLabel(item.color)}
                  </Badge>
                )}
                {item.style && (
                  <span className="text-xs text-muted-foreground">{optionLabel(item.style)}</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-8">
        {section("Jewelry", Gem, jewelry)}
        {section("Accessories", Handbag, accessories)}
      </div>

      <CatalogForm />
    </div>
  );
}
