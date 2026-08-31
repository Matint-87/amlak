"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import FilterBar from "@/src/components/FilterBar";
import { useSearchParams } from "next/navigation";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { HiStar } from "react-icons/hi2";

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
  status?: string;
  is_featured?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  sold: "فروش رفته",
  rented: "اجاره داده شده",
  under_construction: "در حال ساخت",
};

const STATUS_BADGE_COLOR: Record<string, string> = {
  sold: "bg-red-600/90",
  rented: "bg-red-600/90",
  under_construction: "bg-amber-500/90",
};

// مقدار null/undefined یعنی اصلاً ثبت نشده، ۰ یعنی «توافقی»
function formatAmount(value: number | null | undefined): string {
  if (value === null || value === undefined) return "ثبت نشده";
  if (value === 0) return "توافقی";
  return value.toLocaleString("fa-IR") + " تومان";
}

function getFirstImage(images: string[] | string) {
  if (!images) return "/hero.jpg";
  if (Array.isArray(images)) return images[0] || "/hero.jpg";
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) && arr.length ? arr[0] : "/hero.jpg";
  } catch {
    return "/hero.jpg";
  }
}

export default function SalePage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      // دریافت پارامتر meter از URL
      const meterParam = searchParams.get("meter");

      const apiParams = new URLSearchParams({
        type: "buy",
        excludeStatus: "cancelled", // آگهی‌های کنسل‌شده توی سایت عمومی نمایش داده نمی‌شن
        order: "created_at",
      });
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
        <div className="grid mobile:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {properties.length > 0 ? (
            properties.map((p) => {
              const statusLabel = p.status ? STATUS_LABELS[p.status] : null;
              const statusColor = p.status ? STATUS_BADGE_COLOR[p.status] : null;

              return (
                <Link href={`/property/${p.slug}`} key={p.id} className="group block">
                  <article
                    className={`overflow-hidden rounded-2xl border bg-white h-[310px] transition-shadow ${
                      p.is_featured
                        ? "border-2 border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.15)]"
                        : "border-gray-200 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {/* IMAGE */}
                    <div className="relative h-[165px] w-full overflow-hidden bg-gray-100">
                      <Image
                        src={getFirstImage(p.images)}
                        fill
                        alt={p.title || "تصویر ملک"}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                      {/* نشان ویژه */}
                      {p.is_featured && (
                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                          <HiStar size={12} />
                          ویژه
                        </div>
                      )}

                      {/* Type */}
                      <div
                        className={`absolute top-3 rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm bg-blue-600/90 ${
                          p.is_featured ? "left-3" : "right-3"
                        }`}
                      >
                        فروش
                      </div>

                      {/* Status badge */}
                      {statusLabel && (
                        <div
                          className={`absolute left-3 bottom-3 rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-sm ${statusColor}`}
                        >
                          {statusLabel}
                        </div>
                      )}

                      {/* Main price */}
                      <div className="absolute bottom-3 right-3">
                        <p className="text-sm font-bold text-white drop-shadow-md">
                          {formatAmount(p.price)}
                        </p>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="p-3">
                      <h3 className="truncate text-[15px] font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                        {p.title}
                      </h3>

                      <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                        <HiOutlineLocationMarker className="shrink-0 text-red-500" size={14} />
                        <span className="truncate">{p.address}</span>
                      </div>

                      <div className="my-3 h-px bg-gray-100" />

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-400">قیمت کل</span>
                        <span className="text-sm font-bold text-gray-800">
                          {formatAmount(p.price)}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })
          ) : (
            <p className="text-gray-500 text-center mt-10 col-span-full">
              هیچ آگهی‌ای برای فروش پیدا نشد
            </p>
          )}
        </div>
      )}
    </div>
  );
}