import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const FASHN_API = "https://api.fashn.ai";
const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";
const MAX_IMAGE_BYTES = 30 * 1024 * 1024;
const POLL_INTERVAL_MS = 2500;
const STEP_TIMEOUT_MS = 180_000;

export class VtonError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VtonError";
  }
}

function mimeFor(src: string): string {
  const ext = src.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "avif":
      return "image/avif";
    case "heic":
      return "image/heic";
    case "jpg":
    case "jpeg":
    default:
      return "image/jpeg";
  }
}

type LoadedImage = { mimeType: string; base64: string };

// Read an image (absolute URL or same-origin path) from our own server.
async function loadImage(src: string, origin: string): Promise<LoadedImage> {
  const url = src.startsWith("http") ? src : `${origin}${src}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new VtonError(`Could not read ${src} (HTTP ${res.status}).`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new VtonError(`Image ${src} is larger than the 30 MB limit for the AI service.`);
  }
  return {
    mimeType: res.headers.get("content-type") ?? mimeFor(src),
    base64: buffer.toString("base64"),
  };
}

// Data URI form accepted by Fashn (works in local dev where our server is
// not publicly reachable from their infra).
async function imageToDataUri(src: string, origin: string): Promise<string> {
  const image = await loadImage(src, origin);
  return `data:${image.mimeType};base64,${image.base64}`;
}

async function saveImage(base64: string, mimeType: string): Promise<string> {
  const ext = mimeType.includes("png") ? "png" : "jpg";
  const filename = `vton-${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(base64, "base64"));
  return `/uploads/${filename}`;
}

// =============================================================
// Fashn.ai (paid, best fidelity for real clothing transfer)
// =============================================================

type FashnApiError = { error?: string };

