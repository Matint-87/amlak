"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">۴۰۴</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">آگهی پیدا نشد</h2>
        <p className="text-gray-500 mb-8">متأسفانه آگهی مورد نظر شما وجود ندارد یا حذف شده است.</p>
        <div className="space-x-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
          >
            بازگشت
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}