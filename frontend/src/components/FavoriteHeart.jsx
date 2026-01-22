import { Heart } from "lucide-react";
import { useFavoriteStore } from "@/store/useFavoriteStore";

const FavoriteHeart = ({ type, objectId }) => {
  const { isFavorite, toggleFavorite } = useFavoriteStore();

  const active = isFavorite(type, objectId);

  return (
    <button
      onClick={() => toggleFavorite(type, objectId)}
      className="flex items-center justify-center px-2"
      title={active ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          active
            ? "fill-red-500 stroke-red-500"
            : "stroke-gray-400 hover:stroke-red-500"
        }`}
      />
    </button>
  );
};

export default FavoriteHeart;
