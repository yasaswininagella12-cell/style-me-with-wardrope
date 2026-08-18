import type {
  AccessoryType,
  ClothingCategory,
  ColorName,
  EarringType,
  FootwearType,
  GenderType,
  JewelryCategory,
  MaterialType,
  NecklineType,
  NecklaceTypeName,
  OccasionType,
  PatternType,
  SeasonType,
  StyleType,
} from "@/types";

export const GENDERS: { value: GenderType; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non-binary", label: "Non-binary" },
];

export const CATEGORIES: { value: ClothingCategory; label: string }[] = [
  { value: "dress", label: "Dress" },
  { value: "top", label: "Top" },
  { value: "shirt", label: "Shirt" },
  { value: "tshirt", label: "T-Shirt" },
  { value: "jeans", label: "Jeans" },
  { value: "pants", label: "Pants" },
  { value: "skirt", label: "Skirt" },
  { value: "saree", label: "Saree" },
  { value: "kurti", label: "Kurti" },
  { value: "lehenga", label: "Lehenga" },
  { value: "jacket", label: "Jacket" },
  { value: "blazer", label: "Blazer" },
  { value: "shorts", label: "Shorts" },
  { value: "other", label: "Other" },
];

export const STYLES: { value: StyleType; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "party", label: "Party" },
  { value: "traditional", label: "Traditional" },
  { value: "streetwear", label: "Streetwear" },
  { value: "minimal", label: "Minimal" },
  { value: "elegant", label: "Elegant" },
  { value: "chic", label: "Chic" },
  { value: "sporty", label: "Sporty" },
  { value: "indo-western", label: "Indo-Western" },
];

export const OCCASIONS: { value: OccasionType; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "work", label: "Work" },
  { value: "office", label: "Office" },
  { value: "party", label: "Party" },
  { value: "wedding", label: "Wedding" },
  { value: "date", label: "Date Night" },
  { value: "college", label: "College" },
  { value: "vacation", label: "Vacation" },
  { value: "festival", label: "Festival" },
  { value: "evening", label: "Evening" },
  { value: "other", label: "Other" },
];

export const SEASONS: { value: SeasonType; label: string }[] = [
  { value: "all-season", label: "All Season" },
  { value: "summer", label: "Summer" },
  { value: "winter", label: "Winter" },
  { value: "spring", label: "Spring" },
  { value: "monsoon", label: "Monsoon" },
];

export const COLORS: { value: ColorName; label: string; hex: string }[] = [
  { value: "black", label: "Black", hex: "#111111" },
  { value: "white", label: "White", hex: "#ffffff" },
  { value: "grey", label: "Grey", hex: "#8d8d8d" },
  { value: "beige", label: "Beige", hex: "#e8dcc8" },
  { value: "nude", label: "Nude", hex: "#e0b9a3" },
  { value: "brown", label: "Brown", hex: "#7a4f2e" },
  { value: "navy", label: "Navy", hex: "#1b2a4a" },
  { value: "blue", label: "Blue", hex: "#2f6fba" },
  { value: "light-blue", label: "Light Blue", hex: "#9ec4e8" },
  { value: "teal", label: "Teal", hex: "#1f8a8c" },
  { value: "green", label: "Green", hex: "#3a7d44" },
  { value: "olive", label: "Olive", hex: "#7d7d3a" },
  { value: "emerald", label: "Emerald", hex: "#11857a" },
  { value: "red", label: "Red", hex: "#c0352c" },
  { value: "maroon", label: "Maroon", hex: "#6e2b3a" },
  { value: "pink", label: "Pink", hex: "#e89bb8" },
  { value: "rose", label: "Rose", hex: "#d76b7f" },
  { value: "purple", label: "Purple", hex: "#7446a0" },
  { value: "lavender", label: "Lavender", hex: "#b9a6d8" },
  { value: "yellow", label: "Yellow", hex: "#e8c13c" },
  { value: "gold", label: "Gold", hex: "#d9a75c" },
  { value: "silver", label: "Silver", hex: "#c0c4cd" },
  { value: "orange", label: "Orange", hex: "#e8823c" },
  { value: "peach", label: "Peach", hex: "#f5c6a5" },
  { value: "turquoise", label: "Turquoise", hex: "#41bfb0" },
  { value: "multicolor", label: "Multicolor", hex: "linear-gradient(90deg,#e8823c,#e8c13c,#3a7d44,#2f6fba,#7446a0)" },
  { value: "other", label: "Other", hex: "#b8b8b8" },
];

