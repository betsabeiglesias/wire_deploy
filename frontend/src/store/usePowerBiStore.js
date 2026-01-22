import { create } from "zustand";
import api from "@/services/api";

export const usePowerBiStore = create((set) => ({
    powerBis: [],
    isLoading: false,

    // ... (fetchPowerBis existente) ...
    fetchPowerBis: async () => {
        set({ isLoading: true });
        try {
            const res = await api.get("/api/powerbi-manager/mypowerbis/"); // ⚠️ Usar 'mypowerbis' (singular o plural según el router)
            set({ powerBis: res.data });
        } catch (error) {
            console.error("Error fetching PowerBIs:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    // 🆕 Nuevo: Función para editar un PowerBi
    updatePowerBi: async (id, data) => {
        try {
            const res = await api.put(`/api/powerbi-manager/mypowerbis/${id}/`, data); // Petición PUT
            
            // Actualizar la lista de PowerBis en el store
            set((state) => ({
                powerBis: state.powerBis.map((pbi) =>
                    pbi.id === id ? res.data : pbi
                ),
            }));
            return res.data;
        } catch (error) {
            console.error("Error updating PowerBI:", error);
            throw error;
        }
    },

    // 🆕 Nuevo: Función para eliminar un PowerBi
    deletePowerBi: async (id) => {
        try {
            await api.delete(`/api/powerbi-manager/mypowerbis/${id}/`); // Petición DELETE
            
            // Eliminar el PowerBi de la lista en el store
            set((state) => ({
                powerBis: state.powerBis.filter((pbi) => pbi.id !== id),
            }));
        } catch (error) {
            console.error("Error deleting PowerBI:", error);
            throw error;
        }
    },
}));