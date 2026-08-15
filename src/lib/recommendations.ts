import "server-only";

import { prisma } from "@/lib/prisma";
import type { RecommendationItem, StylingInput, StylingResult } from "@/types";

// =============================================================
// Metal tone & color theory
// =============================================================

const METAL_TONES: Record<string, string[]> = {
  black: ["gold", "silver"],
  white: ["silver", "gold"],
  grey: ["silver", "gold"],
  beige: ["gold", "rose-gold"],
  nude: ["gold", "rose-gold"],
  brown: ["gold", "rose-gold"],
  navy: ["silver", "gold"],
  blue: ["silver", "white-gold"],
  "light-blue": ["silver", "white-gold"],
  teal: ["silver", "gold"],
  turquoise: ["silver", "gold"],
  green: ["gold", "rose-gold"],
  olive: ["gold", "rose-gold"],
  emerald: ["gold", "rose-gold"],
  red: ["gold"],
  maroon: ["gold", "rose-gold"],
  pink: ["rose-gold", "pearl"],
  rose: ["rose-gold", "pearl"],
  purple: ["silver", "white-gold"],
  lavender: ["silver", "rose-gold"],
  yellow: ["gold"],
  gold: ["gold"],
  silver: ["silver"],
  orange: ["gold", "rose-gold"],
  peach: ["gold", "rose-gold"],
  multicolor: ["gold", "silver"],
  other: ["gold", "silver"],
};

const PALETTES: Record<string, string[]> = {
  black: ["Gold", "Silver", "White", "Red"],
  white: ["Gold", "Silver", "Pastel Pink", "Nude"],
  grey: ["Silver", "White", "Black", "Blush"],
  beige: ["Gold", "Cream", "Brown", "Terracotta"],
  nude: ["Rose Gold", "Cream", "Dusty Pink"],
  brown: ["Gold", "Beige", "Cream", "Olive"],
  navy: ["Silver", "White", "Camel", "Blush"],
  blue: ["Silver", "White", "Pearl", "Denim"],
  "light-blue": ["White", "Silver", "Mint", "Peach"],
  teal: ["Silver", "Gold", "Cream", "Burgundy"],
  turquoise: ["White", "Silver", "Coral", "Gold"],
  green: ["Gold", "Beige", "Brown", "Cream"],
  olive: ["Gold", "Beige", "Cream", "Rust"],
  emerald: ["Gold", "Ivory", "Maroon", "Nude"],
  red: ["Gold", "Black", "Nude", "Cream"],
  maroon: ["Gold", "Ivory", "Nude", "Muted Pink"],
  pink: ["Rose Gold", "Pearl", "White", "Blush"],
  rose: ["Rose Gold", "Pearl", "Ivory", "Grey"],
  purple: ["Silver", "White", "Lavender", "Grey"],
  lavender: ["Silver", "Rose Gold", "White", "Periwinkle"],
  yellow: ["Brown", "White", "Gold", "Navy"],
  gold: ["Gold", "Black", "White", "Maroon"],
  silver: ["Silver", "Black", "White", "Grey"],
  orange: ["White", "Gold", "Teal", "Brown"],
  peach: ["White", "Rose Gold", "Gold", "Ivory"],
  multicolor: ["Gold", "White", "Black", "Nude"],
  other: ["White", "Black", "Gold", "Silver"],
};

export function metalToneFor(color: string): string {
  const tones = METAL_TONES[color.toLowerCase()] ?? METAL_TONES.other;
  return tones[0];
}

function matchesAny(value: string | null | undefined, candidates: string[]): boolean {
  if (!value) return false;
  const v = value.toLowerCase();
  return candidates.some((c) => v.includes(c.toLowerCase()) || c.toLowerCase().includes(v));
}

// =============================================================
// Curated fallback catalog (used when DB is empty/unreachable)
// =============================================================

interface CuratedItem {
  name: string;
  category: string;
  itemType: string;
  style?: string;
  occasion?: string;
  description?: string;
}

