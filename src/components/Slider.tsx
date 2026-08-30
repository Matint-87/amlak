"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

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

// مقدار null/undefined یعنی اصلاً ثبت نشده، ۰ یعنی «توافقی»
function formatAmount(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  if (value === 0) return "توافقی";
  return value.toLocaleString("fa-IR") + " تومان";
}

export default function Slider({ ads }: { ads: Ad[] }) {
  const getFirstImage = (images: string[] | string) => {
    if (!images) return "/hero.jpg";
    if (Array.isArray(images)) return images[0] || "/hero.jpg";
    try {
      const arr = JSON.parse(images);
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : "/hero.jpg";
    } catch {
      return "/hero.jpg";
    }
  };

  return (
    <Swiper
      breakpoints={{
        0: {
          slidesPerView: 1.5,
          spaceBetween: 0,
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 10,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 10,
        },
        1500: {
          slidesPerView: 4,
          spaceBetween: 10,
        },
      }}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      modules={[Navigation, Autoplay]}
      className="mySwiper"
      loop
    >
      {ads.map((p) => (
        <SwiperSlide key={p.id}>
          <Link href={`/property/${p.id}`}>
            <div className="flex flex-col p-2 h-[350px] bg-white shadow-2xl">
              <Image
                src={getFirstImage(p.images)}
                width={300}
                height={200}
                alt={p.title || "Property Image"}
                className="rounded-md w-[300px] h-[220px]"
              />
              <div className="flex flex-col items-start h-[130px] justify-between mt-2">
                <div className="flex flex-col items-start">
                  <span className="text-lg font-semibold">{p.title}</span>
                  <span className="text-sm mt-1 text-gray-600">
                    {p.address}
                  </span>
                </div>
                {p.type === "buy" ? (
                  <p className="text-base font-semibold mt-3">
                    <b>قیمت خرید:</b> {formatAmount(p.price)}
                  </p>
                ) : (
                  <>
                    <p className="text-sm mt-3">
                      <b>رهن:</b> {formatAmount(p.deposit)}
                    </p>
                    <p className="text-sm">
                      <b>اجاره ماهیانه:</b> {formatAmount(p.rent)}
                    </p>
                  </>
                )}
              </div>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}