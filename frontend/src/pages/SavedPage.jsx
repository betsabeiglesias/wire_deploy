import React from "react";
import { Activity } from "lucide-react";
import Sidebar from "../modules/sidebar/Sidebar";
import { FavoriteViews } from "../modules/favoritos/components/FavoriteViews";
import Header from "../components/ui/Header";
import HomeButton from "../components/HomeButton";

export default function SavedPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#eef2f4]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#eef2f4]">
        <div className="min-h-full px-3 py-3 md:px-5 md:py-5">
          <div className="relative overflow-hidden rounded-[30px] border border-[#d9e0e5] bg-[linear-gradient(180deg,#f7f9fa_0%,#f2f5f6_100%)] shadow-[0_28px_68px_-44px_rgba(31,41,55,0.16)]">
            {/* USANDO EL NUEVO COMPONENTE REUTILIZABLE */}
            
            <Header
              badgeText="Favorites control"
              title="Mis proyectos"
              highlightText="favoritos."
              icon={Activity}
            />
            <HomeButton/>
            

            {/* VISTAS DE FAVORITOS */}
            <section className="space-y-8 px-6 py-6 md:px-8 md:py-8">
              <FavoriteViews
                title="Power BI"
                type="mypowerbi"
                onlyFavorites={true}
              />
              <FavoriteViews title="HMI" type="mylayout" onlyFavorites={true} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
