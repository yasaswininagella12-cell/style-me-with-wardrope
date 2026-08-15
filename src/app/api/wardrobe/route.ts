import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { wardrobeItemSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.wardrobeItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = wardrobeItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid item data.", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const item = await prisma.wardrobeItem.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  return NextResponse.json({ item }, { status: 201 });
}
