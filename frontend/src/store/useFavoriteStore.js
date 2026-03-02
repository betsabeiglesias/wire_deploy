import { create } from "zustand";
import api from "@/services/api";

export const useFavoriteStore = create((set, get) => ({
  favorites: [],
  isLoading: false,

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

  updateFavoriteOrder: async (type, sortedFavIds) => {
    const { favorites } = get();
    
    // 1. Separamos los que no estamos tocando
    const otherFavs = favorites.filter(f => f.type !== type);
    // 2. Obtenemos los del tipo actual y los reordenamos según la lista de IDs del DND
    const currentTypeFavs = favorites.filter(f => f.type === type);
    const reorderedTypeFavs = sortedFavIds.map((id, index) => {
      const fav = currentTypeFavs.find(f => f.id === id);
      return { ...fav, order: index };
    });

    // 3. Actualización optimista
    set({ favorites: [...otherFavs, ...reorderedTypeFavs] });

    try {
      await api.put("/api/favorites/reorder/", { 
        orders: reorderedTypeFavs.map(f => ({ id: f.id, order: f.order })) 
      });
    } catch (err) {
      console.error("Error al guardar orden", err);
      get().fetchFavorites(); // Revertimos si falla
    }
  },

  isFavorite: (type, objectId) => {
    const id = Number(objectId);
    return get().favorites.some((f) => f.type === type && Number(f.object_id) === id);
  },

  toggleFavorite: async (type, objectId) => {
    try {
      await api.post("/api/favorites/", { content_type: type, object_id: objectId });
      await get().fetchFavorites();
    } catch (err) {
      console.error("Error al hacer toggle", err);
    }
  },

  clearFavorites: () => set({ favorites: [] }),
}));