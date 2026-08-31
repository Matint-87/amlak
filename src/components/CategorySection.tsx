"use client";

import { useRouter } from "next/navigation";
import { FaBuilding, FaHouseChimney } from "react-icons/fa6";
import { GiCrane } from "react-icons/gi";
import { MdStorefront, MdOutlineConstruction } from "react-icons/md";

interface Category {
  label: string;
  icon: React.ReactNode;
  keywords: string[];
}

const categories: Category[] = [
  {
    label: "آپارتمان",
    icon: <FaBuilding size={26} />,
    keywords: ["آپارتمان"],
  },
  {
    label: "خانه و ویلا",
    icon: <FaHouseChimney size={26} />,
    keywords: ["خانه", "ویلا"],
  },
  {
    label: "زمین",
    icon: <MdStorefront size={26} />,
    keywords: ["زمین"],
  },
  {
    label: "تجاری",
    icon: <GiCrane size={26} />,
    keywords: ["تجاری", "مغازه", "اداری"],
  },
  {
    label: "پیش‌فروش",
    icon: <MdOutlineConstruction size={26} />,
    keywords: ["پیش فروش", "پیش‌فروش", "پیشفروش"],
  },
];

function CategorySection() {
  const router = useRouter();

  const handleClick = (category: Category) => {
    const params = new URLSearchParams();
    params.set("titleAny", category.keywords.join(","));
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full flex flex-col gap-4 px-4 my-[50px]">
      <div className="flex items-center gap-2">
        <span className="w-2 h-6 bg-[#DC143C] rounded-full" />
        <h2 className="text-lg font-bold text-[#0a1e3f]">دسته‌بندی املاک</h2>
      </div>

      <div className="grid grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-5 gap-3">
        {categories.map((category) => (
          <button
            key={category.label}
            onClick={() => handleClick(category)}
            className="group flex flex-col items-center justify-center gap-3 bg-white border border-gray-100 rounded-2xl py-6 px-3 shadow-sm hover:shadow-md hover:border-[#0BA6DF]/30 transition-all duration-200"
          >
            <div className="text-[#0a1e3f] group-hover:text-[#0BA6DF] transition-colors">
              {category.icon}
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0a1e3f]">
              {category.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategorySection;