import { useEffect, useMemo } from "react";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { usePowerBiStore } from "@/store/usePowerBiStore";
import { useNavigate } from "react-router-dom";
import FavoriteHeart from "@/components/FavoriteHeart";
import { FavoriteViews } from "../modules/favoritos/components/FavoriteViews";
import HomeButton from "../components/HomeButton";

export default function SavedPage() {
  

  return (

    <>
     <h1 className="text-3xl font-bold p-8 max-w-7xl mx-auto pb-0">⭐ Mis favoritos</h1>
     <div className="absolute top-8 right-8 z-10">
        <HomeButton />
      </div>
      
      {/* Sección Power BI */}
      <FavoriteViews title="Power BI" type="mypowerbi" />
      
      {/* Sección Layouts */}
      <FavoriteViews title="HMI" type="mylayout" />
    </>
  );
}
