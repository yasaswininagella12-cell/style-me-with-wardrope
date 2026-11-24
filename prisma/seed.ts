import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to your .env file before seeding.");
}

const dbUrl = new URL(connectionString);
const isLocal = ["localhost", "127.0.0.1", "::1"].includes(dbUrl.hostname);
const sslMode = dbUrl.searchParams.get("sslmode");
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    host: dbUrl.hostname,
    port: Number(dbUrl.port || 5432),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.slice(1),
    ssl:
      sslMode && sslMode !== "disable" && !isLocal
        ? { rejectUnauthorized: false }
        : undefined,
  }),
});

function daysFromNow(offset: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function main() {
  console.log("Seeding demo data…");

  const password = (p: string) => bcrypt.hashSync(p, 12);

  // ---------------------------------------------------------
  // Demo users
  // ---------------------------------------------------------
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Demo Admin",
      email: "admin@example.com",
      password: password("admin123"),
      role: "admin",
      preferredStyle: "elegant",
      preferredColorPalette: "neutral",
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@example.com",
      password: password("user123"),
      role: "user",
      preferredStyle: "casual-chic",
      preferredColorPalette: "earthy",
    },
  });

  console.log(`Users ready: admin@example.com / admin123, user@example.com / user123`);

  const demoIds = [admin.id, demoUser.id];

  await prisma.lookComment.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.lookLike.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.savedLook.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.outfitPlan.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.wearLog.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.careLog.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.outfit.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.wishlistItem.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.budget.deleteMany({ where: { userId: { in: demoIds } } });
  await prisma.follow.deleteMany({
    where: {
      OR: [
        { followerId: { in: demoIds } },
        { followingId: { in: demoIds } },
      ],
    },
  });
  await prisma.wardrobeItem.deleteMany({ where: { userId: { in: demoIds } } });

  const wardrobeSeed = [
    {
      key: "demoBlouse",
      userId: demoUser.id,
      name: "Ivory silk blouse",
      imageUrl: "/globe.svg",
      category: "top",
      color: "white",
      secondaryColor: null,
      pattern: "solid",
      material: "silk",
      occasion: "work",
      season: "all-season",
      style: "minimal",
      purchasePrice: 78,
      careInstructions: "Dry clean only",
      careIntervalDays: 30,
    },
    {
      key: "demoTrousers",
      userId: demoUser.id,
      name: "Tailored black trousers",
      imageUrl: "/window.svg",
      category: "pants",
      color: "black",
      secondaryColor: null,
      pattern: "solid",
      material: "wool",
      occasion: "work",
      season: "all-season",
      style: "elegant",
      purchasePrice: 120,
      careInstructions: "Machine wash cold, hang dry",
      careIntervalDays: 45,
    },
    {
      key: "demoCoat",
      userId: demoUser.id,
      name: "Camel wool coat",
      imageUrl: "/file.svg",
      category: "jacket",
      color: "beige",
      secondaryColor: null,
      pattern: "solid",
      material: "wool",
      occasion: "work",
      season: "winter",
      style: "classic",
      purchasePrice: 240,
      careInstructions: "Dry clean at season change",
      careIntervalDays: 60,
    },
    {
      key: "demoTee",
      userId: demoUser.id,
      name: "Blue striped tee",
      imageUrl: "/next.svg",
      category: "tshirt",
      color: "light-blue",
      secondaryColor: "white",
      pattern: "stripes",
      material: "cotton",
      occasion: "casual",
      season: "summer",
      style: "casual",
      purchasePrice: 34,
      careInstructions: "Machine wash cold",
      careIntervalDays: 20,
    },
    {
      key: "adminBlazer",
      userId: admin.id,
      name: "Navy tailored blazer",
      imageUrl: "/vercel.svg",
      category: "blazer",
      color: "navy",
      secondaryColor: null,
      pattern: "solid",
      material: "wool",
      occasion: "work",
      season: "all-season",
      style: "elegant",
      purchasePrice: 180,
      careInstructions: "Dry clean only",
      careIntervalDays: 45,
    },
    {
      key: "adminSkirt",
      userId: admin.id,
      name: "Pleated midi skirt",
      imageUrl: "/globe.svg",
      category: "skirt",
      color: "navy",
      secondaryColor: null,
      pattern: "solid",
      material: "polyester",
      occasion: "evening",
      season: "all-season",
      style: "chic",
      purchasePrice: 95,
      careInstructions: "Hand wash cold",
      careIntervalDays: 30,
    },
  ];

  const itemIds: Record<string, string> = {};
  for (const item of wardrobeSeed) {
    const created = await prisma.wardrobeItem.create({
      data: {
        userId: item.userId,
        name: item.name,
        imageUrl: item.imageUrl,
        category: item.category,
        color: item.color,
        secondaryColor: item.secondaryColor,
        pattern: item.pattern,
        material: item.material,
        occasion: item.occasion,
        season: item.season,
        style: item.style,
        purchasePrice: item.purchasePrice,
        careInstructions: item.careInstructions,
        careIntervalDays: item.careIntervalDays,
      },
    });
    itemIds[item.key] = created.id;
  }

  const demoWorkOutfit = await prisma.outfit.create({
    data: {
      userId: demoUser.id,
      name: "Everyday smart casual",
      occasion: "work",
      style: "minimal",
      items: {
        create: [
          { wardrobeItemId: itemIds.demoBlouse },
          { wardrobeItemId: itemIds.demoTrousers },
          { wardrobeItemId: itemIds.demoCoat },
        ],
      },
    },
  });

  const demoWeekendOutfit = await prisma.outfit.create({
    data: {
      userId: demoUser.id,
      name: "Weekend coffee run",
      occasion: "casual",
      style: "casual",
      items: {
        create: [
          { wardrobeItemId: itemIds.demoTee },
          { wardrobeItemId: itemIds.demoTrousers },
        ],
      },
    },
  });

  const adminOutfit = await prisma.outfit.create({
    data: {
      userId: admin.id,
      name: "Midnight office edit",
      occasion: "work",
      style: "elegant",
      items: {
        create: [
          { wardrobeItemId: itemIds.adminBlazer },
          { wardrobeItemId: itemIds.adminSkirt },
        ],
      },
    },
  });

  const demoPublicLook = await prisma.savedLook.create({
    data: {
      userId: demoUser.id,
      outfitId: demoWorkOutfit.id,
      name: "Neutrals for the office",
      description: "A quiet-luxury work look built around soft neutrals and sharp tailoring.",
      isPublic: true,
    },
  });

  await prisma.savedLook.create({
    data: {
      userId: demoUser.id,
      outfitId: demoWeekendOutfit.id,
      name: "Striped and relaxed",
      description: "A casual weekend look I am keeping private for now.",
      isPublic: false,
    },
  });

  const adminPublicLook = await prisma.savedLook.create({
    data: {
      userId: admin.id,
      outfitId: adminOutfit.id,
      name: "Midnight tailoring",
      description: "Navy on navy with a pleated skirt for a polished evening meeting.",
      isPublic: true,
    },
  });

  await prisma.wearLog.createMany({
    data: [
      { userId: demoUser.id, wardrobeItemId: itemIds.demoBlouse, wornAt: daysFromNow(-2) },
      { userId: demoUser.id, wardrobeItemId: itemIds.demoTrousers, wornAt: daysFromNow(-2) },
      { userId: demoUser.id, wardrobeItemId: itemIds.demoBlouse, wornAt: daysFromNow(-9) },
      { userId: demoUser.id, wardrobeItemId: itemIds.demoCoat, wornAt: daysFromNow(-12) },
      { userId: demoUser.id, wardrobeItemId: itemIds.demoTee, wornAt: daysFromNow(-4) },
      { userId: admin.id, wardrobeItemId: itemIds.adminBlazer, wornAt: daysFromNow(-3) },
      { userId: admin.id, wardrobeItemId: itemIds.adminSkirt, wornAt: daysFromNow(-3) },
    ],
  });

  await prisma.careLog.createMany({
    data: [
      {
        userId: demoUser.id,
        wardrobeItemId: itemIds.demoCoat,
        careType: "dry-clean",
        caredAt: daysFromNow(-45),
        nextDueAt: daysFromNow(-2),
        note: "Last cleaned before winter",
      },
      {
        userId: demoUser.id,
        wardrobeItemId: itemIds.demoBlouse,
        careType: "wash",
        caredAt: daysFromNow(-5),
        nextDueAt: daysFromNow(20),
        note: "Cold wash, air dried",
      },
      {
        userId: admin.id,
        wardrobeItemId: itemIds.adminBlazer,
        careType: "dry-clean",
        caredAt: daysFromNow(-10),
        nextDueAt: daysFromNow(25),
      },
    ],
  });

  await prisma.outfitPlan.createMany({
    data: [
      {
        userId: demoUser.id,
        outfitId: demoWorkOutfit.id,
        date: dateKey(daysFromNow(2)),
        note: "Team presentation",
      },
      {
        userId: demoUser.id,
        outfitId: demoWeekendOutfit.id,
        date: dateKey(daysFromNow(5)),
      },
      {
        userId: admin.id,
        outfitId: adminOutfit.id,
        date: dateKey(daysFromNow(1)),
        note: "Client dinner",
      },
    ],
  });

  await prisma.wishlistItem.createMany({
    data: [
      {
        userId: demoUser.id,
        name: "Tailored black blazer",
        category: "blazer",
        estimatedPrice: 180,
        priority: "essential",
        note: "The missing layer for work outfits.",
      },
      {
        userId: demoUser.id,
        name: "Cashmere turtleneck",
        category: "top",
        estimatedPrice: 110,
        priority: "nice-to-have",
        note: "Soft layer for colder offices.",
      },
      {
        userId: demoUser.id,
        name: "Leather loafers",
        category: "other",
        estimatedPrice: 140,
        priority: "dream",
        status: "purchased",
        purchasedAt: new Date(),
      },
      {
        userId: admin.id,
        name: "Emerald satin dress",
        category: "dress",
        estimatedPrice: 160,
        priority: "dream",
      },
    ],
  });

  await prisma.budget.upsert({
    where: { userId: demoUser.id },
    update: { monthlyLimit: 300 },
    create: { userId: demoUser.id, monthlyLimit: 300 },
  });

  await prisma.budget.upsert({
    where: { userId: admin.id },
    update: { monthlyLimit: 200 },
    create: { userId: admin.id, monthlyLimit: 200 },
  });

  await prisma.follow.createMany({
    data: [
      { followerId: demoUser.id, followingId: admin.id },
      { followerId: admin.id, followingId: demoUser.id },
    ],
  });

  await prisma.lookLike.createMany({
    data: [
      { userId: admin.id, savedLookId: demoPublicLook.id },
      { userId: demoUser.id, savedLookId: adminPublicLook.id },
    ],
  });

  await prisma.lookComment.create({
    data: {
      userId: admin.id,
      savedLookId: demoPublicLook.id,
      body: "Love how the camel coat softens the tailoring!",
    },
  });

  console.log("Wear, wishlist, calendar and feed demo data seeded.");

  // ---------------------------------------------------------
  // Reset demo catalog (idempotent)
  // ---------------------------------------------------------
  await prisma.trend.deleteMany();
  await prisma.jewelry.deleteMany();
  await prisma.accessory.deleteMany();
  await prisma.styleRecommendation.deleteMany();
  await prisma.colorMatch.deleteMany();

  // ---------------------------------------------------------
  // Trends
  // ---------------------------------------------------------
  await prisma.trend.create({
    data: {
      name: "Quiet Luxury",
      description:
        "Understated tailoring in warm neutrals, elevated by texture rather than logos.",
      style: "elegant",
      season: "fall",
      featured: true,
      items: {
        create: [
          { section: "Outerwear", name: "Cashmere wool coat", detail: "Oversized, camel" },
          { section: "Knitwear", name: "Ribbed turtleneck", detail: "Merino, ivory" },
          { section: "Bottoms", name: "Straight-leg trousers", detail: "High waist, taupe" },
          { section: "Shoes", name: "Chunky loafers", detail: "Polished leather" },
        ],
      },
    },
  });

  await prisma.trend.create({
    data: {
      name: "Neo-Boho",
      description: "Flowy silhouettes, crochet textures and warm earth tones with modern cuts.",
      style: "bohemian",
      season: "spring",
      featured: true,
      items: {
        create: [
          { section: "Tops", name: "Crochet halter top", detail: "Cream" },
          { section: "Bottoms", name: "Wide-leg palazzo pants", detail: "Ochre" },
          { section: "Accessories", name: "Leather waist belt", detail: "Braided, tan" },
          { section: "Footwear", name: "Studded sandals", detail: "Flat" },
        ],
      },
    },
  });

  await prisma.trend.create({
    data: {
      name: "Mono-Glam",
      description: "Head-to-toe satin and shine in a single statement color.",
      style: "glamorous",
      season: "winter",
      featured: false,
      items: {
        create: [
          { section: "Dresses", name: "Slip dress", detail: "Satin, emerald" },
          { section: "Outerwear", name: "Sequined blazer", detail: "Green-tone" },
          { section: "Shoes", name: "Pointed heels", detail: "Emerald satin" },
        ],
      },
    },
  });

  await prisma.trend.create({
    data: {
      name: "Modern Preppy",
      description: "Tailored blazers, crisp cottons and retro stripes with a relaxed fit.",
      style: "preppy",
      season: "summer",
      featured: false,
      items: {
        create: [
          { section: "Tops", name: "Oxford button-down", detail: "Light blue" },
          { section: "Bottoms", name: "Pleated skirt", detail: "Navy, above the knee" },
          { section: "Accessories", name: "Silk scarf", detail: "Striped" },
          { section: "Footwear", name: "Penny loafers", detail: "Burgundy" },
        ],
      },
    },
  });

  console.log("Trends seeded.");

  // ---------------------------------------------------------
  // Jewelry catalog
  // ---------------------------------------------------------
  await prisma.jewelry.createMany({
    data: [
      { name: "Gold Chain Necklace", type: "necklace", color: "gold", material: "Gold-tone", style: "elegant", occasion: "evening" },
      { name: "Pearl Stud Earrings", type: "earrings", color: "white", material: "Pearl", style: "classic", occasion: "formal" },
      { name: "Chunky Silver Ring", type: "ring", color: "silver", material: "Sterling silver", style: "edgy", occasion: "casual" },
      { name: "Rose Gold Bracelet", type: "bracelet", color: "rose-gold", material: "Metal", style: "romantic", occasion: "date-night" },
      { name: "Turquoise Pendant", type: "necklace", color: "teal", material: "Stone", style: "bohemian", occasion: "casual" },
      { name: "Hoop Earrings", type: "earrings", color: "gold", material: "Gold-tone", style: "streetwear", occasion: "casual" },
      { name: "Statement Cocktail Ring", type: "ring", color: "emerald", material: "Gemstone", style: "glamorous", occasion: "evening" },
      { name: "Layered Charm Necklace", type: "necklace", color: "gold", material: "Mixed", style: "casual-chic", occasion: "casual" },
    ],
  });

  console.log("Jewelry seeded.");

  // ---------------------------------------------------------
  // Accessory catalog
  // ---------------------------------------------------------
  await prisma.accessory.createMany({
    data: [
      { name: "Black Leather Handbag", type: "handbag", color: "black", style: "elegant", occasion: "formal" },
      { name: "Woven Straw Tote", type: "bag", color: "beige", style: "bohemian", occasion: "casual" },
      { name: "Silk Twill Scarf", type: "scarf", color: "multi", style: "preppy", occasion: "casual" },
      { name: "Minimalist Crossbody", type: "bag", color: "brown", style: "casual-chic", occasion: "casual" },
      { name: "Statement Sunglasses", type: "sunglasses", color: "black", style: "streetwear", occasion: "casual" },
      { name: "Pearl Belt", type: "belt", color: "white", style: "classic", occasion: "evening" },
      { name: "Cashmere Beanie", type: "hat", color: "gray", style: "streetwear", occasion: "casual" },
      { name: "Evening Clutch", type: "handbag", color: "gold", style: "glamorous", occasion: "evening" },
    ],
  });

  console.log("Accessories seeded.");

  // ---------------------------------------------------------
  // Style recommendations
  // ---------------------------------------------------------
  await prisma.styleRecommendation.createMany({
    data: [
      { category: "footwear", itemType: "heels", name: "Nude Pointed Heels", color: "nude", style: "elegant", occasion: "formal" },
      { category: "footwear", itemType: "sneakers", name: "White Leather Sneakers", color: "white", style: "casual", occasion: "casual" },
      { category: "footwear", itemType: "boots", name: "Knee-High Suede Boots", color: "brown", style: "edgy", occasion: "casual" },
      { category: "footwear", itemType: "flats", name: "Ballet Flats", color: "black", style: "classic", occasion: "casual" },
      { category: "bag", itemType: "tote", name: "Leather Tote Bag", color: "tan", style: "casual-chic", occasion: "casual" },
      { category: "bag", itemType: "clutch", name: "Sequin Clutch", color: "silver", style: "glamorous", occasion: "evening" },
      { category: "outerwear", itemType: "blazer", name: "Tailored Blazer", color: "navy", style: "preppy", occasion: "formal" },
      { category: "outerwear", itemType: "denim-jacket", name: "Classic Denim Jacket", color: "blue", style: "casual", occasion: "casual" },
    ],
  });

  console.log("Style recommendations seeded.");

  // ---------------------------------------------------------
  // Color matches
  // ---------------------------------------------------------
  await prisma.colorMatch.createMany({
    data: [
      { baseColor: "black", matchColor: "white", metalTone: "silver", category: "monochrome", priority: 5 },
      { baseColor: "white", matchColor: "black", metalTone: "gold", category: "monochrome", priority: 5 },
      { baseColor: "navy", matchColor: "white", metalTone: "silver", category: "classic", priority: 4 },
      { baseColor: "beige", matchColor: "brown", metalTone: "gold", category: "earth", priority: 4 },
      { baseColor: "blue", matchColor: "white", metalTone: "silver", category: "cool", priority: 3 },
      { baseColor: "red", matchColor: "black", metalTone: "gold", category: "warm", priority: 3 },
      { baseColor: "emerald", matchColor: "gold", metalTone: "gold", category: "rich", priority: 4 },
      { baseColor: "gray", matchColor: "silver", metalTone: "silver", category: "cool", priority: 3 },
    ],
  });

  console.log("Color matches seeded.");
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
