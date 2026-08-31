"use client";

import Link from "next/link";
import { MdOutlineRealEstateAgent } from "react-icons/md";
import { usePathname } from "next/navigation";
import { FaHouseChimney, FaKey } from "react-icons/fa6";
import SearchBar from "./SearchBar";
function Navbar() {
  const pathName = usePathname();

  return (
    <div className="sticky top-0 bg-white shadow z-40 w-full flex justify-center items-center h-[100px] mobile:px-5 laptop:px-0">
      <div className="mobile:w-full laptop:w-[70%] flex h-full font-[Number] justify-between items-center">
        <div className="mobile:text-xl desktop:text-2xl text-[#DC143C] flex justify-between gap-3 items-center">
          <Link className="flex items-center gap-2.5" href="/">
            <MdOutlineRealEstateAgent />
            املاک شاپور
          </Link>
        </div>
        <div className="flex justify-center p-2 mobile:gap-3 tablet:gap-5">
          <SearchBar />
          <Link
            href="/sale"
            className={
              pathName === "/sale"
                ? "bg-[#0BA6DF] text-white mobile:px-4 mobile:text-sm tablet:text-[16px] tablet:px-6 py-2 rounded font-semibold flex items-center gap-2 shadow-md"
                : "bg-white text-[#0BA6DF] mobile:px-4 mobile:text-sm tablet:text-[16px] tablet:px-6 py-2 rounded font-semibold flex items-center gap-2 shadow-md"
            }
          >
            خرید
            <FaHouseChimney />
          </Link>
          <Link
            href="/rent"
            className={
              pathName === "/rent"
                ? "bg-[#0BA6DF] text-white mobile:px-4 mobile:text-sm tablet:text-[16px] tablet:px-6 py-2 rounded font-semibold flex items-center gap-2 shadow-md"
                : "bg-white text-[#0BA6DF] mobile:px-4 mobile:text-sm tablet:text-[16px] tablet:px-6 py-2 rounded font-semibold flex items-center gap-2 shadow-md"
            }
          >
            اجاره
            <FaKey />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
