// A self-contained flat SVG "look card" for sharing a saved look as an image.
// Uses the same ivory + gold + espresso palette as the referral card
// (src/lib/referral-card.ts). Item photos are embedded as <image> references,
// so the card renders wherever the source images are reachable.

const IVORY = "#fdfbf7";
const ESPRESSO = "#2b2118";
const GOLD = "#d4af37";
const GOLD_DARK = "#b08d3e";
const LINE = "#e8dcc2";
const MUTED = "#6b5b3f";

const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

export type LookCardInput = {
  name: string;
  description?: string | null;
  pieceCount: number;
  occasion?: string | null;
  images: { name: string; imageUrl: string }[];
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function chip(text: string, x: number): string {
  const width = 26 + text.length * 8.4;
  return [
    `<rect x="${x}" y="192" width="${width}" height="30" rx="15" fill="${GOLD}" opacity="0.16"/>`,
    `<text x="${x + width / 2}" y="211" text-anchor="middle" font-family="${SANS}" font-size="13" font-weight="600" fill="${GOLD_DARK}">${esc(text)}</text>`,
  ].join("");
}

function imageCell(image: { name: string; imageUrl: string }, x: number, y: number, size: number): string {
  return [
    `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="18" fill="${LINE}"/>`,
    `<clipPath id="clip-${x}"><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="18"/></clipPath>`,
    `<g clip-path="url(#clip-${x})">`,
    `<image href="${esc(image.imageUrl)}" x="${x}" y="${y}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid slice"/>`,
    `</g>`,
    `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="18" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.55"/>`,
  ].join("");
}

function placeholderCell(text: string, x: number, y: number, size: number): string {
  return [
    `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="18" fill="${LINE}"/>`,
    `<text x="${x + size / 2}" y="${y + size / 2 + 4}" text-anchor="middle" font-family="${SANS}" font-size="12" fill="${MUTED}">${esc(text)}</text>`,
  ].join("");
}

export function lookCardSvg(input: LookCardInput): string {
  const name = truncate(input.name, 30);
  const description = input.description ? truncate(input.description, 64) : "";
  const pieceLabel = `${input.pieceCount} ${input.pieceCount === 1 ? "piece" : "pieces"}`;

  const chipMiddle = ` ${input.pieceCount} ${input.pieceCount === 1 ? "piece" : "pieces"} `.trim();

  const size = 150;
  const gap = 14;
  const startX = (600 - (size * 3 + gap * 2)) / 2;
  const imageY = 250;
  const images = input.images.slice(0, 3);

  const itemsArea =
    images.length === 0
      ? placeholderCell("No items", startX, imageY, size * 3 + gap * 2)
      : images.map((img, i) => imageCell(img, startX + i * (size + gap), imageY, size)).join("");

  const occasionChip = input.occasion
    ? chip(truncate(input.occasion.replace(/-/g, " "), 22), 42)
    : "";
  const piecesChip = chip(chipMiddle, occasionChip ? 42 + 26 + chipMiddle.length * 8.4 + 12 : 42);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800" role="img" aria-labelledby="look-card-title look-card-desc">`,
    `<title id="look-card-title">${esc(name)}</title>`,
    `<desc id="look-card-desc">A styled look from Style Me With Wardrobe with ${pieceLabel}.</desc>`,
    `<rect width="600" height="800" rx="36" fill="${IVORY}"/>`,
    `<rect x="16" y="16" width="568" height="768" rx="30" fill="none" stroke="${LINE}" stroke-width="2"/>`,
    `<rect x="24" y="24" width="552" height="752" rx="26" fill="none" stroke="${GOLD}" stroke-width="1.5" stroke-dasharray="2 7" stroke-linecap="round"/>`,
    `<text x="300" y="62" text-anchor="middle" font-family="${SANS}" font-size="13" font-weight="600" letter-spacing="4" fill="${GOLD_DARK}">STYLE ME WITH WARDROBE</text>`,
    `<text x="300" y="132" text-anchor="middle" font-family="${SERIF}" font-size="44" font-weight="700" fill="${ESPRESSO}">${esc(name)}</text>`,
    description
      ? `<text x="300" y="166" text-anchor="middle" font-family="${SANS}" font-size="15" fill="${MUTED}">${esc(description)}</text>`
      : "",
    occasionChip,
    piecesChip,
    itemsArea,
    `<text x="300" y="436" text-anchor="middle" font-family="${SANS}" font-size="13" fill="${MUTED}">A complete, occasion-ready look built from your own wardrobe.</text>`,
    `<rect x="182" y="672" width="236" height="58" rx="29" fill="${ESPRESSO}"/>`,
    `<text x="300" y="710" text-anchor="middle" font-family="${SANS}" font-size="16" font-weight="600" letter-spacing="0.5" fill="${IVORY}">Style Me With Wardrobe</text>`,
    `<text x="300" y="744" text-anchor="middle" font-family="${SANS}" font-size="12" fill="${MUTED}">Styled to be you.</text>`,
    `</svg>`,
  ].join("");
}

// Data-URI used by <a download> / <img> so the card ships with zero tooling.
export function lookCardImage(input: LookCardInput): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(lookCardSvg(input))}`;
}