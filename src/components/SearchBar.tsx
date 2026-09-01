"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaMagnifyingGlass, FaHouseChimney, FaKey } from "react-icons/fa6";
import {
  HiOutlineLocationMarker,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineArrowsExpand,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";

function SearchBar() {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [meterMin, setMeterMin] = useState("");
  const [meterMax, setMeterMax] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [type, setType] = useState<"all" | "buy" | "rent">("all");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const hasFilters =
    q.trim() ||
    location.trim() ||
    meterMin ||
    meterMax ||
    priceMin ||
    priceMax ||
    type !== "all";

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (location.trim()) params.set("location", location.trim());
    if (meterMin) params.set("meterMin", meterMin);
    if (meterMax) params.set("meterMax", meterMax);
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (type !== "all") params.set("type", type);

    router.push(`/search?${params.toString()}`);
    setOpen(false);
  };

  const handleReset = () => {
    setQ("");
    setLocation("");
    setMeterMin("");
    setMeterMax("");
    setPriceMin("");
    setPriceMax("");
    setType("all");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const priceLabel = type === "rent" ? "رهن (تومان)" : "قیمت (تومان)";

  return (
    <div ref={wrapperRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`relative flex items-center gap-2 mobile:px-3 tablet:px-5 py-2.5 rounded-full font-semibold shadow-md transition-all duration-200 ${
          open || hasFilters
            ? "bg-[#0BA6DF] text-white shadow-[#0BA6DF]/30"
            : "bg-white text-[#0BA6DF] hover:shadow-lg"
        }`}
      >
        <FaMagnifyingGlass className={open ? "animate-pulse" : ""} />
        <span className="mobile:hidden tablet:inline">جستجو</span>
        {hasFilters && (
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
        )}
      </button>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 laptop:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`
          fixed z-50 bg-white shadow-2xl ring-1 ring-black/5
          mobile:top-[110px] mobile:left-3 mobile:right-3 mobile:rounded-2xl mobile:w-auto
          tablet:absolute tablet:top-[calc(100%+12px)] tablet:left-auto tablet:right-0
          tablet:w-[320px] tablet:rounded-2xl
          p-5 flex flex-col gap-4 origin-top
          transition-all duration-200 max-h-[80vh] overflow-y-auto
          ${
            open
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }
        `}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <HiOutlineSearch className="text-[#0BA6DF]" size={20} />
            جستجوی ملک
          </h3>
          <div className="flex items-center gap-3">
            {hasFilters && (
              <button
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <HiOutlineX size={14} />
                پاک کردن
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="laptop:hidden text-gray-400 hover:text-gray-600"
            >
              <HiOutlineX size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 bg-gray-50 p-1 rounded-xl">
          {[
            { key: "all", label: "همه", icon: null },
            { key: "buy", label: "خرید", icon: <FaHouseChimney size={12} /> },
            { key: "rent", label: "اجاره", icon: <FaKey size={12} /> },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setType(item.key as typeof type)}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                type === item.key
                  ? "bg-white text-[#0BA6DF] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <HiOutlineSearch
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="عنوان، آدرس یا توضیحات..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border border-gray-200 rounded-xl pr-9 pl-3 py-2.5 text-sm outline-none focus:border-[#0BA6DF] focus:ring-2 focus:ring-[#0BA6DF]/15 transition-all"
          />
        </div>

        <div className="relative">
          <HiOutlineLocationMarker
            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400"
            size={16}
          />
          <input
            type="text"
            placeholder="لوکیشن (مثلا ولیعصر)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border border-gray-200 rounded-xl pr-9 pl-3 py-2.5 text-sm outline-none focus:border-[#0BA6DF] focus:ring-2 focus:ring-[#0BA6DF]/15 transition-all"
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5 mr-1">
            <HiOutlineArrowsExpand size={14} />
            متراژ (متر مربع)
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="از"
              value={meterMin}
              onChange={(e) => setMeterMin(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0BA6DF] focus:ring-2 focus:ring-[#0BA6DF]/15 transition-all"
            />
            <span className="text-gray-300 text-sm">—</span>
            <input
              type="number"
              placeholder="تا"
              value={meterMax}
              onChange={(e) => setMeterMax(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0BA6DF] focus:ring-2 focus:ring-[#0BA6DF]/15 transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5 mr-1">
            <HiOutlineCurrencyDollar size={14} />
            {priceLabel}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="از"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0BA6DF] focus:ring-2 focus:ring-[#0BA6DF]/15 transition-all"
            />
            <span className="text-gray-300 text-sm">—</span>
            <input
              type="number"
              placeholder="تا"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-1/2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0BA6DF] focus:ring-2 focus:ring-[#0BA6DF]/15 transition-all"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="bg-[#0BA6DF] hover:bg-[#0994c9] text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#0BA6DF]/25 active:scale-[0.98]"
        >
          <FaMagnifyingGlass size={13} />
          جستجو کن
        </button>
      </div>
    </div>
  );
}

export default SearchBar;