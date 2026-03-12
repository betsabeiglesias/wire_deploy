import { BookmarkCheck, Heart, Layers3, Sparkles } from "lucide-react";
import Sidebar from "../modules/sidebar/Sidebar";
import { FavoriteViews } from "../modules/favoritos/components/FavoriteViews";

export default function SavedPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#f7f7f8]">
        <div className="min-h-full px-4 py-4 md:px-6 md:py-6">
          <div className="overflow-hidden rounded-[30px] border border-[#ececee] bg-[#fbfbfc] shadow-[0_24px_70px_-42px_rgba(31,41,55,0.12)]">
            <section className="relative border-b border-[#ececee] px-6 py-6 md:px-8 md:py-8">
              <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(#d9cdf7_1px,transparent_1px)] [background-size:8px_8px]" />
              <div className="absolute left-[8%] top-[12%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(121,200,241,0.18),transparent_72%)]" />
              <div className="absolute right-[-30px] top-[-20px] h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.16),transparent_70%)]" />

              <div className="relative z-10 flex justify-start">
                <div className="max-w-3xl xl:pl-2">
                  <h1 className="mt-4 max-w-2xl text-left text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-[#464851] md:text-6xl">
                    Tus 
                    <br />
                    <span className="text-[#79c8f1]">
                      favoritos.
                    </span>
                  </h1>
                </div>
              </div>
            </section>

            <section className="px-6 py-6 md:px-8 md:py-8">
              <FavoriteViews title="Power BI" type="mypowerbi" />
              <FavoriteViews title="HMI" type="mylayout" />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
