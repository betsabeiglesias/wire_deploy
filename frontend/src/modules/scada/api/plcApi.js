// docker-suite/frontend/src/modules/scada/api/plcApi.js

const API = "http://localhost:8000/api/config";
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/* ----------------------------------------------
   🔑 Gestión de tokens
------------------------------------------------*/
function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Intenta refrescar el access token
 * @returns {Promise<string|null>} Nuevo token o null si falla
 */
async function attemptRefreshToken() {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    console.warn('No hay refresh token disponible');
    return null;
  }

  try {
    const response = await fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    const newAccessToken = data.access;
    
    if (newAccessToken) {
      setAccessToken(newAccessToken);
      return newAccessToken;
    }
    
    return null;
  } catch (error) {
    console.error('Error al refrescar el token:', error);
    clearTokens();
    return null;
  }
}

/**
 * Maneja el logout y redirige al login
 */
function handleLogout() {
  clearTokens();
  window.location.href = '/login';
}


/* ----------------------------------------------
   Helper centralizado para fetch + manejo errores
------------------------------------------------*/
export async function apiFetch(path, options = {}, retryCount = 0) {
  const url = `${API}${path}`;

  const token = localStorage.getItem("token");

  const opts = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  };

  const res = await fetch(url, opts);

  // Manejo de 401 - Token expirado
  if (res.status === 401 && retryCount === 0) {
    console.log('Token expirado, intentando refresh...');
    
    const newToken = await attemptRefreshToken();
    
    if (newToken) {
      // ✅ Reintentar la petición con el nuevo token
      console.log('Token refrescado, reintentando petición...');
      return apiFetch(path, options, retryCount + 1);
    } else {
      // ❌ No se pudo refrescar, hacer logout
      console.error('No se pudo refrescar el token, cerrando sesión...');
      handleLogout();
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
  }

  // 204 No Content
  if (res.status === 204) return null;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const errMsg = data?.detail || data || res.statusText;
    const error = new Error(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
    error.status = res.status;
    error.payload = data;
    throw error;
  }

  return data;
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


/* ----------------------------------------------
  Utilidades de autenticación (exportadas por si son necesarias)
------------------------------------------------*/
export function isAuthenticated() {
  return !!getAccessToken();
}

export function logout() {
  handleLogout();
}