import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be 60 characters or fewer"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be 128 characters or fewer"),
  image: z.string().url().optional().or(z.literal("")),
  preferredStyle: z.string().optional().nullable(),
  preferredColorPalette: z.string().optional().nullable(),
});

export const imageUrlSchema = z
  .string()
  .refine(
    (value) => /^https?:\/\//.test(value) || value.startsWith("/"),
    "A valid image URL is required",
  );

export const wardrobeItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  imageUrl: imageUrlSchema,
  category: z.string().min(1, "Category is required"),
  color: z.string().min(1, "Color is required"),
  secondaryColor: z.string().optional().nullable(),
  pattern: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  occasion: z.string().optional().nullable(),
  season: z.string().optional().nullable(),
  style: z.string().optional().nullable(),
});

export const outfitSchema = z.object({
  name: z.string().min(1, "Outfit name is required").max(100),
  wardrobeItemIds: z
    .array(z.string().min(1))
    .min(1, "Select at least one clothing item"),
  occasion: z.string().optional().nullable(),
  style: z.string().optional().nullable(),
});

export const savedLookSchema = z.object({
  outfitId: z.string().min(1),
  name: z.string().min(1, "Look name is required").max(100),
  description: z.string().max(500, "Description must be 500 characters or fewer").optional().nullable(),
  lookData: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const updateSavedLookSchema = z.object({
  name: z.string().min(1, "Look name is required").max(100),
  description: z.string().max(500, "Description must be 500 characters or fewer").optional().nullable(),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60).optional(),
  image: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
  bodyPhotoUrl: z.string().optional().or(z.literal("")).or(z.null()),
  gender: z.string().optional().nullable(),
  preferredStyle: z.string().optional().nullable(),
  preferredColorPalette: z.string().optional().nullable(),
});

export const favoriteSchema = z.object({
  targetType: z.enum(["savedLook", "trend", "wardrobeItem"]),
  targetId: z.string().min(1),
});

export const stylingInputSchema = z.object({
  wardrobeItemIds: z.array(z.string().min(1)).min(1, "Select at least one clothing item"),
  occasion: z.string().optional().nullable(),
  season: z.string().optional().nullable(),
  style: z.string().optional().nullable(),
  neckline: z.string().optional().nullable(),
});

export const remixInputSchema = z.object({
  heroId: z.string().min(1, "Choose a piece to style"),
  mood: z.enum(["everyday", "work", "weekend", "night"]),
});

export const packingInputSchema = z.object({
  destination: z.string().max(80, "Keep the destination short").optional().nullable(),
  days: z.coerce.number().int().min(1, "Trips need at least 1 day").max(30, "Keep it under 30 days"),
  vibe: z.enum(["beach", "city", "mountains", "desert", "festival", "formal"]),
  season: z.string().default("auto"),
});

export const jewelryInputSchema = z.object({
  itemId: z.string().optional().nullable(),
  occasion: z.string().optional().nullable(),
  season: z.string().optional().nullable(),
  style: z.string().optional().nullable(),
  neckline: z.string().optional().nullable(),
});

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date");

export const outfitPlanSchema = z.object({
  outfitId: z.string().min(1, "Choose an outfit"),
  date: dateStringSchema,
  note: z.string().max(200, "Keep the note under 200 characters").optional().nullable(),
});

export const wearLogSchema = z.object({
  itemIds: z.array(z.string().min(1)).min(1, "Select at least one item"),
  note: z.string().max(200).optional().nullable(),
});

export const careLogSchema = z.object({
  wardrobeItemId: z.string().min(1),
  careType: z.enum(["wash", "dry-clean", "iron", "repair", "other"]),
  note: z.string().max(200).optional().nullable(),
});

export const itemCareSchema = z.object({
  wardrobeItemId: z.string().min(1),
  purchasePrice: z.coerce.number().min(0, "Price cannot be negative").max(1000000).optional().nullable(),
  careInstructions: z.string().max(300, "Keep care notes under 300 characters").optional().nullable(),
  careIntervalDays: z.coerce
    .number()
    .int()
    .min(1, "Use at least 1 day")
    .max(365, "Use at most 365 days")
    .default(30),
});

export const wishlistItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  category: z.string().optional().nullable(),
  estimatedPrice: z.coerce.number().min(0, "Price cannot be negative").max(1000000).optional().nullable(),
  priority: z.enum(["essential", "nice-to-have", "dream"]),
  link: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  imageUrl: imageUrlSchema.optional().or(z.literal("")),
  note: z.string().max(300, "Keep notes under 300 characters").optional().nullable(),
});

export const budgetSchema = z.object({
  monthlyLimit: z.coerce.number().min(0, "Budget cannot be negative").max(1000000),
});

export const lookCommentSchema = z.object({
  savedLookId: z.string().min(1),
  body: z.string().min(1, "Write a comment first").max(500, "Keep comments under 500 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type WardrobeItemInput = z.infer<typeof wardrobeItemSchema>;
export type OutfitInput = z.infer<typeof outfitSchema>;
export type SavedLookInput = z.infer<typeof savedLookSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type FavoriteInput = z.infer<typeof favoriteSchema>;
export type StylingInput = z.infer<typeof stylingInputSchema>;
export type OutfitPlanInput = z.infer<typeof outfitPlanSchema>;
export type WearLogInput = z.infer<typeof wearLogSchema>;
export type CareLogInput = z.infer<typeof careLogSchema>;
export type ItemCareInput = z.infer<typeof itemCareSchema>;
export type WishlistItemInput = z.infer<typeof wishlistItemSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type LookCommentInput = z.infer<typeof lookCommentSchema>;
