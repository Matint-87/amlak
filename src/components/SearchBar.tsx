"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";

function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [meterMin, setMeterMin] = useState("");
  const [meterMax, setMeterMax] = useState("");
  const [open, setOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (location.trim()) params.set("location", location.trim());
    if (meterMin) params.set("meterMin", meterMin);
    if (meterMax) params.set("meterMax", meterMax);

    router.push(`/search?${params.toString()}`);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-white text-[#0BA6DF] mobile:px-3 tablet:px-4 py-2 rounded font-semibold shadow-md"
      >
        <FaMagnifyingGlass />
        <span className="mobile:hidden tablet:inline">جستجو</span>
      </button>

      {open && (
        <div className="absolute top-[calc(100%+10px)] left-0 laptop:left-auto laptop:right-0 bg-white shadow-xl rounded-lg p-4 w-[300px] z-50 flex flex-col gap-3">
          <input
            type="text"
            placeholder="عنوان، آدرس یا توضیحات..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="لوکیشن (مثلا ولیعصر)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="متراژ از"
              value={meterMin}
              onChange={(e) => setMeterMin(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-1/2"
            />
            <input
              type="number"
              placeholder="متراژ تا"
              value={meterMax}
              onChange={(e) => setMeterMax(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-1/2"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-[#0BA6DF] text-white rounded py-2 text-sm font-semibold"
          >
            جستجو کن
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchBar;