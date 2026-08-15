"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { imageUrlSchema } from "@/lib/validations";

export type AdminResult = { error?: string; success?: string };

const trendInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500, "Description must be 500 characters or fewer").optional().nullable(),
  imageUrl: imageUrlSchema.optional().or(z.literal("")),
  style: z.string().optional().nullable(),
  occasion: z.string().optional().nullable(),
  season: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  sections: z.string().max(4000).optional().nullable(),
});

const catalogInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.string().min(1, "Type is required"),
  category: z.enum(["jewelry", "accessory"]),
  color: z.string().optional().nullable(),
  style: z.string().optional().nullable(),
  occasion: z.string().optional().nullable(),
  imageUrl: imageUrlSchema.optional().or(z.literal("")),
  description: z.string().max(500).optional().nullable(),
});

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Admin access required.");
  }
}

function parseSections(raw?: string | null): { section: string; name: string; detail?: string }[] {
  if (!raw) return [];
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      const [section, name, detail] = parts;
      if (!section || !name) return null;
      return { section, name, detail: detail || undefined };
    })
    .filter(Boolean) as { section: string; name: string; detail?: string }[];
}

// =============================================================
// Trends
// =============================================================

export async function createTrend(input: unknown): Promise<AdminResult> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Admin access required." };
  }

  const parsed = trendInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.name?.[0] ?? "Please check the fields." };
  }

  const sections = parseSections(parsed.data.sections);

  const trend = await prisma.trend.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      imageUrl: parsed.data.imageUrl || null,
      style: parsed.data.style || null,
      occasion: parsed.data.occasion || null,
      season: parsed.data.season || null,
      featured: parsed.data.featured ?? false,
      items: sections.length
        ? { create: sections.map((s) => ({ section: s.section, name: s.name, detail: s.detail })) }
        : undefined,
    },
  });

  revalidatePath("/trends");
  revalidatePath("/admin/trends");
  revalidatePath("/favorites");
  return { success: `Trend "${trend.name}" created.` };
}

export async function deleteTrend(id: string): Promise<AdminResult> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Admin access required." };
  }

  await prisma.trend.delete({ where: { id } });
  revalidatePath("/trends");
  revalidatePath("/admin/trends");
  return { success: "Trend deleted." };
}

// =============================================================
// Catalog (jewelry & accessories)
// =============================================================

export async function createCatalogItem(input: unknown): Promise<AdminResult> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Admin access required." };
  }

  const parsed = catalogInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please check the fields." };
  }

  const data = {
    name: parsed.data.name,
    type: parsed.data.type,
    color: parsed.data.color || null,
    style: parsed.data.style || null,
    occasion: parsed.data.occasion || null,
    imageUrl: parsed.data.imageUrl || null,
    description: parsed.data.description || null,
  };

  if (parsed.data.category === "jewelry") {
    await prisma.jewelry.create({ data });
  } else {
    await prisma.accessory.create({ data });
  }

  revalidatePath("/admin/catalog");
  return { success: `"${parsed.data.name}" added to the catalog.` };
}

export async function deleteCatalogItem(category: "jewelry" | "accessory", id: string): Promise<AdminResult> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Admin access required." };
  }

  if (category === "jewelry") {
    await prisma.jewelry.delete({ where: { id } });
  } else {
    await prisma.accessory.delete({ where: { id } });
  }

  revalidatePath("/admin/catalog");
  return { success: "Item deleted from the catalog." };
}
