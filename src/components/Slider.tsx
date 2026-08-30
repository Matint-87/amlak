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

      return Array.isArray(arr) && arr.length
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
          slidesPerView: 1.25,
          spaceBetween: 10,
        },

        480: {
          slidesPerView: 1.6,
          spaceBetween: 12,
        },

        640: {
          slidesPerView: 2,
          spaceBetween: 14,
        },

        900: {
          slidesPerView: 2.5,
          spaceBetween: 14,
        },

        1100: {
          slidesPerView: 3,
          spaceBetween: 16,
        },

        1400: {
          slidesPerView: 3.3,
          spaceBetween: 16,
        },
      }}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
      }}
      modules={[Autoplay]}
      loop={ads.length > 3}
      className="!px-1 !py-3"
    >
      {ads.map((p) => {
        const isBuy = p.type === "buy";

        return (
          <SwiperSlide key={p.id}>
            <Link
              href={`/property/${p.id}`}
              className="group block"
            >
              <article
                className="
                  overflow-hidden
                  rounded-2xl
                  border border-gray-200
                  bg-white
                  h-[310px]
                "
              >
                {/* IMAGE */}
                <div className="relative h-[165px] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={getFirstImage(p.images)}
                    fill
                    alt={p.title || "تصویر ملک"}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                  {/* Type */}
                  <div
                    className={`
                      absolute
                      right-3
                      top-3
                      rounded-full
                      px-3
                      py-1
                      text-[11px]
                      font-bold
                      text-white
                      shadow-sm
                      backdrop-blur-sm
                      ${
                        isBuy
                          ? "bg-blue-600/90"
                          : "bg-emerald-600/90"
                      }
                    `}
                  >
                    {isBuy ? "فروش" : "رهن و اجاره"}
                  </div>

                  {/* Main price */}
                  <div className="absolute bottom-3 right-3">
                    <p className="text-sm font-bold text-white drop-shadow-md">
                      {isBuy
                        ? formatAmount(p.price)
                        : formatAmount(p.deposit)}
                    </p>

                    {!isBuy && (
                      <p className="mt-0.5 text-[10px] text-gray-200">
                        + {formatAmount(p.rent)} اجاره
                      </p>
                    )}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-3">
                  {/* Title */}
                  <h3 className="truncate text-[15px] font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                    {p.title}
                  </h3>

                  {/* Address */}
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                    <HiOutlineLocationMarker
                      className="shrink-0 text-red-500"
                      size={14}
                    />

                    <span className="truncate">
                      {p.address}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="my-3 h-px bg-gray-100" />

                  {/* PRICE */}
                  {isBuy ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">
                        قیمت کل
                      </span>

                      <span className="text-sm font-bold text-gray-800">
                        {formatAmount(p.price)}
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-gray-50 px-2 py-2">
                        <p className="text-[10px] text-gray-400">
                          رهن
                        </p>

                        <p className="mt-0.5 truncate text-xs font-bold text-gray-800">
                          {formatAmount(p.deposit)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-gray-50 px-2 py-2">
                        <p className="text-[10px] text-gray-400">
                          اجاره
                        </p>

                        <p className="mt-0.5 truncate text-xs font-bold text-gray-800">
                          {formatAmount(p.rent)}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </article>
            </Link>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}