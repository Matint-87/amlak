import { Link } from "lucide-react";
import { FaTelegram} from "react-icons/fa6";

function Footer() {
  return (
    <>
      <footer className="w-full flex justify-center p-10" dir="rtl">
        <div className="max-w-7xl mx-auto mobile:flex-col flex tablet:flex-row mobile:w-full laptop:w-[70%] justify-between mobile:gap-10 tablet:gap-0">
          <div>
            <h3 className="text-xl font-bold mb-3">آدرس</h3>
            <p className="text-sm leading-7">
              قرچک، کمربندی شمالی، باهنر بیست و پنجم، قرچک <br />
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">تماس با ما</h3>
            <p className="text-sm leading-7">
              موبایل:09359506090
              <br />
              موبایل:09126986911
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">شبکه های مجازی</h3>
            <div className="flex items-center gap-5 mt-5">
              <Link href="https://t.me/shapouramlak">
                <FaTelegram className="text-3xl text-gray-600 hover:text-blue-400 duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
