import { NextRequest, NextResponse } from "next/server";
import { query } from "@/src/lib/db";
import { isAdminRequestAuthenticated } from "@/src/lib/adminAuth";
import { deleteUploadedFileByUrl } from "@/src/lib/uploads";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const result = await query("SELECT * FROM properties WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "آگهی پیدا نشد" }, { status: 404 });
    }
    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error("❌ GET /api/properties/[id] error:", error);
    return NextResponse.json({ error: "خطا در دریافت آگهی" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
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

    const result = await query(
      `UPDATE properties SET
        type = $1,
        title = $2,
        address = $3,
        description = $4,
        phone = $5,
        price = $6,
        rent = $7,
        deposit = $8,
        meter = $9,
        images = $10
       WHERE id = $11
       RETURNING *`,
      [
        type,
        title,
        address,
        description,
        phone,
        type === "buy" ? price : null,
        type === "rent" ? rent : null,
        type === "rent" ? deposit : null,
        meter,
        JSON.stringify(Array.isArray(images) ? images : []),
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "آگهی پیدا نشد" }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error("❌ PUT /api/properties/[id] error:", error);
    return NextResponse.json({ error: "خطا در ویرایش آگهی" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    if (!(await isAdminRequestAuthenticated())) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const result = await query(
      "DELETE FROM properties WHERE id = $1 RETURNING images",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "آگهی پیدا نشد" }, { status: 404 });
    }

    const images: string[] = result.rows[0].images ?? [];
    for (const url of images) {
      await deleteUploadedFileByUrl(url);
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("❌ DELETE /api/properties/[id] error:", error);
    return NextResponse.json({ error: "خطا در حذف آگهی" }, { status: 500 });
  }
}
