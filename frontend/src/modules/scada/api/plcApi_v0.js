// docker-suite/frontend/src/modules/scada/api/plcApi.js
import api from '../../../services/api'; 

/**
 * Mantenemos el nombre 'apiFetch' y lo exportamos porque tus componentes 
 * (como Isa95SelectorPage.jsx) lo importan directamente.
 */
export async function apiFetch(path, options = {}) {
  // Ajustamos para que acepte el formato de options que tenías antes (method, body, etc)
  const { method = 'GET', body, headers } = options;
  const url = `/api/config${path}`;
  
  try {
    const response = await api({
      method,
      url,
      data: body ? JSON.parse(body) : null, // Convertimos el string JSON de vuelta a objeto para Axios
      headers,
    });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.detail || error.message;
    const customError = new Error(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
    customError.status = error.response?.status;
    customError.payload = error.response?.data;
    throw customError;
  }
}

/* ----------------------------------------------
   PLC CRUD
------------------------------------------------*/
export async function getPLCs() {
  return apiFetch("/plc/");
}

export async function getPLC(id) {
  return apiFetch(`/plc/${id}/`);
}

export async function createPLC(data) {
  try {
    const created = await apiFetch("/plc/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return { ok: true, data: created };
  } catch (error) {
    return {
      ok: false,
      error: error.payload || { detail: error.message },
      status: error.status,
    };
  }
}

export const updatePLC = async (id, data) => {
  return apiFetch(`/plc/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export const patchPLC = async (id, data) => {
  return apiFetch(`/plc/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export async function deletePLC(id) {
  await apiFetch(`/plc/${id}/`, { method: "DELETE" });
  return true;
}

/* ----------------------------------------------
   Toggle PLC ENABLE
------------------------------------------------*/
export async function togglePLC(id, enabled) {
  return apiFetch(`/plc/${id}/toggle_enabled/`, {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });
}

export async function regenerateGateway() {
  return apiFetch(`/regenerate-gateway/`, {
    method: "POST",
  });
}

export async function restartGateway() {
  return apiFetch(`/restart-gateway/`, {
    method: "POST",
  });
}

/* ----------------------------------------------
   Variables por PLC
------------------------------------------------*/
export const savePLCVariables = async (id, variables) => {
  return apiFetch(`/plc/${id}/variables/`, {
    method: "POST",
    body: JSON.stringify({ variables }),
  });
};

/* ----------------------------------------------
   TAGS CRUD
------------------------------------------------*/
export async function createTag(plcId, payload) {
  return apiFetch(`/plc/${plcId}/tags/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteTag(plcId, tagId) {
  await apiFetch(`/plc/${plcId}/tags/${tagId}/`, {
    method: "DELETE",
  });
  return true;
}

export async function getTag(plcId, tagId) {
  return apiFetch(`/plc/${plcId}/tags/${tagId}/`);
}

export async function updateTag(plcId, tagId, payload) {
  return apiFetch(`/plc/${plcId}/tags/${tagId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/* ----------------------------------------------
 Toggle TAG ENABLE
------------------------------------------------*/
export async function toggleTag(plcId, tagId, enabled) {
  return apiFetch(`/plc/${plcId}/tags/${tagId}/toggle/`, {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });
}

// Mock de funciones antiguas para no romper nada si se importan
export function isAuthenticated() { return true; }
export function logout() { window.location.href = '/login'; }