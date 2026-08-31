import Location from "./Location";
import { HiOutlineShieldCheck, HiOutlineSparkles, HiOutlineUsers } from "react-icons/hi";

const features = [
  { icon: <HiOutlineShieldCheck size={20} />, text: "معاملات امن و مطمئن" },
  { icon: <HiOutlineSparkles size={20} />, text: "مشاوره تخصصی رایگان" },
  { icon: <HiOutlineUsers size={20} />, text: "سال‌ها تجربه در منطقه" },
];

export default function About() {
  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-6xl flex mobile:flex-col mobile:items-center laptop:items-center laptop:flex-row gap-12 mobile:px-6 laptop:px-0">
        <div className="space-y-5 text-right w-full laptop:w-1/2">
          <div className="flex items-center gap-2 justify-end laptop:justify-start">
            <span className="w-2 h-6 bg-[#DC143C] rounded-full" />
            <h2 className="text-2xl font-bold text-[#0a1e3f]">
              با اطمینان معامله کنید
            </h2>
          </div>

          <p className="text-gray-600 leading-loose laptop:w-[480px]">
            چه خریدار اولین خانه خود باشید، چه به دنبال سرمایه‌گذاری هوشمند، یا
            قصد فروش سریع و بهینه ملک خود را داشته باشید، ابزارها و همراهی
            متخصصان ما در تمام این مسیر کنار شماست.
          </p>

          <div className="flex flex-col gap-3 pt-2">
            {features.map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 justify-end laptop:justify-start"
              >
                <span className="text-sm font-medium text-gray-700">
                  {f.text}
                </span>
                <span className="text-[#0BA6DF] shrink-0">{f.icon}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full laptop:w-1/2 h-80 laptop:h-[380px]">
          <Location />
        </div>
      </div>
    </section>
  );
}