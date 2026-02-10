import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:8000",
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

    if (!document.cookie.includes("refresh_token")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // 3. Intentar renovar la sesión (el refresh_token va en la cookie)
      await axios.post(
        'http://localhost:8000/api/auth/token/refresh/', 
        {}, 
        { withCredentials: true }
      );
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default api;
