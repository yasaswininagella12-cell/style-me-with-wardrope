import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const trends = await prisma.trend.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: { items: true },
  });

  return NextResponse.json({ trends });
}