const CURATED_JEWELRY: CuratedItem[] = [
  { name: "Silver Pendant", category: "necklace", itemType: "pendant", style: "minimal", occasion: "casual", description: "A delicate silver pendant that suits almost every neckline." },
  { name: "Gold Pendant", category: "necklace", itemType: "pendant", style: "elegant", occasion: "work", description: "A subtle gold pendant for a polished everyday look." },
  { name: "Pearl Choker", category: "necklace", itemType: "choker", style: "elegant", occasion: "date", description: "Classic pearls that instantly elevate a simple dress." },
  { name: "Chunky Gold Chain", category: "necklace", itemType: "statement", style: "streetwear", occasion: "party", description: "A bold chain for a street-style statement." },
  { name: "Layered Gold Necklace", category: "necklace", itemType: "layered", style: "chic", occasion: "party", description: "Layers of fine gold chains for a chic, modern look." },
  { name: "Statement Necklace", category: "necklace", itemType: "statement", style: "party", occasion: "party", description: "Bold and eye-catching — the anchor of a glamorous outfit." },
  { name: "Kundan Statement Necklace", category: "necklace", itemType: "statement", style: "traditional", occasion: "wedding", description: "Kundan set-piece for traditional occasions." },
  { name: "Mangalsutra-style Gold Necklace", category: "necklace", itemType: "mangalsutra", style: "traditional", occasion: "festival", description: "Elegant gold for a classic Indian look." },
  { name: "Silver Studs", category: "earrings", itemType: "studs", style: "minimal", occasion: "casual", description: "Tiny silver studs for everyday minimal styling." },
  { name: "Gold Hoops", category: "earrings", itemType: "hoops", style: "chic", occasion: "casual", description: "Medium gold hoops — a timeless everyday staple." },
  { name: "Pearl Studs", category: "earrings", itemType: "studs", style: "elegant", occasion: "date", description: "Soft pearl studs for an elegant finish." },
  { name: "Jhumkas", category: "earrings", itemType: "jhumkas", style: "traditional", occasion: "festival", description: "Traditional jhumkas that complete any ethnic look." },
  { name: "Chandbali Earrings", category: "earrings", itemType: "chandbali", style: "traditional", occasion: "wedding", description: "Half-moon chandbalis for weddings and celebrations." },
  { name: "Statement Drop Earrings", category: "earrings", itemType: "statement", style: "party", occasion: "party", description: "Bold drops that make the outfit sing." },
  { name: "Rose Gold Hoops", category: "earrings", itemType: "hoops", style: "minimal", occasion: "casual", description: "Warm rose-gold hoops for soft, feminine styling." },
  { name: "Silver Bracelet", category: "bracelet", itemType: "bracelet", style: "minimal", occasion: "casual", description: "A sleek silver bracelet for clean lines." },
  { name: "Gold Bracelet", category: "bracelet", itemType: "bracelet", style: "elegant", occasion: "work", description: "Understated gold for a polished wrist." },
  { name: "Kundan Bangles", category: "bangles", itemType: "bangles", style: "traditional", occasion: "festival", description: "Stack of kundan bangles for a festive vibe." },
  { name: "Gold Bangles", category: "bangles", itemType: "bangles", style: "traditional", occasion: "wedding", description: "Classic gold bangles for weddings and parties." },
  { name: "Minimal Ring Set", category: "ring", itemType: "ring", style: "minimal", occasion: "casual", description: "Thin stacking rings for everyday shine." },
  { name: "Statement Ring", category: "ring", itemType: "ring", style: "party", occasion: "party", description: "One bold ring as a party conversation piece." },
  { name: "Silver Anklet", category: "anklet", itemType: "anklet", style: "casual", occasion: "vacation", description: "A dainty anklet for relaxed, sunny days." },
];

