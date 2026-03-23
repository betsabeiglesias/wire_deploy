import { create } from "zustand";
import api from "@/services/api";

export const useFavoriteStore = create((set, get) => ({
  favorites: [],
  isLoading: false,

  // Obtener favoritos del usuario
  fetchFavorites: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/api/favorites/");
      set({ favorites: res.data });
    } catch (err) {
      console.error("Error cargando favoritos", err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Comprobar si algo es favorito
  isFavorite: (type, objectId) => {
    const id = Number(objectId);

    return get().favorites.some(
      (f) => f.type === type && Number(f.object_id) === id
    );
  },

  // Toggle favorito (el backend ya hace el toggle)
  toggleFavorite: async (type, objectId) => {
    try {
      await api.post("/api/favorites/", {
        content_type: type,
        object_id: objectId,
      });

      // Refrescamos favoritos después del toggle
      await get().fetchFavorites();
    } catch (err) {
      console.error("Error al hacer toggle de favorito", err);
    }
  },

      // Limpiamos favoritos
  clearFavorites: () => set({ favorites: [] }),
}));
