import Location from "./Location";

export default function About() {
  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-6xl flex mobile:flex-col mobile:items-center laptop:items-start laptop:flex-row gap-10">
        <div className="space-y-4 text-right mobile:px-10 laptop:px-0">
          <h2 className="text-2xl font-bold">
            همراه مطمئن شما در معاملات ملکی
          </h2>
          <p className="text-gray-600 leading-relaxed laptop:w-[500px]">
            چه خریدار اولین خانه خود باشید، چه به دنبال سرمایه‌گذاری هوشمند،
            یا قصد فروش سریع و بهینه ملک خود را داشته باشید،
            ابزارها و همراهی متخصصان ما در تمام این مسیر کنار شماست.
          </p>
        </div>
        <div className="mobile:px-10 laptop:px-0 w-full h-[300px] overflow-hidden rounded-lg">
            <Location/>
        </div>
      </div>
    </section>
  );
}
