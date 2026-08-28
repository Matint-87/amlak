import Link from "next/link";

export default function PropertyCard({ p }: { p: any }) {
  return (
    <div className="border p-4 rounded">
      <div className="text-lg font-semibold">{p.title}</div>
      <div className="text-sm">{p.address}</div>
      <div className="mt-2">
        قیمت: {p.price} — متر: {p.area}m²
      </div>
      <div className="mt-3">
        <Link href={`/property/${p.id}`} className="text-blue-600">
          مشاهده جزئیات
        </Link>
      </div>
    </div>
  );
}