async function submitTryOn(apiKey: string, modelImage: string, productImage: string): Promise<string> {
  const res = await fetch(`${FASHN_API}/v1/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model_name: "tryon-max",
      inputs: {
        model_image: modelImage,
        product_image: productImage,
        output_format: "jpeg",
      },
    }),
  });
  const data = (await res.json().catch(() => ({}))) as FashnApiError & { id?: string; pred_id?: string };
  if (!res.ok || !data) {
    throw new VtonError(data?.error ? `Fashn API error: ${data.error}` : `Fashn API error (HTTP ${res.status}).`);
  }
  const id = data.id ?? data.pred_id;
  if (!id) {
    throw new VtonError("Fashn API did not return a prediction id.");
  }
  return id;
}

async function pollTryOn(apiKey: string, id: string): Promise<string> {
  const deadline = Date.now() + STEP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const res = await fetch(`${FASHN_API}/v1/status/${id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = (await res.json().catch(() => ({}))) as FashnApiError & {
      status?: string;
      output?: string[];
    };
    if (data.status === "completed" && Array.isArray(data.output) && data.output.length > 0) {
      return data.output[0];
    }
    if (data.status === "failed" || data.error) {
      throw new VtonError(data.error ? `AI try-on failed: ${data.error}` : "AI try-on failed.");
    }
    if (!res.ok) {
      throw new VtonError(`Fashn API error while checking status (HTTP ${res.status}).`);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new VtonError("AI try-on timed out. Please try again.");
}

// Order garments so the outfit builds up sensibly: the base piece first,
// then layers that go over it, accessories last.
function chainRank(category?: string | null): number {
  const c = (category ?? "").toLowerCase();
  const rules: Array<[RegExp, number]> = [
    [/dress|saree|lehenga|kurti|kurt|gown|anarkali|jumpsuit|frock|caftan|kurta/i, 1],
    [/top|shirt|tshirt|t-shirt|blouse|camisole|tank|bustier/i, 2],
    [/pant|jean|trouser|short|skirt|legging|palazzo|jogger|chino|dhoti|churidar|sharara|salwar/i, 3],
    [/jacket|blazer|coat|cardigan|hoodie|sweater|sweatshirt|waistcoat/i, 4],
    [/shoe|sneaker|heel|boot|sandal|flat|jutti|kolhapuri|mule|loafer|wedge/i, 5],
    [/hat|cap|scarf|stole|dupatta|belt|handbag|bag|clutch|sling|tote|jewel|necklace|earring|bangle|bracelet|glove/i, 6],
  ];
  for (const [pattern, rank] of rules) {
    if (pattern.test(c)) return rank;
  }
  return 7;
}

async function generateWithFashn({
  bodyPhotoUrl,
  garments,
  origin,
  apiKey,
}: {
  bodyPhotoUrl: string;
  garments: Array<{ name: string; category?: string | null; imageUrl?: string | null }>;
  origin: string;
  apiKey: string;
}): Promise<string> {
  const usable = garments.filter((garment) => garment.imageUrl).sort(
    (a, b) => chainRank(a.category) - chainRank(b.category),
  );
  let modelImage = await imageToDataUri(bodyPhotoUrl, origin);
  for (const garment of usable) {
    const productImage = await imageToDataUri(garment.imageUrl!, origin);
    const predictionId = await submitTryOn(apiKey, modelImage, productImage);
    modelImage = await pollTryOn(apiKey, predictionId);
  }
  // `modelImage` is now the CDN URL of the final output; store it locally so
  // it does not expire with Fashn's 3-day retention window.
  const res = await fetch(modelImage);
  if (!res.ok) {
    throw new VtonError("Could not download the AI result. Please try again.");
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  return saveImage(buffer.toString("base64"), res.headers.get("content-type") ?? "image/jpeg");
}

// =============================================================
// Google Gemini (free tier) — same "put this outfit on this
// person" photo editing as ChatGPT's image model.
// =============================================================

async function generateWithGemini({
  bodyPhotoUrl,
  garments,
  origin,
  apiKey,
}: {
  bodyPhotoUrl: string;
  garments: Array<{ name: string; category?: string | null; imageUrl?: string | null }>;
  origin: string;
  apiKey: string;
}): Promise<string> {
  const usable = garments.filter((garment) => garment.imageUrl).sort(
    (a, b) => chainRank(a.category) - chainRank(b.category),
  );
  if (usable.length === 0) {
    throw new VtonError("None of the pieces in this look have a photo to try on.");
  }

  const parts: Array<Record<string, unknown>> = [];
  const person = await loadImage(bodyPhotoUrl, origin);
  parts.push({ inlineData: { mimeType: person.mimeType, data: person.base64 } });
  for (const garment of usable) {
    const image = await loadImage(garment.imageUrl!, origin);
    parts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });
  }

  const garmentList = usable
    .map((g, i) => `- Image ${i + 2}: a ${g.category ?? "clothing"} item called "${g.name}"`)
    .join("\n");

  const prompt = [
    "The FIRST image is a real photo of a person.",
    "The OTHER images are separate items of clothing they want to try on:",
    garmentList,
    "Edit ONLY the first photo so the person is wearing exactly these clothes, matching each item's design, colour, fabric and fit.",
    "Keep the person's face, hairstyle, skin, body, pose, lighting and background identical to the original photo.",
    "The clothes must look naturally worn and photorealistic, as if the person is really wearing them.",
    "Output the edited photo only.",
  ].join("\n");
  parts.push({ text: prompt });

  const res = await fetch(`${GEMINI_API}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    candidates?: Array<{
      content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string }; text?: string }> };
      finishReason?: string;
    }>;
    error?: { message?: string };
  };

  if (!res.ok) {
    const message = data?.error?.message ?? `Gemini error (HTTP ${res.status}).`;
    if (res.status === 429) {
      throw new VtonError("The free AI limit is busy right now. Wait about a minute and try again.");
    }
    throw new VtonError(`Gemini API error: ${message}`);
  }

  const candidate = data?.candidates?.[0];
  if (!candidate || !candidate.content?.parts?.length) {
    throw new VtonError("Gemini did not return an image. Try again.");
  }
  if (candidate.finishReason && candidate.finishReason !== "STOP") {
    throw new VtonError(`Gemini could not generate this image (${candidate.finishReason}).`);
  }
  const imagePart = candidate.content.parts.find((part) => part.inlineData?.data);
  if (!imagePart?.inlineData?.data) {
    const text = candidate.content.parts.map((p) => p.text ?? "").join(" ");
    throw new VtonError(text ? `Gemini refused: ${text}` : "Gemini did not return an image. Try again.");
  }

  return saveImage(imagePart.inlineData.data, imagePart.inlineData.mimeType ?? "image/png");
}

// =============================================================
// Public entry point — picks whichever provider is configured.
// =============================================================

export async function generateTryOn({
  bodyPhotoUrl,
  garments,
  origin,
}: {
  bodyPhotoUrl: string;
  garments: Array<{
    id: string;
    name: string;
    category?: string | null;
    imageUrl?: string | null;
  }>;
  origin: string;
}): Promise<string> {
  const fashnKey = process.env.FASHN_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (fashnKey) {
    return generateWithFashn({ bodyPhotoUrl, garments, origin, apiKey: fashnKey });
  }
  if (geminiKey) {
    return generateWithGemini({ bodyPhotoUrl, garments, origin, apiKey: geminiKey });
  }

  throw new VtonError(
    "No AI provider configured. Add a free GEMINI_API_KEY (aistudio.google.com) — or a paid FASHN_API_KEY — to your .env file and restart the server.",
  );
}
