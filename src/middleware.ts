import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// این middleware فقط یک بررسی سریع و سطحی می‌کند (آیا کوکی نشست ادمین وجود دارد).
// بررسی امن و واقعیِ معتبر بودن نشست (امضا + انقضا) داخل هر Route Handler ادمین
// با isAdminRequestAuthenticated() انجام می‌شود؛ پس حتی اگر کسی کوکی جعلی بسازد،
// نمی‌تواند از API های نوشتنی (ثبت/ویرایش/حذف آگهی) استفاده کند.
export function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login")
  ) {
    const sessionCookie = request.cookies.get("admin_session");

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
