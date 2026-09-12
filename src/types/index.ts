// =============================================================
// Shared domain types & enums
// =============================================================

export type GenderType = "male" | "female" | "non-binary";

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

// =============================================================
// Style Report / wardrobe analytics
// =============================================================

export interface AnalysisBucket {
  label: string;
  count: number;
}

export interface ColorBucket {
  label: string;
  hex: string;
  count: number;
}

export interface CoverageCheck {
  id: string;
  label: string;
  hint: string;
  present: boolean;
  count: number;
}

export interface StyleReport {
  totalItems: number;
  distinctColors: number;
  totalCategories: number;
  byCategory: AnalysisBucket[];
  byColor: ColorBucket[];
  byOccasion: AnalysisBucket[];
  bySeason: AnalysisBucket[];
  byStyle: AnalysisBucket[];
  byMaterial: AnalysisBucket[];
  coverage: CoverageCheck[];
  strengths: string[];
  gaps: string[];
  mostVersatileColor: ColorBucket;
  versatilityScore: number;
  versatilityLabel: string;
  summary: string;
}

// =============================================================
// One piece, many looks (remix)
// =============================================================

export interface RemixComboItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

export interface RemixCombo {
  tab: string;
  occasion: string;
  style: string;
  items: RemixComboItem[];
  lookId: string;
  look: StylingResult;
}

export type RemixMood = "everyday" | "work" | "weekend" | "night";

export interface RemixPlan {
  hero: RemixComboItem;
  combos: RemixCombo[];
}

// =============================================================
// Trip packing / capsule planner
// =============================================================

export interface TripPackingItem {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
}

export interface TripChecklistGroup {
  group: string;
  note: string;
  items: TripPackingItem[];
}

export interface TripDayPlan {
  day: number;
  name: string;
  occasion: string;
  itemIds: string[];
}

export interface TripSampleLook {
  id: string;
  name: string;
  occasion: string;
  lookUrl: string;
  look: StylingResult;
}

export interface TripPlan {
  destination: string;
  days: number;
  vibe: string;
  season: string;
  capsule: TripPackingItem[];
  checklist: TripChecklistGroup[];
  dayPlans: TripDayPlan[];
  sampleLooks: TripSampleLook[];
  tip: string;
}
