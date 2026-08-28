"use client";

import { MdError } from "react-icons/md";

export default function Error() {
  return (
    <div className="flex flex-col justify-center items-center h-[500px]">
      <MdError className="text-3xl text-[#DE2449]"/>
      <h2 className="mt-2">یه مشکلی پیش اومد!</h2>

      <p className="mt-2">لطفا بعدا دوباره امتحان کنید</p>
    </div>
  );
}
