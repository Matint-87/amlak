import { NextRequest, NextResponse } from "next/server";
import { query } from "@/src/lib/db";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = await params;
  try {
    const bySlug = await query("SELECT * FROM properties WHERE slug = $1", [slug]);
    if (bySlug.rows.length > 0) {
      return NextResponse.json({ data: bySlug.rows[0] });
    }

    if (/^\d+$/.test(slug)) {
      const byId = await query("SELECT * FROM properties WHERE id = $1", [slug]);
      if (byId.rows.length > 0) {
        return NextResponse.json({ data: byId.rows[0], redirectSlug: byId.rows[0].slug });
      }
    }

    return NextResponse.json({ error: "آگهی پیدا نشد" }, { status: 404 });
  } catch (error) {
    console.error("❌ GET /api/properties/slug/[slug] error:", error);
    return NextResponse.json({ error: "خطا در دریافت آگهی" }, { status: 500 });
  }
}
