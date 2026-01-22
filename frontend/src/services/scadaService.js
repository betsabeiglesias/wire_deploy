// frontend/src/services/scadaService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const scadaService = {
  /**
   * Obtener historial de un tag
   */
  async getTagHistory(equipmentId, variable, options = {}) {
    const {
      start = '-12h',
      stop = 'now',
      window = '30s',
      aggregation = 'mean'
    } = options;

    const response = await api.get('/api/scada-manager/scada/tags/history/', {
      params: { equipment_id: equipmentId, variable, start, stop, window, aggregation }
    });

    return response.data;
  },

  /**
   * Obtener historial de múltiples tags (más eficiente)
   */
  async getMultipleTagsHistory(tags, options = {}) {
    const { start = '-12h', window = '30s' } = options;

    const response = await api.post('/api/scada-manager/scada/tags/history/batch/', {
      tags,
      start,
      window
    });

    return response.data;
  },

  /**
   * Obtener valores actuales de un equipo
   */
  async getCurrentValues(equipmentId) {
    const response = await api.get(`/api/scada-manager/scada/tags/current/${equipmentId}/`);
    return response.data;
  },

  /**
   * Listar todos los equipos disponibles
   */
  async getEquipmentList() {
    const response = await api.get('/api/scada-manager/scada/equipment/list/');
    return response.data;
  },

  /**
   * Obtener variables disponibles de un equipo
   */
  async getAvailableVariables(equipmentId) {
    const response = await api.get(`/api/scada-manager/scada/equipment/${equipmentId}/variables/`);
    return response.data;
  },

  /**
   * Obtener configuración de equipos (desde DB)
   */
  async getEquipmentConfig() {
    const response = await api.get('/apiscada-manager/scada/equipment/');
    return response.data;
  },

  /**
   * Obtener configuración de tags (desde DB)
   */
  async getTagConfig(equipmentId = null) {
    const params = equipmentId ? { equipment_id: equipmentId } : {};
    const response = await api.get('/api/scada-manager/scada/tag-config/', { params });
    return response.data;
  }
};