import axios from 'axios';

const BASE_URL = "http://localhost:8000";

/**
 * Realiza el login y devuelve los datos
 */
export const loginRequest = async (username, password) => {
  const response = await axios.post(`${BASE_URL}/api/token/`, { username, password });
  return response.data; // { access, refresh, user_data... }
};

/**
 * Intenta obtener un nuevo access token usando el refresh token
 */
export const refreshAccessToken = async () => {
  const response = await axios.post(
    `${BASE_URL}/api/token/refresh/`,
    {},
    { withCredentials: true }
  );

  const newToken = response.data?.access;
  if (newToken) {
    localStorage.setItem('token', newToken);
  }
  return newToken || null;
};

// Mantiene compatibilidad con imports antiguos
export const attemptRefreshToken = refreshAccessToken;
