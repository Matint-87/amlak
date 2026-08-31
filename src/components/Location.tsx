import { HiOutlineLocationMarker } from "react-icons/hi";
import { FiExternalLink } from "react-icons/fi";
import Link from "next/link";

function Location() {
  const mapsUrl =
    "https://www.google.com/maps/place/%D8%A7%D9%85%D9%84%D8%A7%DA%A9+%D8%B4%D8%A7%D9%BE%D9%88%D8%B1/@35.4455795,51.5748889,17z";

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-md group">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d812.5930428556991!2d51.57488887447517!3d35.4455795793011!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f91ed0003e79fd3%3A0x333e1eb92d829e79!2z2KfZhdmE2KfaqSDYtNin2b7ZiNix!5e0!3m2!1sen!2s!4v1765993433833!5m2!1sen!2s"
        className="w-full h-full grayscale-15 group-hover:grayscale-0 transition-all duration-500"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* برچسب آدرس روی نقشه */}
      <div className="absolute top-3 right-3 left-3 flex items-start justify-between gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3.5 py-2.5 shadow-md flex items-center gap-2 pointer-events-auto">
          <HiOutlineLocationMarker
            className="text-[#0BA6DF] shrink-0"
            size={18}
          />
          <span className="text-xs font-semibold text-[#0a1e3f]">
            املاک شاپور
          </span>
        </div>
      </div>

      {/* دکمه مسیریابی */}
      <Link
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 left-3 bg-[#0BA6DF] hover:bg-[#0994c9] text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors"
      >
        مسیریابی در گوگل مپ
        <FiExternalLink size={15} />
      </Link>
    </div>
  );
}

export default Location;
