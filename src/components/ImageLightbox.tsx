"use client";

import { useEffect, useCallback } from "react";
import { MdNavigateNext, MdClose } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";

interface ImageLightboxProps {
  images: string[];
  index: number; // ایندکس تصویر فعلی (کنترل‌شده از بیرون)
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (newIndex: number) => void;
  title?: string;
}

export default function ImageLightbox({
  images,
  index,
  isOpen,
  onClose,
  onIndexChange,
  title,
}: ImageLightboxProps) {
  const goPrev = useCallback(() => {
    if (!images.length) return;
    onIndexChange(index === 0 ? images.length - 1 : index - 1);
  }, [images.length, index, onIndexChange]);

  const goNext = useCallback(() => {
    if (!images.length) return;
    onIndexChange(index === images.length - 1 ? 0 : index + 1);
  }, [images.length, index, onIndexChange]);

  // بستن با ESC و جابجایی با کلیدهای جهت‌دار (چپ/راست)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    // جلوگیری از اسکرول پس‌زمینه وقتی لایت‌باکس بازه
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, goPrev, goNext, onClose]);

  if (!isOpen || !images || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center"
      onClick={onClose} // کلیک روی پس‌زمینه، مودال رو می‌بنده
    >
      {/* دکمه بستن */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
        aria-label="بستن"
      >
        <MdClose size={28} />
      </button>

      {/* شمارنده تصاویر */}
      <div className="absolute top-4 left-4 z-10 bg-white/10 text-white px-3 py-1 rounded-full text-sm">
        {index + 1} / {images.length}
      </div>

      {/* عنوان ملک (اختیاری) */}
      {title && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 text-white px-4 py-2 rounded-full text-sm max-w-[90%] truncate">
          {title}
        </div>
      )}

      {/* دکمه‌های ناوبری قبلی/بعدی */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            aria-label="تصویر قبلی"
          >
            <GrFormPrevious size={28} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            aria-label="تصویر بعدی"
          >
            <MdNavigateNext size={28} />
          </button>
        </>
      )}

      {/* تصویر اصلی، تمام‌صفحه و کامل بدون برش */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4 md:p-10"
        onClick={(e) => e.stopPropagation()} // کلیک روی خود تصویر مودال رو نبنده
      >
        <img
          src={images[index]}
          alt={title || `تصویر ${index + 1}`}
          className="max-w-full max-h-full object-contain select-none"
        />
      </div>

      {/* نوار کوچک تصاویر پایین صفحه برای پرش سریع */}
      {images.length > 1 && (
        <div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-2 overflow-x-auto max-w-[90%] px-2"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onIndexChange(i)}
              className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === index
                  ? "border-white"
                  : "border-white/30 hover:border-white/60"
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
  );
}