const CURATED_FOOTWEAR: CuratedItem[] = [
  { name: "Classic White Sneakers", category: "footwear", itemType: "sneakers", style: "casual", occasion: "casual", description: "The clean, versatile sneaker that goes with everything." },
  { name: "Black Heels", category: "footwear", itemType: "heels", style: "elegant", occasion: "party", description: "Stiletto black heels — instant sophistication." },
  { name: "Nude Pumps", category: "footwear", itemType: "heels", style: "formal", occasion: "office", description: "Nude pumps that elongate the leg for workwear." },
  { name: "Chunky Sneakers", category: "footwear", itemType: "sneakers", style: "streetwear", occasion: "casual", description: "Bold chunky sneakers for a street-style finish." },
  { name: "Ballet Flats", category: "footwear", itemType: "flats", style: "minimal", occasion: "casual", description: "Comfortable flats for effortless days." },
  { name: "Ankle Boots", category: "footwear", itemType: "boots", style: "chic", occasion: "evening", description: "Edgy ankle boots for cooler evenings." },
  { name: "Strap Sandals", category: "footwear", itemType: "sandals", style: "casual", occasion: "vacation", description: "Strappy sandals for breezy vacation looks." },
  { name: "Silver Strappy Heels", category: "footwear", itemType: "heels", style: "party", occasion: "party", description: "Metallic heels that catch the light." },
  { name: "Loafers", category: "footwear", itemType: "loafers", style: "formal", occasion: "office", description: "Polished loafers for a smart-casual balance." },
  { name: "Golden Juttis", category: "footwear", itemType: "juttis", style: "traditional", occasion: "festival", description: "Hand-embroidered juttis for ethnic outfits." },
  { name: "Kolhapuris", category: "footwear", itemType: "kolhapuris", style: "traditional", occasion: "casual", description: "Leather kolhapuris for relaxed ethnic styling." },
  { name: "Wedges", category: "footwear", itemType: "wedges", style: "casual", occasion: "vacation", description: "Comfortable wedges with summery polish." },
  { name: "Strappy White Heels", category: "footwear", itemType: "heels", style: "elegant", occasion: "wedding", description: "Elegant strappy heels for special days." },
];

const CURATED_BAGS: CuratedItem[] = [
  { name: "Black Mini Bag", category: "bag", itemType: "handbag", style: "chic", occasion: "party", description: "A compact black bag that pairs with everything." },
  { name: "Silver Clutch", category: "bag", itemType: "clutch", style: "party", occasion: "party", description: "Metallic clutch for evening glam." },
  { name: "Tan Leather Tote", category: "bag", itemType: "tote", style: "formal", occasion: "office", description: "A roomy tote for workdays." },
  { name: "Crossbody Sling", category: "bag", itemType: "sling", style: "casual", occasion: "casual", description: "Hands-free sling for everyday errands." },
  { name: "Canvas Tote", category: "bag", itemType: "tote", style: "casual", occasion: "vacation", description: "Relaxed canvas tote for casual days." },
  { name: "Embroidered Potli", category: "bag", itemType: "handbag", style: "traditional", occasion: "wedding", description: "Traditional potli bag for festive outfits." },
  { name: "White Structured Bag", category: "bag", itemType: "handbag", style: "elegant", occasion: "date", description: "Clean structured bag for polished looks." },
  { name: "Beige Sling", category: "bag", itemType: "sling", style: "minimal", occasion: "casual", description: "Neutral sling for minimal outfits." },
];

const CURATED_ACCESSORIES: CuratedItem[] = [
  { name: "Cat-Eye Sunglasses", category: "accessories", itemType: "sunglasses", style: "chic", occasion: "casual", description: "Retro cat-eye shades for instant polish." },
  { name: "Aviator Sunglasses", category: "accessories", itemType: "sunglasses", style: "casual", occasion: "vacation", description: "Classic aviators for sunny days." },
  { name: "Gold Watch", category: "accessories", itemType: "watch", style: "elegant", occasion: "office", description: "A refined gold watch." },
  { name: "Minimal Leather Belt", category: "accessories", itemType: "belt", style: "minimal", occasion: "work", description: "A slim belt that finishes tailored fits." },
  { name: "Silk Scarf", category: "accessories", itemType: "scarf", style: "elegant", occasion: "evening", description: "A silk scarf worn around the neck or bag." },
  { name: "Wide Brim Hat", category: "accessories", itemType: "hat", style: "casual", occasion: "vacation", description: "A sun hat for a vacation-ready silhouette." },
  { name: "Statement Belt", category: "accessories", itemType: "belt", style: "streetwear", occasion: "casual", description: "A chunky belt to define street-style looks." },
];

// =============================================================
// Hairstyle & makeup rules (curated, DB-extensible)
// =============================================================

