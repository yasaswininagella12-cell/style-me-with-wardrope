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

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type WardrobeItemInput = z.infer<typeof wardrobeItemSchema>;
export type OutfitInput = z.infer<typeof outfitSchema>;
export type SavedLookInput = z.infer<typeof savedLookSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type FavoriteInput = z.infer<typeof favoriteSchema>;
export type StylingInput = z.infer<typeof stylingInputSchema>;
