// A self-contained flat 2D "refer a friend" promo card drawn as inline SVG
// (no network requests). It matches the flat fashion-figure style used by the
// demo try-on preview (src/lib/demo-model.ts): two figures pass a gift between
// them on an ivory card with gold accents.

const IVORY = "#fdfbf7";
const ESPRESSO = "#2b2118";
const GOLD = "#d4af37";
const GOLD_DARK = "#b08d3e";
const LINE = "#e8dcc2";
const MUTED = "#6b5b3f";
const SKIN = "#e7b48f";
const SPARKLE = "#e0b24a";
const DOT = "#e3cf9a";

const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

const SHOULDER = 86;
const WAIST = 54;
const HIPS = 64;

type Figure = {
  cx: number; // world x of the figure center
  s: number; // scale
  headTop: number; // world y of the top of the head
  top: string;
  topDark: string;
  pants: string;
  shoe: string;
  hair: string;
  long: boolean;
  bust: boolean;
  arm: "left" | "right"; // side the extended arm points to (toward the gift)
};

function figureBody(f: Figure): string {
  const { top, topDark, pants, shoe, hair, long, bust } = f;
  const ls = 300 - SHOULDER;
  const rs = 300 + SHOULDER;
  const lw = 300 - WAIST;
  const rw = 300 + WAIST;
  const lh = 300 - HIPS;
  const rh = 300 + HIPS;

  const torso = `M 296 150 C 296 162 ${ls + 6} 164 ${ls} 178 C ${ls + 2} 250 ${lw + 6} 300 ${lw + 6} 358 C ${lw + 8} 396 ${lh} 418 ${lh} 456 L ${rh} 456 C ${rh} 418 ${rw - 8} 396 ${rw - 6} 358 C ${rw - 6} 300 ${rs - 2} 250 ${rs} 178 C ${rs - 6} 164 304 162 304 150 Z`;

  const hairBack = long
    ? `<path fill="${hair}" d="M 252 88 C 232 160 230 240 228 300 C 228 318 244 318 246 300 C 248 240 252 160 266 100 Z"/>` +
      `<path fill="${hair}" d="M 348 88 C 368 160 370 240 372 300 C 372 318 356 318 354 300 C 352 240 348 160 334 100 Z"/>` +
      `<path fill="${hair}" d="M 300 46 C 248 46 246 86 250 116 C 254 150 286 158 300 158 C 314 158 346 150 350 116 C 354 86 352 46 300 46 Z"/>`
    : `<path fill="${hair}" d="M 300 46 C 250 46 248 84 252 114 C 254 142 280 148 300 148 C 320 148 346 142 348 114 C 352 84 350 46 300 46 Z"/>`;

  const hairCap = long
    ? "M 262 70 C 262 34 338 34 338 70 Q 338 90 300 90 Q 262 90 262 70 Z"
    : "M 260 72 C 260 32 340 32 340 72 Q 340 88 300 88 Q 260 88 260 72 Z";

  const bustShape = bust
    ? `<ellipse cx="274" cy="264" rx="29" ry="26" fill="${topDark}"/>` +
      `<ellipse cx="326" cy="264" rx="29" ry="26" fill="${topDark}"/>`
    : "";

  return [
    `<ellipse cx="300" cy="754" rx="118" ry="12" fill="${ESPRESSO}" opacity="0.08"/>`,
    hairBack,
    `<ellipse cx="300" cy="100" rx="40" ry="48" fill="${SKIN}"/>`,
    `<rect x="286" y="142" width="28" height="26" rx="8" fill="${SKIN}"/>`,
    `<path fill="${top}" d="${torso}"/>`,
    bustShape,
    // relaxed arm on the outer side
    `<path fill="${SKIN}" d="M ${ls + 2} 182 C ${ls - 18} 240 ${ls - 24} 320 ${ls - 24} 430 C ${ls - 24} 468 ${ls - 16} 480 ${ls - 8} 480 C ${ls + 4} 480 ${ls + 12} 462 ${ls + 12} 432 C ${ls + 14} 330 ${ls + 20} 250 ${ls + 26} 192 Z"/>`,
    // arm extended toward the gift
    `<path d="M 388 192 C 438 208 500 206 546 204" fill="none" stroke="${SKIN}" stroke-width="38" stroke-linecap="round"/>`,
    `<circle cx="556" cy="204" r="19" fill="${SKIN}"/>`,
    `<rect x="258" y="450" width="40" height="272" rx="18" fill="${pants}"/>`,
    `<rect x="302" y="450" width="40" height="272" rx="18" fill="${pants}"/>`,
    `<ellipse cx="278" cy="728" rx="25" ry="11" fill="${shoe}"/>`,
    `<ellipse cx="322" cy="728" rx="25" ry="11" fill="${shoe}"/>`,
    `<path fill="${hair}" d="${hairCap}"/>`,
    `<circle cx="277" cy="102" r="3.6" fill="${hair}"/>`,
    `<circle cx="323" cy="102" r="3.6" fill="${hair}"/>`,
    `<path d="M 291 124 Q 300 130 309 124" stroke="${hair}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  ].join("");
}

function figure(f: Figure): string {
  const ty = f.headTop - 46 * f.s;
  const tx = f.arm === "right" ? f.cx - 300 * f.s : 600 - f.cx - 300 * f.s;
  const inner = `<g transform="translate(${tx} ${ty}) scale(${f.s})">${figureBody(f)}</g>`;
  return f.arm === "right"
    ? inner
    : `<g transform="translate(600 0) scale(-1 1)">${inner}</g>`;
}

// Small four-point twinkle used as decoration around the gift.
function star(cx: number, cy: number, r: number): string {
  return `M ${cx} ${cy - r} Q ${cx} ${cy} ${cx + r} ${cy} Q ${cx} ${cy} ${cx} ${cy + r} Q ${cx} ${cy} ${cx - r} ${cy} Q ${cx} ${cy} ${cx} ${cy - r} Z`;
}

function giftBox(): string {
  const dots = [270, 284, 322, 336]
    .map((y) => `<circle cx="300" cy="${y}" r="2.4" fill="${ESPRESSO}" opacity="0.14"/>`)
    .join("");
  return [
    `<rect x="256" y="210" width="88" height="90" rx="8" fill="${GOLD}"/>`,
    dots,
    `<rect x="294" y="210" width="12" height="90" fill="${ESPRESSO}"/>`,
    `<rect x="256" y="246" width="88" height="12" fill="${ESPRESSO}"/>`,
    `<rect x="250" y="186" width="100" height="26" rx="7" fill="#e3c168"/>`,
    `<rect x="294" y="186" width="12" height="26" fill="${ESPRESSO}"/>`,
    `<ellipse cx="291" cy="180" rx="13" ry="9" fill="${ESPRESSO}" transform="rotate(-22 291 180)"/>`,
    `<ellipse cx="309" cy="180" rx="13" ry="9" fill="${ESPRESSO}" transform="rotate(22 309 180)"/>`,
    `<circle cx="300" cy="181" r="7" fill="${ESPRESSO}"/>`,
  ].join("");
}

function sparkles(): string {
  return [
    `<path fill="${SPARKLE}" d="${star(184, 240, 8)}"/>`,
    `<path fill="${SPARKLE}" d="${star(414, 234, 11)}"/>`,
    `<path fill="${SPARKLE}" d="${star(152, 340, 6)}"/>`,
    `<path fill="${SPARKLE}" d="${star(452, 320, 7)}"/>`,
    `<path fill="${SPARKLE}" d="${star(212, 468, 5)}"/>`,
    `<path fill="${SPARKLE}" d="${star(396, 448, 6)}"/>`,
    `<path fill="${SPARKLE}" d="${star(300, 486, 8)}"/>`,
    `<rect x="196" y="272" width="4" height="4" rx="2" fill="${DOT}"/>`,
    `<rect x="404" y="280" width="4" height="4" rx="2" fill="${DOT}"/>`,
    `<rect x="240" y="208" width="3" height="3" rx="1.5" fill="${ESPRESSO}" opacity="0.2"/>`,
    `<rect x="358" y="198" width="3" height="3" rx="1.5" fill="${ESPRESSO}" opacity="0.2"/>`,
  ].join("");
}

export function referralCardSvg(): string {
  const sender = figure({
    cx: 150,
    s: 0.36,
    headTop: 170,
    top: "#cbb99b",
    topDark: "#c2ad8e",
    pants: "#8a7a5c",
    shoe: "#6b5b3f",
    hair: "#3a2414",
    long: true,
    bust: true,
    arm: "right",
  });

  const friend = figure({
    cx: 450,
    s: 0.36,
    headTop: 170,
    top: "#dda0a8",
    topDark: "#d08e97",
    pants: "#4a5d7a",
    shoe: "#33415b",
    hair: "#1f1710",
    long: false,
    bust: false,
    arm: "left",
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800" role="img" aria-labelledby="referral-title referral-desc">`,
    `<title id="referral-title">Refer a friend</title>`,
    `<desc id="referral-desc">Two friends pass a gift box between them. Share a look and you both earn a free style credit.</desc>`,
    `<rect width="600" height="800" rx="36" fill="${IVORY}"/>`,
    `<rect x="16" y="16" width="568" height="768" rx="30" fill="none" stroke="${LINE}" stroke-width="2"/>`,
    `<rect x="24" y="24" width="552" height="752" rx="26" fill="none" stroke="${GOLD}" stroke-width="1.5" stroke-dasharray="2 7" stroke-linecap="round"/>`,
    `<text x="300" y="62" text-anchor="middle" font-family="${SANS}" font-size="13" font-weight="600" letter-spacing="4" fill="${GOLD_DARK}">REFER &amp; EARN</text>`,
    `<text x="300" y="110" text-anchor="middle" font-family="${SERIF}" font-size="46" font-weight="700" fill="${ESPRESSO}">Refer a Friend</text>`,
    `<text x="300" y="142" text-anchor="middle" font-family="${SANS}" font-size="16" fill="${MUTED}">Share this look - both of you earn a style credit</text>`,
    sender,
    friend,
    giftBox(),
    sparkles(),
    `<rect x="182" y="632" width="236" height="58" rx="29" fill="${ESPRESSO}"/>`,
    `<text x="300" y="670" text-anchor="middle" font-family="${SANS}" font-size="16" font-weight="600" letter-spacing="0.5" fill="${IVORY}">Get your referral link</text>`,
    `<path d="M 382 662 L 390 666 L 382 670" fill="none" stroke="${GOLD}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<text x="300" y="728" text-anchor="middle" font-family="${SANS}" font-size="13" fill="${MUTED}">Referral credits apply to your next styled look.</text>`,
    `</svg>`,
  ].join("");
}

// Data-URI used by <img> so the card renders with zero network requests.
export function referralCardImage(): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(referralCardSvg())}`;
}