const HAIRSTYLES: Record<string, { name: string; description: string }[]> = {
  casual: [
    { name: "Low Messy Bun", description: "Effortless low bun with face-framing strands." },
    { name: "Beachy Waves", description: "Soft, lived-in waves that look natural." },
    { name: "Half-Up Half-Down", description: "Balanced style that works for day to night." },
  ],
  elegant: [
    { name: "Sleek Low Bun", description: "A polished bun for a refined silhouette." },
    { name: "Soft Hollywood Waves", description: "Classic glam waves parted deep to one side." },
    { name: "Sleek Ponytail", description: "Sharp, high ponytail for a modern finish." },
  ],
  party: [
    { name: "Voluminous Curls", description: "Bouncy curls for a celebratory mood." },
    { name: "Sleek High Ponytail", description: "Drama and lift with a sleek, glossy tail." },
    { name: "Side-Swept Waves", description: "Red-carpet waves swept to one side." },
  ],
  traditional: [
    { name: "Braided Crown", description: "An elegant braid wrapped around the crown." },
    { name: "Low Braided Bun", description: "A classic bun with a thick braid detail." },
    { name: "Open Wavy Hair with Maang Tikka", description: "Loose waves paired with traditional hair jewels." },
  ],
  streetwear: [
    { name: "Sleek Straight Middle Part", description: "Glossy straight hair with a sharp middle part." },
    { name: "Half-Up Space Buns", description: "Playful space buns for an edgy street vibe." },
  ],
  minimal: [
    { name: "Clean Straight Hair", description: "Silky, straight, and perfectly simple." },
    { name: "Tight Low Ponytail", description: "Streamlined ponytail for a minimal look." },
  ],
  chic: [
    { name: "Sleek Lob", description: "A chic, sharp lob with subtle bend." },
    { name: "Low Chignon", description: "A fashion-forward low chignon." },
  ],
  formal: [
    { name: "Low Sleek Bun", description: "Professional, neat, and timeless." },
    { name: "Elegant Blowout", description: "A soft, voluminous blowout." },
  ],
  sporty: [
    { name: "High Ponytail", description: "Active and fresh with a high ponytail." },
    { name: "Fishtail Braid", description: "A neat braid that stays put all day." },
  ],
  "indo-western": [
    { name: "Textured Open Waves", description: "Modern waves that blend east and west." },
    { name: "Sleek Bun with Earrings Showcase", description: "An updo that lets statement earrings shine." },
  ],
};

const MAKEUP: Record<string, { name: string; description: string }[]> = {
  casual: [
    { name: "Glowy No-Makeup Look", description: "Tinted moisturizer, brow gel, and a soft lip." },
    { name: "Dewy Skin + Tinted Lip", description: "Fresh, hydrated skin with a sheer lip tint." },
  ],
  elegant: [
    { name: "Soft Smoky + Nude Lip", description: "Defined eyes with a muted nude lip." },
    { name: "Winged Liner + Rosy Cheeks", description: "Classic winged liner with soft blush." },
  ],
  party: [
    { name: "Glam Smoky Eyes + Bold Lip", description: "Full-glam smokies with a statement lip." },
    { name: "Shimmer Eyes + Glossy Lip", description: "Sparkle on the lids with a high-shine lip." },
  ],
  traditional: [
    { name: "Kajal + Red Lip", description: "Timeless kajal-lined eyes with a classic red lip." },
    { name: "Bold Winged Eyes + Nude", description: "Dramatic winged eyeliner for an ethnic look." },
  ],
  streetwear: [
    { name: "Skin-First Glam", description: "Flawless base, groomed brows, soft contour." },
    { name: "Graphic Liner", description: "A minimal base with a graphic eyeliner twist." },
  ],
  minimal: [
    { name: "Skin Tint + Clear Gloss", description: "Barely-there makeup with a glassy lip." },
    { name: "Tinted Brows + Blush", description: "Polished but barely-there finish." },
  ],
  chic: [
    { name: "Bronzed Glow", description: "Sunkissed bronzer with a soft nude lip." },
    { name: "Glossy Eyeshadow", description: "Wet-look lids with a matte lip." },
  ],
  formal: [
    { name: "Neutral Matte Base", description: "Polished matte finish for the workplace." },
    { name: "Bold Lip, Simple Eyes", description: "One hero feature — a confident lip." },
  ],
  sporty: [
    { name: "Fresh Face + Waterproof Mascara", description: "Clean skin with smudge-proof eyes." },
    { name: "Cream Bronzer Glow", description: "Sculpted with cream products for a natural finish." },
  ],
  "indo-western": [
    { name: "Smoky Eyes + Nude Lip", description: "Modern glam that works for fusion wear." },
    { name: "Rosy Glow + Bold Lash", description: "Soft romantic eyes with a dewy base." },
  ],
};

