"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface FilterBarProps {
  defaultType?: string;
}

export default function FilterBar({ defaultType = "buy" }: FilterBarProps) {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const [meter, setMeter] = useState("");

  useEffect(() => {
    const meterParam = searchParams.get('meter');
    if (meterParam) {
      setMeter(meterParam);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMeter(value);
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set("meter", value);
    } else {
      params.delete("meter");
    }
    
    router.push(`${pathName}${params.toString() ? `?${params.toString()}` : ''}`, { 
      scroll: false 
    });
  };

  const resetFilter = () => {
    setMeter("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("meter");
    router.push(`${pathName}${params.toString() ? `?${params.toString()}` : ''}`, { 
      scroll: false 
    });
  };

  if (pathName === "/") return null;

  const pageTitle = defaultType === "rent" ? "اجاره" : "فروش";

  return (
    <div className="w-[300px]">
      <div className="hidden md:flex flex-col lg:flex-row items-center justify-between gap-3 md:gap-4 lg:gap-6 p-4 md:p-5 lg:p-6 bg-white shadow-sm md:shadow rounded-lg mx-2 sm:mx-4 md:mx-6 lg:mx-8 mb-4 md:mb-6">
        {/* عنوان */}
        <div className="text-base md:text-lg lg:text-xl font-semibold text-gray-800 mb-3 md:mb-0 w-full md:w-auto text-center md:text-right">
          فیلتر آگهی‌های {pageTitle}
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <label className="block text-xs md:text-sm text-gray-600 mb-1 md:mb-2 font-medium">
              حداقل متراژ
            </label>
            <select
              value={meter}
              onChange={handleChange}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 lg:py-3 text-sm md:text-base lg:text-lg text-gray-800 rounded-lg border border-gray-300 focus:border-[#DC143C] focus:ring-2 focus:ring-[#DC143C]/20 focus:ring-offset-1 outline-none transition-all duration-200 appearance-none bg-white pr-10 cursor-pointer hover:border-gray-400"
            >
              <option value="" className="text-gray-500">همه متراژها</option>
              <option value="50">۵۰ متر به بالا</option>
              <option value="70">۷۰ متر به بالا</option>
              <option value="90">۹۰ متر به بالا</option>
              <option value="120">۱۲۰ متر به بالا</option>
              <option value="150">۱۵۰ متر به بالا</option>
              <option value="200">۲۰۰ متر به بالا</option>
            </select>
            <div className="absolute left-3 top-1/2 md:top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row gap-2 md:gap-3 mt-1 md:mt-6">
            {meter && (
              <button
                onClick={resetFilter}
                className="px-4 md:px-5 py-2 md:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 md:gap-2 shadow-sm hover:shadow"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>حذف فیلتر</span>
              </button>
            )}
            <button
              onClick={() => {
                // اگر می‌خواهید عملیات خاصی انجام شود
                console.log('فیلتر اعمال شد');
              }}
              className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow ${
                meter 
                  ? 'bg-[#DC143C] hover:bg-[#B01030] text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {meter ? 'اعمال فیلتر' : 'مشاهده همه'}
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden bg-white shadow rounded-lg mx-3 mb-4 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
          onClick={() => {
            const mobileMenu = document.getElementById('mobile-filter-menu');
            if (mobileMenu) {
              mobileMenu.classList.toggle('hidden');
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">
                فیلتر آگهی‌های {pageTitle}
              </h3>
              {meter ? (
                <p className="text-xs text-gray-600 mt-0.5">
                  فیلتر فعال: حداقل {meter} متر
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-0.5">
                  برای فیلتر کردن لمس کنید
                </p>
              )}
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-500 transition-transform duration-200" id="mobile-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div id="mobile-filter-menu" className="hidden animate-slideDown">
          <div className="p-4 border-t border-gray-200">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حداقل متراژ ملک
              </label>
              <select
                value={meter}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base text-gray-800 rounded-lg border border-gray-300 focus:border-[#DC143C] focus:ring-2 focus:ring-[#DC143C]/20 outline-none transition-all duration-200 appearance-none bg-white"
              >
                <option value="" className="text-gray-500">انتخاب متراژ</option>
                <option value="50">۵۰ متر به بالا</option>
                <option value="70">۷۰ متر به بالا</option>
                <option value="90">۹۰ متر به بالا</option>
                <option value="120">۱۲۰ متر به بالا</option>
                <option value="150">۱۵۰ متر به بالا</option>
                <option value="200">۲۰۰ متر به بالا</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              {meter && (
                <button
                  onClick={resetFilter}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  حذف فیلتر
                </button>
              )}
              <button
                onClick={() => {
                  const mobileMenu = document.getElementById('mobile-filter-menu');
                  if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                  }
                }}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                  meter 
                    ? 'bg-[#DC143C] hover:bg-[#B01030] text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {meter ? 'اعمال فیلتر' : 'بستن'}
              </button>
            </div>

            {meter && (
              <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-green-800">
                    <span className="font-medium">فیلتر فعلی:</span> نمایش آگهی‌های با متراژ {meter} متر و بیشتر
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {meter && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-blue-800">
                  فیلتر: حداقل {meter} متر
                </span>
              </div>
              <button
                onClick={resetFilter}
                className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            max-height: 0;
            opacity: 0;
          }
          to {
            max-height: 500px;
            opacity: 1;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}