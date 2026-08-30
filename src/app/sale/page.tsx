"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FilterBar from "@/src/components/FilterBar";
import { useSearchParams } from "next/navigation";

export interface Property {
  id: number;
  slug: string; // فرض می‌کنم slug دارید
  title: string;
  address: string;
  description?: string;
  phone?: string;
  price: number | null;
  rent: number | null;
  deposit: number | null;
  type: "buy" | "rent";
  images: string[];
  meter: number;
}

// مقدار null/undefined یعنی اصلاً ثبت نشده، ۰ یعنی «توافقی»
function formatAmount(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  if (value === 0) return "توافقی";
  return value.toLocaleString("fa-IR") + " تومان";
}

export default function SalePage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // دریافت پارامتر meter از URL
      const meterParam = searchParams.get('meter');

      const apiParams = new URLSearchParams({ type: "buy" });
      if (meterParam) apiParams.set("meterMin", meterParam);

      const res = await fetch(`/api/properties?${apiParams.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("خطا در دریافت آگهی‌ها");
      const { data } = await res.json();

      setProperties(
        (data || []).map((p: Property) => ({
          ...p,
          images: Array.isArray(p.images) ? p.images : [],
        }))
      );
    } catch (err) {
      console.error("Fetch properties error:", err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchParams]); // وقتی پارامترهای URL تغییر کردند

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        آگهی‌های فروش
      </h1>

      {/* فیلتر بار */}
      <div className="mobile:flex justify-center mb-6">
        <FilterBar defaultType="buy" />
      </div>

      {/* نمایش loading */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال دریافت آگهی‌ها...</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 justify-center">
          {properties.length > 0 ? (
            properties.map((p) => (
              <Link
                key={p.id}
                href={`/property/${p.slug}`}
                className="backdrop-blur-lg bg-white rounded-2xl p-6 w-80 shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl block"
              >
                <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4 bg-gray-100">
                  <img
                    src={p.images?.[0] || "/hero.jpg"}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-60"
                  />
                  <img
                    src={p.images?.[0] || "/hero.jpg"}
                    alt={p.title}
                    className="relative w-full h-full object-contain"
                  />
                </div>

                <h3 className="text-xl font-semibold mb-2">{p.title}</h3>
                <p className="text-sm opacity-90 mb-1">
                  <b>آدرس:</b> {p.address}
                </p>
                <p className="mb-2 text-sm line-clamp-2">{p.description || "-"}</p>
                <p className="text-sm mb-1">
                  <b>متراژ:</b> {p.meter} متر
                </p>
                <p className="text-sm mb-2">
                  <b>تلفن:</b> {p.phone || "-"}
                </p>

                <p className="text-base font-semibold mb-1">
                  <b>قیمت خرید:</b> {formatAmount(p.price)}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 text-center mt-10">
              هیچ آگهی‌ای برای فروش پیدا نشد
            </p>
          )}
        </div>
      )}
    </div>
  );
}