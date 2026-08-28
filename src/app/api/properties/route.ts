import { NextRequest, NextResponse } from "next/server";
import { query } from "@/src/lib/db";
import { isAdminRequestAuthenticated } from "@/src/lib/adminAuth";

export const dynamic = "force-dynamic";

function makeSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0600-\u06FF-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "property"}-${Date.now()}`;
}

// GET /api/properties?type=rent|buy&meterMin=50&order=created_at|id&limit=10&count=1
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const meterMin = searchParams.get("meterMin");
    const order = searchParams.get("order") === "created_at" ? "created_at" : "id";
    const limitParam = searchParams.get("limit");
    const countOnly = searchParams.get("count") === "1";

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (type === "buy" || type === "rent") {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }

    if (meterMin) {
      const meterValue = Number(meterMin);
      if (Number.isFinite(meterValue)) {
        params.push(meterValue);
        conditions.push(`meter >= $${params.length}`);
      }
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    if (countOnly) {
      const result = await query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM properties ${where}`,
        params
      );
      return NextResponse.json({ count: Number(result.rows[0]?.count ?? 0) });
    }

    let sql = `SELECT * FROM properties ${where} ORDER BY ${order} DESC`;
    if (limitParam) {
      const limitValue = Number(limitParam);
      if (Number.isFinite(limitValue) && limitValue > 0) {
        params.push(Math.min(limitValue, 200));
        sql += ` LIMIT $${params.length}`;
      }
    }

    const result = await query(sql, params);
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error("❌ GET /api/properties error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت آگهی‌ها از دیتابیس" },
      { status: 500 }
    );
  }
}

// POST /api/properties  (فقط ادمین)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminRequestAuthenticated())) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      title,
      address = null,
      description = null,
      phone = null,
      price = null,
      rent = null,
      deposit = null,
      meter = null,
      images = [],
    } = body ?? {};

    if (!type || (type !== "buy" && type !== "rent")) {
      return NextResponse.json({ error: "نوع معامله نامعتبر است" }, { status: 400 });
    }
    if (!title || !String(title).trim()) {
      return NextResponse.json({ error: "عنوان الزامی است" }, { status: 400 });
    }
    if (!meter || Number(meter) <= 0) {
      return NextResponse.json({ error: "متراژ الزامی است" }, { status: 400 });
    }

    const slug = makeSlug(String(title));

    const result = await query(
      `INSERT INTO properties
        (type, title, slug, address, description, phone, price, rent, deposit, meter, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        type,
        title,
        slug,
        address,
        description,
        phone,
        type === "buy" ? price : null,
        type === "rent" ? rent : null,
        type === "rent" ? deposit : null,
        meter,
        JSON.stringify(Array.isArray(images) ? images : []),
      ]
    );

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/properties error:", error);
    return NextResponse.json({ error: "خطا در ثبت آگهی" }, { status: 500 });
  }
}