export const PATTERNS: { value: PatternType; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "stripes", label: "Stripes" },
  { value: "checks", label: "Checks" },
  { value: "floral", label: "Floral" },
  { value: "polka", label: "Polka Dots" },
  { value: "plaid", label: "Plaid" },
  { value: "printed", label: "Printed" },
  { value: "abstract", label: "Abstract" },
  { value: "embroidery", label: "Embroidery" },
  { value: "sequins", label: "Sequins" },
  { value: "geometric", label: "Geometric" },
  { value: "other", label: "Other" },
];

export const MATERIALS: { value: MaterialType; label: string }[] = [
  { value: "cotton", label: "Cotton" },
  { value: "linen", label: "Linen" },
  { value: "silk", label: "Silk" },
  { value: "satin", label: "Satin" },
  { value: "denim", label: "Denim" },
  { value: "wool", label: "Wool" },
  { value: "polyester", label: "Polyester" },
  { value: "chiffon", label: "Chiffon" },
  { value: "velvet", label: "Velvet" },
  { value: "leather", label: "Leather" },
  { value: "jersey", label: "Jersey" },
  { value: "lace", label: "Lace" },
  { value: "other", label: "Other" },
];

export const NECKLINES: { value: NecklineType; label: string }[] = [
  { value: "round", label: "Round" },
  { value: "v-neck", label: "V-Neck" },
  { value: "sweetheart", label: "Sweetheart" },
  { value: "boat", label: "Boat Neck" },
  { value: "halter", label: "Halter" },
  { value: "off-shoulder", label: "Off-Shoulder" },
  { value: "high", label: "High Neck" },
  { value: "square", label: "Square" },
  { value: "keyhole", label: "Keyhole" },
  { value: "one-shoulder", label: "One-Shoulder" },
  { value: "collar", label: "Collar" },
];

export const JEWELRY_CATEGORIES: { value: JewelryCategory; label: string }[] = [
  { value: "earrings", label: "Earrings" },
  { value: "necklace", label: "Necklace" },
  { value: "bracelet", label: "Bracelet" },
  { value: "ring", label: "Ring" },
  { value: "bangles", label: "Bangles" },
  { value: "anklet", label: "Anklet" },
];

export const EARRING_TYPES: { value: EarringType; label: string }[] = [
  { value: "studs", label: "Studs" },
  { value: "hoops", label: "Hoops" },
  { value: "jhumkas", label: "Jhumkas" },
  { value: "chandbali", label: "Chandbali" },
  { value: "statement", label: "Statement" },
  { value: "drops", label: "Drop Earrings" },
  { value: "huggies", label: "Huggies" },
  { value: "danglers", label: "Danglers" },
];

export const NECKLACE_TYPES: { value: NecklaceTypeName; label: string }[] = [
  { value: "pendant", label: "Pendant" },
  { value: "choker", label: "Choker" },
  { value: "layered", label: "Layered Necklace" },
  { value: "statement", label: "Statement Necklace" },
  { value: "chains", label: "Chains" },
  { value: "pearl", label: "Pearls" },
  { value: "mangalsutra", label: "Mangalsutra" },
];

export const FOOTWEAR_TYPES: { value: FootwearType; label: string }[] = [
  { value: "heels", label: "Heels" },
  { value: "sneakers", label: "Sneakers" },
  { value: "flats", label: "Flats" },
  { value: "boots", label: "Boots" },
  { value: "sandals", label: "Sandals" },
  { value: "loafers", label: "Loafers" },
  { value: "wedges", label: "Wedges" },
  { value: "juttis", label: "Juttis" },
  { value: "kolhapuris", label: "Kolhapuris" },
  { value: "mules", label: "Mules" },
];

export const ACCESSORY_TYPES: { value: AccessoryType; label: string }[] = [
  { value: "handbag", label: "Handbag" },
  { value: "clutch", label: "Clutch" },
  { value: "tote", label: "Tote" },
  { value: "sling", label: "Sling Bag" },
  { value: "sunglasses", label: "Sunglasses" },
  { value: "watch", label: "Watch" },
  { value: "belt", label: "Belt" },
  { value: "scarf", label: "Scarf" },
  { value: "hat", label: "Hat" },
];

export const OPTION_LABELS: Record<string, string> = {};
for (const list of [CATEGORIES, STYLES, OCCASIONS, SEASONS, COLORS, PATTERNS, MATERIALS, NECKLINES]) {
  for (const item of list) {
    OPTION_LABELS[item.value] = item.label;
  }
}

export function optionLabel(value: string | null | undefined, fallback = "—"): string {
  if (!value) return fallback;
  return OPTION_LABELS[value] ?? value;
}

export function formatValue(value: string | null | undefined, fallback = "—"): string {
  if (!value) return fallback;
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
