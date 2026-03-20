import React from "react";
import Sidebar from "../../sidebar/Sidebar";
import Header from "../../../components/ui/Header";
import { Radar } from "lucide-react";
import { FavoriteViews } from "@/modules/favoritos/components/FavoriteViews";

export default function Layout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#eef2f4]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#eef2f4]">
        <div className="min-h-full px-4 py-4 md:px-6 md:py-6">
          <div className="overflow-hidden rounded-[30px] border border-[#d9e0e5] bg-[linear-gradient(180deg,#f7f9fa_0%,#f2f5f6_100%)] shadow-[0_28px_68px_-44px_rgba(31,41,55,0.16)]">
            <Header
              badgeText="SCADA layout control"
              title="Consola técnica"
              highlightText="la supervisión."
              icon={Radar}
            />

            <section className="px-6 py-6 md:px-8 md:py-8">
              {/* REUTILIZACIÓN: Usamos el componente indicando que queremos TODOS los layouts */}
              <FavoriteViews
                title="Proyectos HMI"
                type="mylayout"
                onlyFavorites={false}
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
