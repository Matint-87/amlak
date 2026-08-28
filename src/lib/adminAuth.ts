import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // ۲۴ ساعت

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "متغیر ADMIN_SESSION_SECRET تنظیم نشده است. فایل .env.local را بررسی کنید."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

// یک توکن نشست ساده و امضاشده می‌سازد: base64(expiry).signature
export function createSessionToken(): string {
  const expiry = Date.now() + SESSION_TTL_MS;
  const payload = String(expiry);
  const signature = sign(payload);
  return Buffer.from(payload).toString("base64") + "." + signature;
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64").toString("utf8");
  } catch {
    return false;
  }

  const expectedSignature = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const expiry = Number(payload);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  return true;
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error(
      "متغیر ADMIN_PASSWORD تنظیم نشده است. فایل .env.local را بررسی کنید."
    );
  }
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// بررسی نشست ادمین از روی کوکی‌های درخواست جاری (برای استفاده در Route Handlerها)
export async function isAdminRequestAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return isValidSessionToken(token);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
