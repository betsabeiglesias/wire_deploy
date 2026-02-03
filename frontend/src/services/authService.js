// import axios from 'axios';

// const BASE_URL = "http://localhost:8000";

// /**
//  * Realiza el login y devuelve los datos
//  */
// export const loginRequest = async (username, password) => {
//   const response = await axios.post(`${BASE_URL}/api/auth/token/`, { username, password });
//   return response.data; // { access, refresh, user_data... }
// };

// /**
//  * Intenta obtener un nuevo access token usando el refresh token
//  */
// export const refreshAccessToken = async () => {
//   const refreshToken = localStorage.getItem('refresh');
//   if (!refreshToken) throw new Error("No hay refresh token");

//   const response = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
//     refresh: refreshToken,
//   });
  
//   const newToken = response.data.access;
//   localStorage.setItem('token', newToken);
//   return newToken;
// };