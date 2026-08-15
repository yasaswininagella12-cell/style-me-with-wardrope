import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to your .env file before seeding.");
}

const dbUrl = new URL(connectionString);
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    host: dbUrl.hostname,
    port: Number(dbUrl.port || 5432),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  }),
});

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
