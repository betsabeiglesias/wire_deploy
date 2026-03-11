import { Heart, Search, Sparkles } from "lucide-react";
import Sidebar from "../modules/sidebar/Sidebar";
import { FavoriteViews } from "../modules/favoritos/components/FavoriteViews";

export default function SavedPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#f7f7f8]">
        <div className="min-h-full px-4 py-4 md:px-6 md:py-6">
          <div className="overflow-hidden rounded-[30px] border border-[#e3e3e3] bg-[#f4f4f4] shadow-[0_24px_70px_-42px_rgba(31,41,55,0.12)]">
            <section className="border-b border-[#e4e4e4] px-6 py-6 md:px-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <h1 className="mt-5 text-5xl font-semibold leading-[0.96] tracking-[-0.05em] text-[#202329]">
                    Dashboard
                  </h1>
                </div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center"></div>
              </div>
            </section>
            <section className="px-6 py-6 md:px-8">
              <FavoriteViews title="Power BI" type="mypowerbi" />
              <FavoriteViews title="HMI" type="mylayout" />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
