// =============================================================
// Shared domain types & enums
// =============================================================

export type ClothingCategory =
  | "dress"
  | "top"
  | "shirt"
  | "tshirt"
  | "jeans"
  | "pants"
  | "skirt"
  | "saree"
  | "kurti"
  | "lehenga"
  | "jacket"
  | "blazer"
  | "shorts"
  | "other";

export type StyleType =
  | "casual"
  | "formal"
  | "party"
  | "traditional"
  | "streetwear"
  | "minimal"
  | "elegant"
  | "chic"
  | "sporty"
  | "indo-western";

export type OccasionType =
  | "casual"
  | "work"
  | "party"
  | "wedding"
  | "date"
  | "college"
  | "office"
  | "vacation"
  | "festival"
  | "evening"
  | "other";

export type SeasonType = "summer" | "winter" | "spring" | "monsoon" | "all-season";

export type ColorName =
  | "black"
  | "white"
  | "grey"
  | "beige"
  | "nude"
  | "brown"
  | "navy"
  | "blue"
  | "light-blue"
  | "teal"
  | "green"
  | "olive"
  | "emerald"
  | "red"
  | "maroon"
  | "pink"
  | "rose"
  | "purple"
  | "lavender"
  | "yellow"
  | "gold"
  | "silver"
  | "orange"
  | "peach"
  | "turquoise"
  | "multicolor"
  | "other";

export type PatternType =
  | "solid"
  | "stripes"
  | "checks"
  | "floral"
  | "polka"
  | "plaid"
  | "printed"
  | "abstract"
  | "embroidery"
  | "sequins"
  | "geometric"
  | "other";

export type MaterialType =
  | "cotton"
  | "linen"
  | "silk"
  | "satin"
  | "denim"
  | "wool"
  | "polyester"
  | "chiffon"
  | "velvet"
  | "leather"
  | "jersey"
  | "lace"
  | "other";

export type NecklineType =
  | "round"
  | "v-neck"
  | "sweetheart"
  | "boat"
  | "halter"
  | "off-shoulder"
  | "high"
  | "square"
  | "keyhole"
  | "one-shoulder"
  | "collar";

export type JewelryCategory =
  | "earrings"
  | "necklace"
  | "bracelet"
  | "ring"
  | "bangles"
  | "anklet";

export type EarringType =
  | "studs"
  | "hoops"
  | "jhumkas"
  | "chandbali"
  | "statement"
  | "drops"
  | "huggies"
  | "danglers";

export type NecklaceTypeName =
  | "pendant"
  | "choker"
  | "layered"
  | "statement"
  | "mangalsutra"
  | "chains"
  | "pearl";

export type FootwearType =
  | "heels"
  | "sneakers"
  | "flats"
  | "boots"
  | "sandals"
  | "loafers"
  | "wedges"
  | "juttis"
  | "kolhapuris"
  | "mules";

export type AccessoryType =
  | "handbag"
  | "sunglasses"
  | "watch"
  | "belt"
  | "scarf"
  | "clutch"
  | "tote"
  | "sling"
  | "hat";

// =============================================================
// Recommendation engine types
// =============================================================

export interface RecommendationItem {
  id: string;
  name: string;
  category: string;
  itemType: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface HairstyleRec {
  name: string;
  description?: string;
}

export interface MakeupRec {
  name: string;
  description?: string;
}

export interface StylingResult {
  outfit: {
    id: string;
    name: string;
    category?: string | null;
    imageUrl?: string | null;
  }[];
  jewelry: RecommendationItem[];
  footwear: RecommendationItem[];
  bag: RecommendationItem[];
  accessories: RecommendationItem[];
  hairstyle: HairstyleRec;
  makeup: MakeupRec;
  colorPalette: string[];
  stylingTips: string[];
  metalTone: string;
}

export interface StylingInput {
  wardrobeItems: {
    id: string;
    name: string;
    category: string;
    color: string;
    secondaryColor?: string | null;
    pattern?: string | null;
    occasion?: string | null;
    season?: string | null;
    style?: string | null;
    imageUrl?: string | null;
  }[];
  occasion?: string | null;
  season?: string | null;
  style?: string | null;
  neckline?: string | null;
  userPreferences?: {
    preferredStyle?: string | null;
    preferredColorPalette?: string | null;
  } | null;
}

export type FavoriteTargetType = "savedLook" | "trend" | "wardrobeItem";
