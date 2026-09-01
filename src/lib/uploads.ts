import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "properties");
export const UPLOAD_URL_PREFIX = "/uploads/properties";

const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
]);

export function sanitizeExtension(filename: string): string {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext) ? ext : "jpg";
}

export async function saveUploadedFile(file: File): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = sanitizeExtension(file.name);
  const uniqueName = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, uniqueName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return `${UPLOAD_URL_PREFIX}/${uniqueName}`;
}

export async function deleteUploadedFileByUrl(url: string): Promise<void> {
  try {
    if (!url || !url.startsWith(UPLOAD_URL_PREFIX)) return;
    const fileName = url.substring(UPLOAD_URL_PREFIX.length + 1);
    if (!fileName || fileName.includes("..") || fileName.includes("/")) return;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await unlink(filePath);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code !== "ENOENT") {
      console.error("❌ خطا در حذف فایل آپلود شده:", error);
    }
  }
}
