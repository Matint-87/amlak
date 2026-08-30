"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import {
  HiOutlineLocationMarker,
  HiOutlineArrowLeft,
} from "react-icons/hi";

interface Ad {
  id: number;
  title: string;
  address: string;
  type: string;
  price?: number | null;
  rent?: number | null;
  deposit?: number | null;
  images: string[] | string;
}

// null / undefined = ثبت نشده
// 0 = توافقی
function formatAmount(value: number | null | undefined): string {
  if (value === null || value === undefined) return "ثبت نشده";
  if (value === 0) return "توافقی";

  return value.toLocaleString("fa-IR") + " تومان";
}

export default function Slider({ ads }: { ads: Ad[] }) {
  const getFirstImage = (images: string[] | string) => {
    if (!images) return "/hero.jpg";

    if (Array.isArray(images)) {
      return images[0] || "/hero.jpg";
    }

    try {
      const arr = JSON.parse(images);

      return Array.isArray(arr) && arr.length > 0
        ? arr[0]
        : "/hero.jpg";
    } catch {
      return "/hero.jpg";
    }
  };

  return (
    <Swiper
      dir="rtl"
      breakpoints={{
        0: {
          slidesPerView: 1.15,
          spaceBetween: 12,
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 16,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 18,
        },
        1500: {
          slidesPerView: 4,
          spaceBetween: 20,
        },
      }}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
      }}
      modules={[Autoplay]}
      className="property-swiper !px-1 !py-4"
      loop={ads.length > 4}
    >
      {ads.map((p) => {
        const isBuy = p.type === "buy";

        return (
          <SwiperSlide key={p.id}>
            <Link
              href={`/property/${p.id}`}
              className="group block h-full"
            >
              <article className="relative flex h-full min-h-[390px] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                
                {/* Image */}
                <div className="relative h-[220px] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={getFirstImage(p.images)}
                    fill
                    sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw"
                    alt={p.title || "تصویر ملک"}
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Badge */}
                  <div
                    className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md ${
                      isBuy
                        ? "bg-blue-600/90"
                        : "bg-emerald-600/90"
                    }`}
                  >
                    {isBuy ? "فروش" : "رهن و اجاره"}
                  </div>

                  {/* Price on image */}
                  <div className="absolute bottom-3 right-4 left-4">
                    <p className="text-lg font-bold text-white drop-shadow-md">
                      {isBuy
                        ? formatAmount(p.price)
                        : formatAmount(p.deposit)}
                    </p>

                    {!isBuy && (
                      <p className="mt-1 text-xs text-gray-200">
                        + {formatAmount(p.rent)} اجاره ماهیانه
                      </p>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  {/* Title */}
                  <h3 className="line-clamp-1 text-base font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                    {p.title}
                  </h3>

                  {/* Address */}
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                    <HiOutlineLocationMarker className="shrink-0 text-red-500" />

                    <span className="line-clamp-1">
                      {p.address}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="my-4 h-px w-full bg-gray-100" />

                  {/* Prices */}
                  <div className="mt-auto">
                    {isBuy ? (
                      <div>
                        <span className="text-xs text-gray-400">
                          قیمت کل ملک
                        </span>

                        <p className="mt-1 text-base font-bold text-gray-900">
                          {formatAmount(p.price)}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-gray-50 p-2.5">
                          <span className="text-xs text-gray-400">
                            مبلغ رهن
                          </span>

                          <p className="mt-1 line-clamp-1 text-sm font-bold text-gray-800">
                            {formatAmount(p.deposit)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 p-2.5">
                          <span className="text-xs text-gray-400">
                            اجاره ماهیانه
                          </span>

                          <p className="mt-1 line-clamp-1 text-sm font-bold text-gray-800">
                            {formatAmount(p.rent)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-xs text-gray-400">
                      مشاهده جزئیات
                    </span>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                      <HiOutlineArrowLeft className="text-lg" />
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
