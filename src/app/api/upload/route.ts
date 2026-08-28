import { NextRequest, NextResponse } from "next/server";
import { isAdminRequestAuthenticated } from "@/src/lib/adminAuth";
import { deleteUploadedFileByUrl, saveUploadedFile } from "@/src/lib/uploads";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_FILES = 15;

// POST /api/upload  -> multipart/form-data با یک یا چند فیلد "files"
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminRequestAuthenticated())) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "هیچ فایلی ارسال نشده است" }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `حداکثر ${MAX_FILES} فایل در هر درخواست مجاز است` },
        { status: 400 }
      );
    }

    const urls: string[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: `فایل «${file.name}» یک تصویر معتبر نیست` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `حجم فایل «${file.name}» بیشتر از ۸ مگابایت است` },
          { status: 400 }
        );
      }
      const url = await saveUploadedFile(file);
      urls.push(url);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("❌ POST /api/upload error:", error);
    return NextResponse.json({ error: "خطا در آپلود تصاویر" }, { status: 500 });
  }
}

// DELETE /api/upload  { url: "/uploads/properties/xxxx.jpg" }
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdminRequestAuthenticated())) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "آدرس فایل نامعتبر است" }, { status: 400 });
    }

    await deleteUploadedFileByUrl(url);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ DELETE /api/upload error:", error);
    return NextResponse.json({ error: "خطا در حذف تصویر" }, { status: 500 });
  }
}
