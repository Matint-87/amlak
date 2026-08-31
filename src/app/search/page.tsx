
interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const { q, location, meterMin, meterMax } = params;

  const url = new URL(
    "/api/properties",
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  );
  if (q) url.searchParams.set("q", q);
  if (location) url.searchParams.set("location", location);
  if (meterMin) url.searchParams.set("meterMin", meterMin);
  if (meterMax) url.searchParams.set("meterMax", meterMax);

  const res = await fetch(url, { cache: "no-store" });
  const { data } = await res.json();

  return (
    <div className="flex flex-col items-center py-10 gap-6">
      <h1 className="text-xl font-bold">
        نتایج جستجو {data?.length ? `(${data.length} مورد)` : ""}
      </h1>
      <div className="grid mobile:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-5 w-[90%]">
        {data?.length ? (
          data.map((property: any) => (
            <div key={property.id} className="border rounded-lg p-4 shadow">
              <h2 className="font-semibold">{property.title}</h2>
              <p className="text-sm text-gray-500">{property.address}</p>
              <p className="text-sm">{property.meter} متر</p>
            </div>
          ))
        ) : (
          <p>موردی پیدا نشد.</p>
        )}
      </div>
    </div>
  );
}