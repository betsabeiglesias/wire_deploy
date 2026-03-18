import axios from 'axios';

// Ahora toma la URL del .env a través de Vite
const API_URL = import.meta.env.VITE_API_URL;


const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest.url.includes('api/auth/token/') ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await axios.post(
        `${API_URL}/api/auth/token/refresh/`,
        {},
        { withCredentials: true }
      );
      return api(originalRequest);
    } catch (refreshError) {
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  }
);

export default api;

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
// });

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response?.status !== 401 || 
//       originalRequest.url.includes('api/auth/token/') || 
//       originalRequest._retry
//     ) {
//       return Promise.reject(error);
//     }

//     if (!document.cookie.includes("refresh_token")) {
//       return Promise.reject(error);
//     }

//     originalRequest._retry = true;

//     try {
//       // 3. Intentar renovar la sesión (el refresh_token va en la cookie)
//       await axios.post(
//         `${API_URL}/api/auth/token/refresh/`,   // Usamos la variable API_URL aquí también
//         {}, 
//         { withCredentials: true }
//       );
//       return api(originalRequest);
//     } catch (refreshError) {
//       return Promise.reject(refreshError);
//     }
//   }
// );

// export default api;
