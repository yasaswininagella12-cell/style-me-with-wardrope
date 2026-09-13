// A tiny 2D "flat fashion figure" used as the body photo in the demo try-on
// preview when the user has not uploaded their own photo. It is drawn as an
// inline SVG so there is no network request, and the figure (male / female /
// non-binary) follows the gender selection stored on the profile.

const SKIN = "#e7b48f";
const HAIR = "#3a2414";
const BASE = "#cbb99b";
const BASE_DARK = "#c2ad8e";
const SHADOW = "#2b2118";

type FigureParams = {
  shoulders: number; // half-width at the shoulders
  waist: number; // half-width at the waist
  hips: number; // half-width at the hips
  bust: boolean; // add a subtle bust shape
  hairStyle: "long" | "short";
};

function figure({ shoulders, waist, hips, bust, hairStyle }: FigureParams): string {
  const ls = 300 - shoulders;
  const rs = 300 + shoulders;
  const lw = 300 - waist;
  const rw = 300 + waist;
  const lh = 300 - hips;
  const rh = 300 + hips;

  const torso = [
    `<path fill="${BASE}" d="M 296 150`,
    `C 296 162 ${ls + 6} 164 ${ls} 178`,
    `C ${ls + 2} 250 ${lw + 6} 300 ${lw + 6} 358`,
    `C ${lw + 8} 396 ${lh} 418 ${lh} 456`,
    `L ${rh} 456`,
    `C ${rh} 418 ${rw - 8} 396 ${rw - 6} 358`,
    `C ${rw - 6} 300 ${rs - 2} 250 ${rs} 178`,
    `C ${rs - 6} 164 304 162 304 150 Z"/>`,
  ].join(" ");

  const leftArm = [
    `M ${ls + 2} 182`,
    `C ${ls - 20} 245 ${ls - 26} 320 ${ls - 26} 430`,
    `C ${ls - 26} 468 ${ls - 18} 480 ${ls - 8} 480`,
    `C ${ls + 4} 480 ${ls + 12} 462 ${ls + 12} 432`,
    `C ${ls + 14} 330 ${ls + 20} 250 ${ls + 26} 192 Z`,
  ].join(" ");

  const hairBack =
    hairStyle === "long"
      ? `<path fill="${HAIR}" d="M 252 88 C 232 160 230 240 228 300 C 228 318 244 318 246 300 C 248 240 252 160 266 100 Z"/>` +
        `<path fill="${HAIR}" d="M 348 88 C 368 160 370 240 372 300 C 372 318 356 318 354 300 C 352 240 348 160 334 100 Z"/>` +
        `<path fill="${HAIR}" d="M 300 46 C 248 46 246 86 250 116 C 254 150 286 158 300 158 C 314 158 346 150 350 116 C 354 86 352 46 300 46 Z"/>`
      : `<path fill="${HAIR}" d="M 300 46 C 250 46 248 84 252 114 C 254 142 280 148 300 148 C 320 148 346 142 348 114 C 352 84 350 46 300 46 Z"/>`;

  const hairCap =
    hairStyle === "long"
      ? "M 262 70 C 262 34 338 34 338 70 Q 338 90 300 90 Q 262 90 262 70 Z"
      : "M 260 72 C 260 32 340 32 340 72 Q 340 88 300 88 Q 260 88 260 72 Z";

  const bustShape = bust
    ? `<ellipse cx="274" cy="264" rx="29" ry="26" fill="${BASE_DARK}"/>` +
      `<ellipse cx="326" cy="264" rx="29" ry="26" fill="${BASE_DARK}"/>`
    : "";

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">`,
    `<ellipse cx="300" cy="754" rx="112" ry="12" fill="${SHADOW}" opacity="0.08"/>`,
    hairBack,
    `<ellipse cx="300" cy="100" rx="40" ry="48" fill="${SKIN}"/>`,
    `<rect x="286" y="142" width="28" height="26" rx="8" fill="${SKIN}"/>`,
    torso,
    bustShape,
    `<path fill="${SKIN}" d="${leftArm}"/>`,
    `<path fill="${SKIN}" d="${leftArm}" transform="translate(600 0) scale(-1 1)"/>`,
    `<rect x="258" y="450" width="40" height="272" rx="18" fill="${BASE}"/>`,
    `<rect x="302" y="450" width="40" height="272" rx="18" fill="${BASE}"/>`,
    `<ellipse cx="278" cy="728" rx="25" ry="11" fill="${SKIN}"/>`,
    `<ellipse cx="322" cy="728" rx="25" ry="11" fill="${SKIN}"/>`,
    `<path fill="${HAIR}" d="${hairCap}"/>`,
    `<circle cx="277" cy="102" r="3.6" fill="${HAIR}"/>`,
    `<circle cx="323" cy="102" r="3.6" fill="${HAIR}"/>`,
    `<path d="M 291 124 Q 300 130 309 124" stroke="${HAIR}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    `</svg>`,
  ].join("");
}

const PROFILE_FIGURES: Record<string, FigureParams> = {
  female: { shoulders: 80, waist: 50, hips: 66, bust: true, hairStyle: "long" },
  male: { shoulders: 94, waist: 62, hips: 58, bust: false, hairStyle: "short" },
  "non-binary": { shoulders: 84, waist: 54, hips: 60, bust: false, hairStyle: "short" },
};

// Returns a data-URI of a flat 2D fashion figure matching the gender stored on
// the user's profile. Falls back to an androgynous figure when unknown.
export function demoModelImage(gender?: string | null): string {
  const params = PROFILE_FIGURES[gender ?? ""] ?? PROFILE_FIGURES["non-binary"];
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(figure(params))}`;
}

// Display label used in the demo preview copy.
export function demoGenderLabel(gender?: string | null): string {
  if (gender === "male") return "male";
  if (gender === "female") return "female";
  return "non-binary";
}