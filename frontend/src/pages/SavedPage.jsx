import { BookmarkCheck, Heart, Layers3, Sparkles } from "lucide-react";
import Sidebar from "../modules/sidebar/Sidebar";
import { FavoriteViews } from "../modules/favoritos/components/FavoriteViews";
import { useThemeStore } from "../store/useThemeStore";

export default function SavedPage() {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === "dark";

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
      <Sidebar />

      <main className={`flex-1 overflow-y-auto ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
        <div className="min-h-full px-4 py-4 md:px-6 md:py-6">
          <div className={`overflow-hidden rounded-[30px] ${isDark ? "border border-white/10 bg-[linear-gradient(160deg,#09152f_0%,#0d1d40_42%,#132857_100%)] shadow-[0_24px_70px_-42px_rgba(0,0,0,0.35)]" : "border border-[#ececee] bg-[#fbfbfc] shadow-[0_24px_70px_-42px_rgba(31,41,55,0.12)]"}`}>
            <section className={`relative px-6 py-6 md:px-8 md:py-8 ${isDark ? "border-b border-white/10" : "border-b border-[#ececee]"}`}>
              <div className={`absolute inset-0 ${isDark ? "opacity-35 [background-image:radial-gradient(#7ec8ff_1px,transparent_1px)] [background-size:8px_8px]" : "opacity-70 [background-image:radial-gradient(#d9cdf7_1px,transparent_1px)] [background-size:8px_8px]"}`} />
              <div className={`absolute right-[-30px] top-[-20px] h-[240px] w-[240px] rounded-full ${isDark ? "bg-[radial-gradient(circle,rgba(114,176,255,0.16),transparent_70%)]" : "bg-[radial-gradient(circle,rgba(196,181,253,0.16),transparent_70%)]"}`} />
              <div className="relative z-10 flex justify-start">
                <div className="max-w-3xl xl:pl-2">
                  <h1 className={`mt-4 max-w-2xl text-left text-4xl font-semibold leading-[0.95] tracking-[-0.05em] md:text-6xl ${isDark ? "text-white" : "text-[#464851]"}`}>
                    Tus
                    <br />
                    <span className={isDark ? "text-[#7ec8ff]" : "text-[#79c8f1]"}>favoritos.</span>
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
