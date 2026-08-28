import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_MAX_AGE_SECONDS,
  ADMIN_COOKIE_NAME,
  createSessionToken,
  verifyAdminPassword,
} from "@/src/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "رمز عبور الزامی است" }, { status: 400 });
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: "رمز عبور اشتباه است" }, { status: 401 });
    }

    const token = createSessionToken();
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ POST /api/admin/login error:", error);
    return NextResponse.json({ error: "خطا در ورود" }, { status: 500 });
  }
}
