import "server-only";

import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
]);

const MAX_SIZE_BYTES = 8 * 1024 * 1024;

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

export function assertValidImage(file: File) {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new UploadError("Only image files (JPEG, PNG, WEBP, GIF, AVIF, HEIC) are allowed.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError("Image must be 8MB or smaller.");
  }
}

export function isCloudinaryConfigured() {
  return cloudinaryConfigured;
}

async function uploadToCloudinary(buffer: Buffer, userId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `style-me/${userId}`,
        resource_type: "image",
        transformation: [{ width: 1200, crop: "limit", quality: "auto:good" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(new UploadError("Failed to upload image to Cloudinary."));
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

function extensionFor(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/avif":
      return "avif";
    case "image/heic":
      return "heic";
    default:
      return "jpg";
  }
}

async function uploadLocally(buffer: Buffer, userId: string, file: File): Promise<string> {
  const ext = extensionFor(file.type);
  const filename = `${userId}-${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function uploadImage(file: File, userId: string): Promise<string> {
  assertValidImage(file);

  const buffer = Buffer.from(await file.arrayBuffer());

  if (cloudinaryConfigured) {
    return uploadToCloudinary(buffer, userId);
  }
  return uploadLocally(buffer, userId, file);
}
