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
    const fetchProperty = async () => {
      const rawSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

      if (!rawSlug) {
        setError("آدرس آگهی مشخص نشده است");
        setLoading(false);
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
          setError("آگهی پیدا نشد");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          setError("خطا در دریافت اطلاعات");
          setLoading(false);
          return;
        }

        const { data, redirectSlug } = await res.json();

        if (redirectSlug && redirectSlug !== slug) {
          // لینک قدیمی بود (id به‌جای slug)، به آدرس درست redirect کن
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
      } catch (err: any) {
        console.error("خطای غیرمنتظره:", err);
        setError("خطا در دریافت اطلاعات");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 mt-5 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">در حال بارگذاری آگهی...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-5xl mx-auto p-6 mt-5">
        <div className="flex justify-end">
          <button
            onClick={() => router.back()}
            className="mb-6 px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 flex items-center gap-2.5"
          >
            بازگشت
            <IoArrowBack />
          </button>
        </div>
        <div className="text-center py-10">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.282 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-red-500 text-xl mb-4">
            {error || "آگهی پیدا نشد"}
          </p>
          <p className="text-gray-600 mb-6">
            آگهی مورد نظر وجود ندارد یا حذف شده است.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
            >
              بازگشت
            </button>
            <Link
              href="/"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 mt-5">
      {/* هدر صفحه */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2 transition-colors"
        >
          <IoArrowBack />
          بازگشت
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* سایدبار سمت راست - اطلاعات کلی */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* گالری تصاویر */}
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-4">
                تصاویر ({property.images?.length || 0})
              </h3>

              {property.images && property.images.length > 0 ? (
                <div className="space-y-4">
                  {/* تصویر اصلی - اندازه بزرگ‌تر شد تا واضح‌تر دیده شود */}
                  <div
                    className="relative w-full h-80 sm:h-[420px] md:h-[550px] lg:h-[600px] rounded-xl overflow-hidden bg-gray-100 cursor-zoom-in group"
                    onClick={() => setLightboxOpen(true)}
                  >
                    {/* پس‌زمینه محو‌شده از خود تصویر، برای پر کردن فضای خالی بدون برش زدن عکس اصلی */}
                    <img
                      src={property.images[index]}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
                    />
                    {/* تصویر اصلی، کامل و بدون برش نمایش داده می‌شود */}
                    <img
                      src={property.images[index]}
                      alt={property.title}
                      className="relative w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.jpg";
                      }}
                    />

                    {/* آیکون بزرگ‌نمایی، برای اطلاع کاربر که تصویر قابل کلیک است */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none">
                      <div className="opacity-0 group-hover:opacity-100 bg-white/90 p-3 rounded-full transition-opacity">
                        <MdZoomIn size={28} />
                      </div>
                    </div>

                    {/* دکمه‌های ناوبری */}
                    {property.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // نذاره کلیک روی دکمه، لایت‌باکس رو باز کنه
                            setIndex((i) =>
                              i === 0 ? property.images!.length - 1 : i - 1,
                            );
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                          aria-label="تصویر قبلی"
                        >
                          <GrFormPrevious size={24} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIndex((i) =>
                              i === property.images!.length - 1 ? 0 : i + 1,
                            );
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                          aria-label="تصویر بعدی"
                        >
                          <MdNavigateNext size={24} />
                        </button>
                      </>
                    )}

                    {/* شمارنده */}
                    {property.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {index + 1} / {property.images.length}
                      </div>
                    )}
                  </div>

                  {/* گالری کوچک */}
                  {property.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {property.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setIndex(i)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            i === index
                              ? "border-blue-500"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
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
                <div className="text-center py-8 bg-gray-100 rounded-xl">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-500">تصویری برای نمایش وجود ندارد</p>
                </div>
              )}
            </div>
            {/* عنوان و تگ */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {property.title}
                </h1>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded ${
                    property.type === "buy"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {getDealTypeText(property.type)}
                </span>
              </div>

              {/* اطلاعات کلی */}
              <div className="flex flex-wrap gap-4 text-gray-600">
                {property.meter && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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

                {property.created_at && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>ثبت شده در: {formatDate(property.created_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* آدرس */}
            {property.address && (
              <div className="p-6 border-b">
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 ml-2 text-gray-500 mt-1 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
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
                    <h3 className="font-semibold text-lg mb-1">آدرس</h3>
                    <p className="text-gray-700">{property.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* توضیحات */}
            {property.description && (
              <div className="p-6 border-b">
                <h3 className="font-semibold text-lg mb-3">توضیحات</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* سایدبار سمت چپ - اطلاعات قیمت و تماس */}
        <div className="lg:w-1/3">
          {/* کارت قیمت */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-xl mb-4 text-center">قیمت</h3>

            {property.type === "buy" ? (
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatPrice(property.price)}
                </div>
                <p className="text-gray-600">قیمت فروش</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {formatPrice(property.rent)}
                  </div>
                  <p className="text-gray-600">اجاره ماهانه</p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold text-gray-700 mb-1">
                    {formatPrice(property.deposit)}
                  </div>
                  <p className="text-gray-600">ودیعه</p>
                </div>
              </div>
            )}
          </div>

          {/* کارت اطلاعات تماس */}
          {property.phone && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="font-bold text-xl mb-4">اطلاعات تماس</h3>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-lg font-semibold">{property.phone}</span>
              </div>

              <button
                onClick={() => window.open(`tel:${property.phone}`)}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                تماس بگیرید
              </button>
            </div>
          )}

          {/* اشتراک گذاری */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-xl mb-4">اشتراک گذاری</h3>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  alert("لینک کپی شد!");
                }}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                کپی لینک
              </button>

              <button
                onClick={() => router.push("/")}
                className="flex-1 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                آگهی‌های دیگر
              </button>
            </div>
          </div>
        </div>
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