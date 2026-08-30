"use client";

import Image from "next/image";
// import { useEffect, useState } from "react";

export default function Hero() {
  // const [counts, setCounts] = useState(0);

  // const getCount = async () => {
  //   try {
  //     const res = await fetch("/api/properties?count=1", { cache: "no-store" });
  //     if (!res.ok) throw new Error("خطا در دریافت تعداد آگهی‌ها");
  //     const data = await res.json();
  //     setCounts(data.count ?? 0);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // useEffect(() => {
  //   getCount();
  // }, []);

  return (
    <div className="relative font-[Number] w-full h-[550px] md:h-[450px] overflow-hidden shadow-lg">
      <Image src="/hero.jpg" alt="خانه رویایی" fill className="object-cover" />

      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
        <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg">
          خانه رویایی خود را پیدا کنید
        </h1>
        <p className="text-sm md:text-lg mt-3 opacity-90">
          املاک برتر را در بهترین مناطق کشف کنید
        </p>
        {/* <div className="hover:bg-[#2b2b2b] select-none text-xs hover:text-white duration-300 bg-white px-5 py-2 font-bold rounded-3xl text-[#2b2b2b] flex justify-center items-center mt-3">
          <span>بیش از {counts} ملک موجود</span>
        </div> */}
      </div>
    </div>
  );
}
