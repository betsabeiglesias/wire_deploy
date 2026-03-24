import { create } from "zustand";
import api from "@/services/api";

export const useLayoutStore = create((set) => ({
  layouts: [],
  isLoading: false,

  // 🔹 GET: Obtener todos los layouts del usuario
  fetchLayouts: async () => {
    set({ isLoading: true });
    try {
      // Coincide con: path("my-layouts/", my_layouts, name="my_layouts")
      const res = await api.get("/api/scada/my-layouts/"); 
      set({ layouts: res.data });
    } catch (error) {
      console.error("Error fetching Layouts:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // 🔹 NUEVA: Actualizar el orden de todos los layouts
  updateLayoutOrder: async (newLayouts) => {
    // Primero actualizamos el estado global (UI rápida)
    set({ layouts: newLayouts });

    try {
      // Enviamos el nuevo orden al backend
      // El backend deberá recibir la lista de IDs o el nuevo orden
      const orderData = newLayouts.map((l, index) => ({ id: l.id, order: index }));
      await api.put("/api/scada/reorder-layouts/", { layouts: orderData });
    } catch (error) {
      console.error("Error saving new order to DB:", error);
      throw error; // El componente capturará esto para revertir si falla
    }
  },

  // 🔹 PUT: Actualizar un layout
  updateLayout: async (id, data) => {
    try {
      // Coincide con: path("layout/<int:title_id>/", layout_detail)
      const res = await api.put(`/api/scada/layout/${id}/`, data);
      set((state) => ({
        layouts: state.layouts.map((l) => (l.id === id ? res.data : l)),
      }));
      return res.data;
    } catch (error) {
      console.error("Error updating Layout:", error);
      throw error;
    }
  },

  // 🔹 DELETE: Borrar un layout
  deleteLayout: async (id) => {
    try {
      // Coincide con: path("layout/<int:title_id>/", layout_detail)
      await api.delete(`/api/scada/layout/${id}/`);
      set((state) => ({
        layouts: state.layouts.filter((l) => l.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting Layout:", error);
      throw error;
    }
  },
}));
