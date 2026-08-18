import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateTryOn, VtonError } from "@/lib/vton";

export const maxDuration = 300;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let outfitId: string;
  let gender: string | null = null;
  try {
    const body = (await request.json()) as { outfitId?: unknown; gender?: unknown };
    outfitId = String(body?.outfitId ?? "");
    if (body?.gender && typeof body.gender === "string" && body.gender !== "none") {
      gender = body.gender;
    }
  } catch {
    return NextResponse.json({ error: "Missing outfitId." }, { status: 400 });
  }
  if (!outfitId) {
    return NextResponse.json({ error: "Missing outfitId." }, { status: 400 });
  }

  const outfit = await prisma.outfit.findFirst({
    where: { id: outfitId, userId: session.user.id },
    include: { items: { include: { wardrobeItem: true } } },
  });
  if (!outfit) {
    return NextResponse.json({ error: "Outfit not found." }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { bodyPhotoUrl: true, gender: true },
  });
  if (!user?.bodyPhotoUrl) {
    return NextResponse.json(
      { error: "Upload a full-body photo first so the AI knows what you look like." },
      { status: 400 },
    );
  }

  const userGender = gender ?? user.gender;

  await prisma.outfit.update({
    where: { id: outfit.id },
    data: { aiTryOnStatus: "running", aiTryOnUrl: null },
  });

  const origin = new URL(request.url).origin;

  try {
    const url = await generateTryOn({
      bodyPhotoUrl: user.bodyPhotoUrl,
      garments: outfit.items.map((oi) => oi.wardrobeItem),
      origin,
      gender: userGender,
    });
    await prisma.outfit.update({
      where: { id: outfit.id },
      data: { aiTryOnUrl: url, aiTryOnStatus: "completed" },
    });
    return NextResponse.json({ url });
  } catch (error) {
    const message =
      error instanceof VtonError
        ? error.message
        : "Something went wrong while generating your AI try-on.";
    await prisma.outfit
      .update({ where: { id: outfit.id }, data: { aiTryOnStatus: "failed" } })
      .catch(() => {});
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