const TIPS: Record<string, string[]> = {
  party: [
    "Keep one hero accessory — let the statement piece do the talking.",
    "Balance a bold lip with minimal jewelry.",
  ],
  wedding: [
    "Opt for heavier traditional jewelry and keep makeup long-wear.",
    "Pick comfortable footwear — you'll be on your feet for hours.",
  ],
  office: [
    "Keep jewelry minimal and workwear polished.",
    "A structured bag reads more professional than a casual sling.",
  ],
  casual: [
    "Tuck, roll, or tie details add instant polish to casual fits.",
    "Swap sneakers for loafers to dress a casual look up.",
  ],
  date: [
    "Soft, romantic details work best — pearls, rose gold, and waves.",
    "A small structured bag keeps the look refined.",
  ],
  vacation: [
    "Layer breathable fabrics and reach for statement sunglasses.",
    "Flat or wedge sandals keep you comfortable all day.",
  ],
  festival: [
    "Jhumkas, bangles and a potli bag complete festive dressing.",
    "Choose comfortable ethnic footwear like juttis.",
  ],
  traditional: [
    "Let the outfit's embroidery guide your jewelry choices.",
    "A low bun shows off statement earrings beautifully.",
  ],
  default: [
    "Match your metal tones (gold or silver) across jewelry and bag details.",
    "One neutral + one accent color keeps the look cohesive.",
  ],
};

// =============================================================
// Selection helpers
// =============================================================

function pick<T>(list: T[], count: number): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

interface Scored extends CuratedItem {
  score: number;
}

function scoreCandidates(candidates: CuratedItem[], ctx: { style: string; occasion: string; metals: string[] }): Scored[] {
  return candidates.map((c) => {
    let score = 1;
    if (c.style && c.style === ctx.style) score += 3;
    if (c.occasion && c.occasion === ctx.occasion) score += 3;
    if (c.style && ctx.style) {
      if (["streetwear", "sporty"].includes(ctx.style) && ["statement", "sneakers", "chunky"].includes(c.itemType)) score += 2;
      if (["elegant", "minimal", "formal"].includes(ctx.style) && ["minimal", "studs", "flats", "loafers", "pendant"].includes(c.itemType)) score += 1;
    }
    if (ctx.metals.some((m) => c.name.toLowerCase().includes(m.split("-")[0].toLowerCase()))) score += 2;
    return { ...c, score };
  });
}

async function loadCatalog(): Promise<{
  jewelry: CuratedItem[];
  accessories: CuratedItem[];
  footwear: CuratedItem[];
  bags: CuratedItem[];
}> {
  const result = { jewelry: [...CURATED_JEWELRY], accessories: [...CURATED_ACCESSORIES], footwear: [...CURATED_FOOTWEAR], bags: [...CURATED_BAGS] };

  try {
    const [jewelry, accessories] = await Promise.all([
      prisma.jewelry.findMany(),
      prisma.accessory.findMany(),
    ]);

    for (const j of jewelry) {
      result.jewelry.push({
        name: j.name,
        category: j.type,
        itemType: j.type,
        style: j.style ?? undefined,
        occasion: j.occasion ?? undefined,
        description: j.description ?? undefined,
      });
    }
    for (const a of accessories) {
      const type = a.type ?? "accessories";
      const base = {
        name: a.name,
        itemType: a.type ?? "accessories",
        style: a.style ?? undefined,
        occasion: a.occasion ?? undefined,
        description: a.description ?? undefined,
      };
      if (["handbag", "clutch", "tote", "sling"].includes(type)) {
        result.bags.push({ ...base, category: "bag" });
      } else if (["heels", "sneakers", "flats", "boots", "sandals", "loafers", "wedges", "juttis", "kolhapuris", "mules"].includes(type)) {
        result.footwear.push({ ...base, category: "footwear" });
      } else {
        result.accessories.push({ ...base, category: "accessories" });
      }
    }
  } catch {
    // DB unreachable — curated catalog is enough.
  }

  return result;
}

