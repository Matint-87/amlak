import About from "../components/About";
import Hero from "../components/Hero";
import Slider from "../components/Slider";
import { query } from "@/src/lib/db";

export const dynamic = "force-dynamic";

async function getLatestAds() {
  try {
    const result = await query(
      `SELECT * FROM properties ORDER BY id DESC LIMIT 10`
    );

    return result.rows.map((ad: any) => ({
      ...ad,
      images: Array.isArray(ad.images) ? ad.images : [], // اطمینان از آرایه بودن تصاویر
    }));
  } catch (error) {
    console.error("Postgres fetch error:", error);
    return [];
  }
}

export default async function Page() {
  const ads = await getLatestAds();

  return (
    <div>
      <Hero />
      <div className="w-full my-[100px] h-[350px] mobile:px-5 laptop:px-0 flex items-center justify-center">
        <div className="mobile:w-full laptop:w-[70%] h-full">
          <span className="text-2xl">آگهی های جدید</span>
          <Slider ads={ads} />
        </div>
      </div>
      <About />
    </div>
  );
}
