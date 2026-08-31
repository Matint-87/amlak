import Link from "next/link";
import { FaTelegram, FaInstagram } from "react-icons/fa6";
import { HiOutlineLocationMarker, HiOutlinePhone } from "react-icons/hi";
import { MdOutlineRealEstateAgent } from "react-icons/md";

function Footer() {
  return (
    <footer className="w-full bg-[#0a1e3f] text-white mt-10" dir="rtl">
      <div className="max-w-7xl mx-auto mobile:w-full laptop:w-[70%] py-14 mobile:px-5 laptop:px-0">
        {/* هدر برند */}
        <div className="flex items-center gap-2.5 mb-10 pb-8 border-b border-white/10">
          <MdOutlineRealEstateAgent className="text-3xl text-[#0BA6DF]" />
          <span className="text-xl font-bold">املاک شاپور</span>
        </div>

        <div className="grid mobile:grid-cols-1 tablet:grid-cols-3 gap-10">
          {/* آدرس */}
          <div>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-white">
              <span className="w-1.5 h-5 bg-[#0BA6DF] rounded-full" />
              آدرس
            </h3>
            <div className="flex items-start gap-2.5 text-sm leading-7 text-gray-300">
              <HiOutlineLocationMarker
                className="shrink-0 mt-1 text-[#0BA6DF]"
                size={17}
              />
              <p>قرچک، کمربندی شمالی، باهنر بیست و پنجم، قرچک</p>
            </div>
          </div>

          {/* تماس */}
          <div>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-white">
              <span className="w-1.5 h-5 bg-[#0BA6DF] rounded-full" />
              تماس با ما
            </h3>
            <div className="flex flex-col gap-2.5 text-sm text-gray-300">
              <Link
                href="tel:09192394179"
                className="flex items-center gap-2.5 hover:text-[#0BA6DF] transition-colors w-fit"
              >
                <HiOutlinePhone className="shrink-0 text-[#0BA6DF]" size={17} />
                09192394179
              </Link>
              <Link
                href="tel:09109933440"
                className="flex items-center gap-2.5 hover:text-[#0BA6DF] transition-colors w-fit"
              >
                <HiOutlinePhone className="shrink-0 text-[#0BA6DF]" size={17} />
                09109933440
              </Link>
            </div>
          </div>

          {/* شبکه‌های اجتماعی */}
          <div>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-white">
              <span className="w-1.5 h-5 bg-[#0BA6DF] rounded-full" />
              شبکه‌های مجازی
            </h3>
            <div className="flex items-center gap-3">
              <Link
                href="https://t.me/shapouramlak"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="تلگرام املاک شاپور"
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-[#0BA6DF] transition-all duration-300 hover:-translate-y-0.5"
              >
                <FaTelegram className="text-xl text-gray-300 hover:text-white transition-colors" />
              </Link>

              <Link
                href="https://instagram.com/alibakhshi_amlak"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="اینستاگرام املاک شاپور"
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-gradient-to-tr hover:from-[#feda75] hover:via-[#d62976] hover:to-[#4f5bd5] transition-all duration-300 hover:-translate-y-0.5"
              >
                <FaInstagram className="text-xl text-gray-300 hover:text-white transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        {/* خط پایانی */}
        <div className="mt-12 pt-6 border-t border-white/10 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} تمامی حقوق برای املاک شاپور محفوظ است.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