async function loadPalette(baseColors: string[]): Promise<{ colors: string[]; matched: boolean }> {
  const fallback: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(PALETTES)) fallback[k] = v;

  try {
    const rows = await prisma.colorMatch.findMany({
      where: { baseColor: { in: baseColors } },
      orderBy: { priority: "desc" },
    });
    if (rows.length > 0) {
      const byBase = new Map<string, string[]>();
      for (const row of rows) {
        const list = byBase.get(row.baseColor) ?? [];
        list.push(row.matchColor);
        byBase.set(row.baseColor, list);
      }
      const merged = new Set<string>();
      for (const base of baseColors) {
        const list = byBase.get(base) ?? fallback[base] ?? PALETTES.other;
        for (const c of list) merged.add(c);
      }
      return { colors: Array.from(merged).slice(0, 6), matched: true };
    }
  } catch {
    // fall through
  }

  const merged = new Set<string>();
  for (const base of baseColors) {
    for (const c of fallback[base] ?? PALETTES.other) merged.add(c);
  }
  return { colors: Array.from(merged).slice(0, 6), matched: false };
}

// =============================================================
// Main engine
// =============================================================

export async function generateStyling(input: StylingInput): Promise<StylingResult> {
  const items = input.wardrobeItems;
  const primary = items[0];

  const occasion = input.occasion ?? primary?.occasion ?? "casual";
  const style = input.style ?? primary?.style ?? "casual";
  const season = input.season ?? primary?.season ?? "all-season";
  const baseColors = [primary?.color, primary?.secondaryColor].filter(Boolean) as string[];
  const categories = items.map((i) => i.category);
  const metals = [...new Set(baseColors.flatMap((c) => METAL_TONES[c.toLowerCase()] ?? METAL_TONES.other))];
  const metalTone = input.userPreferences?.preferredColorPalette
    ? (METAL_TONES[input.userPreferences.preferredColorPalette.toLowerCase()] ?? metals)[0]
    : (metals[0] ?? "gold");

  const ctx = { style, occasion, metals };
  const catalog = await loadCatalog();
  const palette = await loadPalette(baseColors.length ? baseColors : ["black"]);

  const scoredJewelry = scoreCandidates(catalog.jewelry, ctx).sort((a, b) => b.score - a.score);
  const scoredFootwear = scoreCandidates(catalog.footwear, ctx).sort((a, b) => b.score - a.score);
  const scoredBags = scoreCandidates(catalog.bags, ctx).sort((a, b) => b.score - a.score);
  const scoredAccessories = scoreCandidates(catalog.accessories, ctx).sort((a, b) => b.score - a.score);

  // Traditional / ethnic overrides
  const isTraditional = ["traditional", "indo-western"].includes(style) || ["saree", "lehenga", "kurti"].some((c) => categories.includes(c));
  const isParty = occasion === "party" || style === "party";
  const isCasual = occasion === "casual" || style === "casual" || style === "sporty" || style === "streetwear";

  let jewelry: RecommendationItem[];
  let footwear: RecommendationItem[];
  let bag: RecommendationItem[];
  let accessories: RecommendationItem[];

  if (isTraditional) {
    const picks = [
      ...pick(scoredJewelry.filter((j) => j.itemType === "jhumkas"), 1),
      ...pick(scoredJewelry.filter((j) => j.itemType === "bangles"), 1),
      ...pick(scoredJewelry.filter((j) => j.category === "necklace"), 1),
    ].filter(Boolean);
    jewelry = ensureCount(picks, scoredJewelry, 3).map(toRec);
    footwear = ensureCount(pick(scoredFootwear.filter((f) => ["juttis", "kolhapuris", "heels"].includes(f.itemType)), 2), scoredFootwear, 2).map(toRec);
    bag = ensureCount(pick(scoredBags.filter((b) => b.itemType === "handbag"), 1), scoredBags, 1).map(toRec);
    accessories = ensureCount(pick(scoredAccessories.filter((a) => a.itemType === "bangles"), 0), scoredAccessories, 2).map(toRec);
  } else if (isParty) {
    jewelry = ensureCount(
      [
        ...pick(scoredJewelry.filter((j) => j.itemType === "statement"), 1),
        ...pick(scoredJewelry.filter((j) => j.category === "necklace"), 1),
      ],
      scoredJewelry, 3,
    ).map(toRec);
    footwear = ensureCount(pick(scoredFootwear.filter((f) => ["heels", "boots"].includes(f.itemType)), 2), scoredFootwear, 2).map(toRec);
    bag = ensureCount(pick(scoredBags.filter((b) => b.itemType === "clutch"), 1), scoredBags, 1).map(toRec);
    accessories = ensureCount(pick(scoredAccessories.filter((a) => a.itemType === "sunglasses"), 1), scoredAccessories, 2).map(toRec);
  } else if (isCasual) {
    jewelry = ensureCount(pick(scoredJewelry.filter((j) => ["studs", "hoops"].includes(j.itemType)), 2), scoredJewelry, 2).map(toRec);
    footwear = ensureCount(pick(scoredFootwear.filter((f) => ["sneakers", "flats", "sandals", "loafers"].includes(f.itemType)), 2), scoredFootwear, 2).map(toRec);
    bag = ensureCount(pick(scoredBags.filter((b) => b.itemType === "sling"), 1), scoredBags, 1).map(toRec);
    accessories = ensureCount(pick(scoredAccessories.filter((a) => a.itemType === "sunglasses"), 1), scoredAccessories, 1).map(toRec);
  } else {
    // formal / elegant / office default
    jewelry = ensureCount(pick(scoredJewelry.filter((j) => ["pendant", "studs", "choker"].includes(j.itemType)), 2), scoredJewelry, 2).map(toRec);
    footwear = ensureCount(pick(scoredFootwear.filter((f) => ["heels", "loafers", "flats"].includes(f.itemType)), 2), scoredFootwear, 2).map(toRec);
    bag = ensureCount(pick(scoredBags.filter((b) => b.itemType === "tote"), 1), scoredBags, 1).map(toRec);
    accessories = ensureCount(pick(scoredAccessories.filter((a) => a.itemType === "watch"), 1), scoredAccessories, 1).map(toRec);
  }

  // Saree / lehenga specific jewelry nudges
  if (categories.includes("saree")) {
    const jhumkas = scoredJewelry.find((j) => j.itemType === "jhumkas");
    if (jhumkas && !jewelry.some((r) => r.itemType === "jhumkas")) {
      jewelry = [toRec(jhumkas), ...jewelry.slice(0, 2)];
    }
  }

  const hairstyleList = HAIRSTYLES[style] ?? HAIRSTYLES[occasion] ?? HAIRSTYLES.casual;
  const makeupList = MAKEUP[style] ?? MAKEUP[occasion] ?? MAKEUP.casual;

  const hairstyle = pick(hairstyleList, 1)[0];
  const makeup = pick(makeupList, 1)[0];

  const tips = [
    ...(TIPS[occasion] ?? []),
    ...(TIPS[style] ?? []),
    `Metal tone for this look: ${metalTone === "rose-gold" ? "rose gold" : metalTone}.`,
  ];
  const stylingTips = [...new Set(tips)].slice(0, 4);

  return {
    outfit: items.map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      imageUrl: i.imageUrl,
    })),
    jewelry,
    footwear,
    bag,
    accessories,
    hairstyle,
    makeup,
    colorPalette: palette.colors,
    stylingTips,
    metalTone,
  };
}

function ensureCount<T>(picked: T[], all: T[], count: number): T[] {
  const seen = new Set<T>();
  const result: T[] = [];
  for (const item of [...picked, ...all]) {
    if (result.length >= count) break;
    if (seen.has(item)) continue;
    seen.add(item);
    result.push(item);
  }
  return result;
}

function toRec(item: CuratedItem): RecommendationItem {
  return {
    id: "",
    name: item.name,
    category: item.category,
    itemType: item.itemType,
    description: item.description ?? null,
    imageUrl: null,
  };
}
