import { Heart } from "lucide-react";
import { useFavoriteStore } from "@/store/useFavoriteStore";

const FavoriteHeart = ({ type, objectId }) => {
  const { isFavorite, toggleFavorite } = useFavoriteStore();

  const active = isFavorite(type, objectId);

  return (
    <button
      onClick={() => toggleFavorite(type, objectId)}
      className="flex cursor-pointer items-center justify-center rounded-full p-2 transition-all duration-200 hover:scale-110 active:scale-95"
      title={active ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      <Heart
        className={`h-5 w-5 transition-all duration-200 ${
          active
            ? "fill-red-500 stroke-red-500 scale-110"
            : "stroke-gray-400 hover:stroke-red-500 hover:scale-110"
        }`}
      />
    </button>
  );
};

export default FavoriteHeart;