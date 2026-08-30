"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FilterBar from "@/src/components/FilterBar";
import { useSearchParams } from "next/navigation";

export interface Property {
  id: number;
  slug: string;
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

export default function RentPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // تابع برای دریافت داده‌ها با فیلتر
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // دریافت پارامتر meter از URL
      const meterParam = searchParams.get('meter');

      const apiParams = new URLSearchParams({ type: "rent" });
      if (meterParam) apiParams.set("meterMin", meterParam);

      const res = await fetch(`/api/properties?${apiParams.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("خطا در دریافت آگهی‌ها");
      const { data } = await res.json();

      const formattedData = (data || []).map((p: Property) => ({
        ...p,
        images: Array.isArray(p.images) ? p.images : [],
      }));

      setProperties(formattedData);
    } catch (err) {
      console.error("Fetch properties error:", err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // وقتی searchParams تغییر کرد، داده‌ها را دوباره بگیر
  useEffect(() => {
    fetchData();
  }, [searchParams]);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        آگهی‌های اجاره
      </h1>

      {/* فیلتر بار */}
      <div className="mobile:flex justify-center mb-6">
        <FilterBar defaultType="rent" />
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
                key={p.slug}
                href={`/property/${p.slug}`}
                className="backdrop-blur-lg bg-white rounded-2xl p-6 w-80 shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl block"
              >
                <img
                  src={p.images?.[0] || "/hero.jpg"}
                  alt={p.title}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />

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

                <p className="text-sm mb-1">
                  <b>رهن:</b> {formatAmount(p.deposit)}
                </p>
                <p className="text-sm mb-2">
                  <b>اجاره ماهیانه:</b> {formatAmount(p.rent)}
                </p>
              </Link>
            ))
          ) : (
            <div className="text-center py-10 w-full">
              <p className="text-gray-500 text-xl">
                هیچ آگهی‌ای یافت نشد
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}