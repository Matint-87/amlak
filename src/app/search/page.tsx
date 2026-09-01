import Image from "next/image";
import Link from "next/link";
import { HiOutlineLocationMarker, HiOutlineSearch } from "react-icons/hi";
import { HiStar } from "react-icons/hi2";

interface Ad {
  id: number;
  title: string;
  address: string;
  type: string;
  price?: number | null;
  rent?: number | null;
  deposit?: number | null;
  meter?: number | null;
  images: string[] | string;
  status?: string;
  is_featured?: boolean;
}

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const { q, location, meterMin, meterMax, titleAny, type } = params;

  const url = new URL(
    "/api/properties",
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  );
  if (q) url.searchParams.set("q", q);
  if (location) url.searchParams.set("location", location);
  if (meterMin) url.searchParams.set("meterMin", meterMin);
  if (meterMax) url.searchParams.set("meterMax", meterMax);
  if (titleAny) url.searchParams.set("titleAny", titleAny);
  if (type) url.searchParams.set("type", type);
  url.searchParams.set("excludeStatus", "cancelled");

  const res = await fetch(url, { cache: "no-store" });
  const { data } = await res.json();
  const ads: Ad[] = data || [];

  const hasFilters = q || location || meterMin || meterMax || titleAny || type;

  return (
    <div className="flex flex-col items-center py-10 gap-6 mobile:px-4 laptop:px-0">
      <div className="w-full laptop:w-[70%] flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <HiOutlineSearch className="text-[#0BA6DF]" size={22} />
          <h1 className="text-xl font-bold text-gray-900">
            نتایج جستجو {ads.length ? `(${ads.length} مورد)` : ""}
          </h1>
        </div>

        {hasFilters && (
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            {titleAny && (
              <span className="bg-gray-100 rounded-full px-3 py-1">
                دسته: {titleAny.split(",")[0]}
                {titleAny.split(",").length > 1 ? " و مشابه" : ""}
              </span>
            )}
            {type && (
              <span className="bg-gray-100 rounded-full px-3 py-1">
                نوع: {type === "buy" ? "خرید" : "اجاره"}
              </span>
            )}
            {q && (
              <span className="bg-gray-100 rounded-full px-3 py-1">
                عبارت: {q}
              </span>
            )}
            {location && (
              <span className="bg-gray-100 rounded-full px-3 py-1">
                لوکیشن: {location}
              </span>
            )}
            {meterMin && (
              <span className="bg-gray-100 rounded-full px-3 py-1">
                متراژ از: {meterMin}
              </span>
            )}
            {meterMax && (
              <span className="bg-gray-100 rounded-full px-3 py-1">
                متراژ تا: {meterMax}
              </span>
            )}
          </div>
        )}
      </div>

      {ads.length ? (
        <div className="grid mobile:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 gap-5 w-full laptop:w-[70%]">
          {ads.map((p) => {
            const isBuy = p.type === "buy";
            const statusLabel = p.status ? STATUS_LABELS[p.status] : null;
            const statusColor = p.status ? STATUS_BADGE_COLOR[p.status] : null;

            return (
              <Link href={`/property/${p.id}`} key={p.id} className="group block">
                <article
                  className={`overflow-hidden rounded-2xl border bg-white h-[310px] transition-shadow ${
                    p.is_featured
                      ? "border-2 border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.15)]"
                      : "border-gray-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="relative h-[165px] w-full overflow-hidden bg-gray-100">
                    <Image
                      src={getFirstImage(p.images)}
                      fill
                      alt={p.title || "تصویر ملک"}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                    {p.is_featured && (
                      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                        <HiStar size={12} />
                        ویژه
                      </div>
                    )}

                    <div
                      className={`absolute top-3 rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm ${
                        isBuy ? "bg-blue-600/90" : "bg-emerald-600/90"
                      } ${p.is_featured ? "left-3" : "right-3"}`}
                    >
                      {isBuy ? "فروش" : "رهن و اجاره"}
                    </div>

                    {statusLabel && (
                      <div
                        className={`absolute left-3 bottom-3 rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-sm ${statusColor}`}
                      >
                        {statusLabel}
                      </div>
                    )}

                    <div className="absolute bottom-3 right-3">
                      <p className="text-sm font-bold text-white drop-shadow-md">
                        {isBuy ? formatAmount(p.price) : formatAmount(p.deposit)}
                      </p>
                      {!isBuy && (
                        <p className="mt-0.5 text-[10px] text-gray-200">
                          + {formatAmount(p.rent)} اجاره
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="truncate text-[15px] font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                      {p.title}
                    </h3>

                    <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                      <HiOutlineLocationMarker className="shrink-0 text-red-500" size={14} />
                      <span className="truncate">{p.address}</span>
                    </div>

                    <div className="my-3 h-px bg-gray-100" />

                    {isBuy ? (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-400">قیمت کل</span>
                        <span className="text-sm font-bold text-gray-800">
                          {formatAmount(p.price)}
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-gray-50 px-2 py-2">
                          <p className="text-[10px] text-gray-400">رهن</p>
                          <p className="mt-0.5 truncate text-xs font-bold text-gray-800">
                            {formatAmount(p.deposit)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-gray-50 px-2 py-2">
                          <p className="text-[10px] text-gray-400">اجاره</p>
                          <p className="mt-0.5 truncate text-xs font-bold text-gray-800">
                            {formatAmount(p.rent)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
          <HiOutlineSearch size={40} />
          <p className="text-sm">موردی با این مشخصات پیدا نشد.</p>
        </div>
      )}
    </div>
  );
}