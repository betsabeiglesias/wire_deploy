import { create } from "zustand";
import api from "@/services/api";

export const usePowerBiStore = create((set) => ({
    powerBis: [],
    isLoading: false,

    fetchPowerBis: async () => {
        set({ isLoading: true });
        try {
            const res = await api.get("/api/powerbi/mypowerbis/");
            set({ powerBis: res.data });
        } catch (error) {
            console.error("Error fetching PowerBIs:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    updatePowerBiOrder: async (newPowerBis) => {
        set({ powerBis: newPowerBis });
        try {
            const orderData = newPowerBis.map((pbi, index) => ({ id: pbi.id, order: index }));
            await api.put("/api/powerbi/mypowerbis/reorder/", { pbis: orderData });
        } catch (error) {
            console.error("Error updating order:", error);
            throw error;
        }
    },

    updatePowerBi: async (id, data) => {
        try {
            const res = await api.put(`/api/powerbi/mypowerbis/${id}/`, data);
            set((state) => ({
                powerBis: state.powerBis.map((pbi) => pbi.id === id ? res.data : pbi),
            }));
            return res.data;
        } catch (error) {
            console.error("Error updating PowerBI:", error);
            throw error;
        }
    },

    deletePowerBi: async (id) => {
        try {
            await api.delete(`/api/powerbi/mypowerbis/${id}/`);
            set((state) => ({
                powerBis: state.powerBis.filter((pbi) => pbi.id !== id),
            }));
        } catch (error) {
            console.error("Error deleting PowerBI:", error);
            throw error;
        }
    },
}));