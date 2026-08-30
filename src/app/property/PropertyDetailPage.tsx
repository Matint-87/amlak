"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MdNavigateNext, MdZoomIn } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";
import { IoArrowBack } from "react-icons/io5";
import Link from "next/link";
import ImageLightbox from "@/src/components/ImageLightbox";

export interface Property {
  id: string;
  title: string;
  address?: string | null;
  description?: string | null;
  phone?: string | null;
  price?: number | string | null;
  rent?: number | string | null;
  deposit?: number | string | null;
  type: string;
  images?: string[];
  meter?: number | null;
  slug: string;
  created_at?: string;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false); // کنترل باز/بسته بودن نمایش تمام‌صفحه

  useEffect(() => {
    // این پرچم برای جلوگیری از race condition هست: اگه این افکت دوباره اجرا بشه
    // (مثلاً به خاطر Strict Mode در حالت dev که هر افکت رو دوبار اجرا می‌کنه، یا
    // تغییر سریع params.slug)، ممکنه دو تا فراخوانی fetchProperty هم‌زمان در حال
    // اجرا باشن. اگه fetch قدیمی‌تر دیرتر resolve بشه و با خطا/۴۰۴ برگرده، همون
    // نتیجه‌ی درستِ فچ جدید رو با یه خطای اشتباه بازنویسی می‌کنه (همون فلش کوتاه
    // "آگهی پیدا نشد" که می‌بینی، قبل از اینکه دیتای واقعی درست بشینه).
    // با ignore، فقط آخرین اجرای معتبرِ افکت اجازه‌ی setState داره.
    let ignore = false;

    const fetchProperty = async () => {
      // مهم: هر بار که این افکت دوباره اجرا میشه (مثلاً params.slug عوض میشه)
      // باید وضعیت رو ریست کنیم به loading=true و error/property=null.
      // در غیر این صورت، تا وقتی فچ جدید تموم بشه، چون loading از دفعه‌ی قبل
      // false مونده و property هنوز null هست، شرط "not found" زودتر از موقع
      // نمایش داده میشه (فلش کوتاه "آگهی پیدا نشد" قبل از لود واقعی)
      if (ignore) return;
      setLoading(true);
      setError(null);
      setProperty(null);

      const rawSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

      if (!rawSlug) {
        if (!ignore) {
          setError("آدرس آگهی مشخص نشده است");
          setLoading(false);
        }
        return;
      }

      // نرمال‌سازی اسلاگ: ممکن است params.slug از قبل percent-encoded باشد یا نباشد.
      // اینجا مطمئن می‌شویم فقط یک‌بار encode شود تا از double-encoding جلوگیری شود
      // (باگی که باعث می‌شد /property/آپارتمان-... با ۴۰۴ مواجه شود)
      let slug = rawSlug;
      try {
        slug = decodeURIComponent(rawSlug);
      } catch {
        // اگر decode ناموفق بود، همان مقدار خام استفاده شود
      }

      console.log("🔍 جستجوی آگهی با slug:", slug);

      try {
        // جستجوی آگهی بر اساس slug (این API خودش fallback به id را هم پشتیبانی می‌کند)
        const res = await fetch(
          `/api/properties/slug/${encodeURIComponent(slug)}`,
          {
            cache: "no-store",
          },
        );

        if (res.status === 404) {
          if (!ignore) {
            setError("آگهی پیدا نشد");
            setLoading(false);
          }
          return;
        }

        if (!res.ok) {
          if (!ignore) {
            setError("خطا در دریافت اطلاعات");
            setLoading(false);
          }
          return;
        }

        const { data, redirectSlug } = await res.json();

        if (ignore) return; // این اجرا دیگه معتبر نیست (افکت جدیدتری شروع شده)

        if (redirectSlug && redirectSlug !== slug) {
          // لینک قدیمی بود (id به‌جای slug)، به آدرس درست redirect کن
          // توجه: loading رو true نگه می‌داریم تا صفحه‌ی مقصد لود بشه
          // (به جای false کردنش که باعث میشد لحظه‌ای صفحه‌ی "پیدا نشد" دیده بشه)
          router.replace(`/property/${redirectSlug}`);
          return;
        }

        if (!data) {
          setError("آگهی پیدا نشد");
          setLoading(false);
          return;
        }

        // پردازش تصاویر
        let images: string[] = [];
        if (data.images) {
          if (typeof data.images === "string") {
            try {
              images = JSON.parse(data.images);
            } catch {
              images = [];
            }
          } else if (Array.isArray(data.images)) {
            images = data.images.filter(
              (img: string) => img && img.trim() !== "",
            );
          }
        }

        setProperty({
          id: data.id,
          title: data.title || "بدون عنوان",
          address: data.address || null,
          description: data.description || null,
          phone: data.phone || null,
          price: data.price,
          rent: data.rent,
          deposit: data.deposit,
          type: data.type || "buy",
          images: images,
          meter: data.meter,
          slug: data.slug,
          created_at: data.created_at,
        });
        setIndex(0); // با تعویض آگهی، ایندکس گالری تصاویر هم ریست بشه
        setLoading(false);
      } catch (err: any) {
        if (!ignore) {
          console.error("خطای غیرمنتظره:", err);
          setError("خطا در دریافت اطلاعات");
          setLoading(false);
        }
      }
    };

    fetchProperty();

    // Cleanup: وقتی افکت دوباره اجرا میشه یا کامپوننت unmount میشه،
    // این اجرای قبلی رو "نامعتبر" علامت بزن تا دیگه state رو دستکاری نکنه
    return () => {
      ignore = true;
    };
  }, [params.slug, router]);

  // مقدار قیمت از دیتابیس ممکن است رشته باشد (ستون NUMERIC)، پس هم null/undefined/""
  // و هم رشته‌ی عددی "0" باید به‌عنوان «توافقی» تشخیص داده شوند.
  const formatPrice = (price?: number | string | null) => {
    if (price === null || price === undefined || price === "") {
      return "توافقی";
    }
    const numPrice = Number(price);
    if (Number.isNaN(numPrice) || numPrice === 0) {
      return "توافقی";
    }
    return new Intl.NumberFormat("fa-IR").format(numPrice) + " تومان";
  };

  const getDealTypeText = (type: string) => {
    switch (type) {
      case "buy":
        return "فروش";
      case "rent":
        return "اجاره";
      default:
        return type;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  // --- پالت رنگی صفحه ---
  // پس‌زمینه: کاغذی گرم و خنثی، متن: سرمه‌ای تیره (نه مشکی خالص)
  // رنگ شاخص: فیروزه‌ای تیره، الهام‌گرفته از کاشی‌کاری ایرانی — برای قیمت و اکشن اصلی
  // رنگ فرعی گرم: برای تگ «اجاره» و لمس‌های ثانویه
  const palette = {
    page: "#FAF8F4",
    ink: "#17242A",
    muted: "#6B6259",
    hair: "#E7E2D9",
    accent: "#0E6E64",
    accentDark: "#0B5B53",
    warm: "#B4763A",
    danger: "#B3462F",
  };

  if (loading) {
    return (
      <div
        className="max-w-5xl mx-auto p-6 mt-5 text-center"
        style={{ color: palette.ink }}
      >
        <div
          className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent mx-auto"
          style={{ borderColor: `${palette.accent}33`, borderTopColor: palette.accent }}
        ></div>
        <p className="mt-4" style={{ color: palette.muted }}>
          در حال بارگذاری آگهی...
        </p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div
        className="min-h-[70vh]"
        style={{ backgroundColor: palette.page, color: palette.ink }}
      >
        <div className="max-w-5xl mx-auto p-6 mt-5">
          <div className="flex justify-end">
            <button
              onClick={() => router.back()}
              className="mb-6 px-4 py-2 rounded-xl flex items-center gap-2.5 transition-colors border"
              style={{ borderColor: palette.hair, color: palette.ink }}
            >
              بازگشت
              <IoArrowBack />
            </button>
          </div>
          <div className="text-center py-16">
            <svg
              className="w-14 h-14 mx-auto mb-4"
              fill="none"
              stroke={palette.danger}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.282 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-xl mb-2 font-bold">{error || "آگهی پیدا نشد"}</p>
            <p className="mb-8" style={{ color: palette.muted }}>
              آگهی مورد نظر وجود ندارد یا حذف شده است.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg border transition-colors"
                style={{ borderColor: palette.hair }}
              >
                بازگشت
              </button>
              <Link
                href="/"
                className="px-6 py-2.5 rounded-lg text-white transition-colors inline-block"
                style={{ backgroundColor: palette.accent }}
              >
                صفحه اصلی
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isBuy = property.type === "buy";

  return (
    <div style={{ backgroundColor: palette.page, color: palette.ink }}>
      <div className="max-w-5xl mx-auto p-4 md:p-6 mt-5 pb-28 lg:pb-6">
        {/* هدر صفحه */}
        <div className="flex justify-between items-center mb-5">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border"
            style={{ borderColor: palette.hair }}
          >
            <IoArrowBack />
            بازگشت
          </button>

          <button
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              alert("لینک کپی شد!");
            }}
            className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border text-sm"
            style={{ borderColor: palette.hair, color: palette.muted }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            کپی لینک
          </button>
        </div>

        {/* گالری اصلی — تصویر تمام‌عرض با عنوان و قیمت روی خودِ تصویر */}
        {property.images && property.images.length > 0 ? (
          <div className="space-y-3 mb-6">
            <div
              className="relative w-full h-[52vh] md:h-[62vh] max-h-[560px] rounded-2xl overflow-hidden bg-black cursor-zoom-in group"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={property.images[index]}
                alt={property.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.jpg";
                }}
              />

              {/* سایه‌روشن پایین تصویر برای خوانایی عنوان */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

              {/* آیکون بزرگ‌نمایی */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none">
                <div className="opacity-0 group-hover:opacity-100 bg-white/90 p-3 rounded-full transition-opacity">
                  <MdZoomIn size={26} />
                </div>
              </div>

              {/* عنوان و برچسب معامله، روی خودِ تصویر */}
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 flex items-end justify-between gap-3 pointer-events-none">
                <div>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs mb-2 border border-white/30 bg-white/10 backdrop-blur-sm text-white"
                  >
                    {getDealTypeText(property.type)}
                  </span>
                  <h1 className="text-xl md:text-2xl font-bold text-white leading-snug drop-shadow-sm">
                    {property.title}
                  </h1>
                </div>
              </div>

              {/* دکمه‌های ناوبری */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIndex((i) =>
                        i === 0 ? property.images!.length - 1 : i - 1,
                      );
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                    aria-label="تصویر قبلی"
                  >
                    <GrFormPrevious size={22} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIndex((i) =>
                        i === property.images!.length - 1 ? 0 : i + 1,
                      );
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                    aria-label="تصویر بعدی"
                  >
                    <MdNavigateNext size={22} />
                  </button>

                  <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
                    {index + 1} / {property.images.length}
                  </div>
                </>
              )}
            </div>

            {/* گالری کوچک */}
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
                    style={{
                      borderColor: i === index ? palette.accent : palette.hair,
                    }}
                  >
                    <img
                      src={img}
                      alt={`thumbnail-${i}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            className="text-center py-10 rounded-2xl mb-6 border"
            style={{ borderColor: palette.hair }}
          >
            <svg
              className="w-14 h-14 mx-auto mb-2"
              fill="none"
              stroke={palette.muted}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p style={{ color: palette.muted }}>تصویری برای نمایش وجود ندارد</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ستون اصلی — آدرس، متراژ، توضیحات */}
          <div className="lg:w-2/3">
            {/* اطلاعات کلی: متراژ و تاریخ ثبت، بدون باکس، با یک خط جداکننده‌ی عمودی */}
            {(property.meter || property.created_at) && (
              <div
                className="flex flex-wrap items-center gap-5 pb-5 mb-5 border-b"
                style={{ borderColor: palette.hair, color: palette.muted }}
              >
                {property.meter && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{property.meter} متر</span>
                  </div>
                )}

                {property.meter && property.created_at && (
                  <div className="w-px h-4" style={{ backgroundColor: palette.hair }} />
                )}

                {property.created_at && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>ثبت شده در {formatDate(property.created_at)}</span>
                  </div>
                )}
              </div>
            )}

            {/* آدرس */}
            {property.address && (
              <div className="pb-5 mb-5 border-b" style={{ borderColor: palette.hair }}>
                <div className="flex items-start gap-2.5">
                  <svg
                    className="w-5 h-5 mt-1 flex-shrink-0"
                    fill="none"
                    stroke={palette.accent}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold mb-1">آدرس</h3>
                    <p style={{ color: palette.muted }}>{property.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* توضیحات */}
            {property.description && (
              <div>
                <h3 className="font-semibold mb-2.5">توضیحات</h3>
                <p className="leading-relaxed whitespace-pre-line" style={{ color: palette.muted }}>
                  {property.description}
                </p>
              </div>
            )}
          </div>

          {/* ستون کناری — قیمت و تماس، به‌صورت sticky در دسکتاپ */}
          <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* پنل قیمت — تنها بخش پررنگ صفحه */}
              <div
                className="rounded-2xl p-6 text-white"
                style={{ backgroundColor: palette.accent }}
              >
                {isBuy ? (
                  <div>
                    <p className="text-sm text-white/70 mb-1">قیمت فروش</p>
                    <div className="text-3xl font-bold">{formatPrice(property.price)}</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-white/70 mb-1">اجاره ماهانه</p>
                      <div className="text-2xl font-bold">{formatPrice(property.rent)}</div>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <p className="text-sm text-white/70 mb-1">ودیعه</p>
                      <div className="text-xl font-semibold">{formatPrice(property.deposit)}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* پنل تماس — کم‌رنگ و ساده، بدون سایه‌ی تکراری */}
              {property.phone && (
                <div className="rounded-2xl p-6 border" style={{ borderColor: palette.hair }}>
                  <h3 className="font-semibold mb-3">اطلاعات تماس</h3>
                  <div
                    className="flex items-center gap-2.5 pb-4 mb-4 border-b"
                    style={{ borderColor: palette.hair }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke={palette.muted} viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="font-semibold">{property.phone}</span>
                  </div>
                  <button
                    onClick={() => window.open(`tel:${property.phone}`)}
                    className="w-full py-3 rounded-lg font-semibold text-white transition-colors"
                    style={{ backgroundColor: palette.accent }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = palette.accentDark)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = palette.accent)}
                  >
                    تماس بگیرید
                  </button>
                </div>
              )}

              <button
                onClick={() => router.push("/")}
                className="w-full py-2.5 rounded-lg border transition-colors text-sm"
                style={{ borderColor: palette.hair, color: palette.muted }}
              >
                آگهی‌های دیگر
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* نوار پایین چسبان در موبایل — دسترسی سریع به قیمت و تماس */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 border-t bg-white/95 backdrop-blur-sm p-3 flex items-center justify-between gap-3 z-40"
        style={{ borderColor: palette.hair }}
      >
        <div>
          <p className="text-xs" style={{ color: palette.muted }}>
            {isBuy ? "قیمت فروش" : "اجاره ماهانه"}
          </p>
          <p className="font-bold" style={{ color: palette.ink }}>
            {formatPrice(isBuy ? property.price : property.rent)}
          </p>
        </div>
        {property.phone ? (
          <button
            onClick={() => window.open(`tel:${property.phone}`)}
            className="px-6 py-2.5 rounded-lg font-semibold text-white"
            style={{ backgroundColor: palette.accent }}
          >
            تماس بگیرید
          </button>
        ) : (
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 rounded-lg font-semibold text-white"
            style={{ backgroundColor: palette.accent }}
          >
            آگهی‌های دیگر
          </button>
        )}
      </div>

      {/* لایت‌باکس - نمایش تمام‌صفحه‌ی تصویر با کلیک */}
      {property.images && property.images.length > 0 && (
        <ImageLightbox
          images={property.images}
          index={index}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setIndex}
          title={property.title}
        />
      )}
    </div>
  );
}