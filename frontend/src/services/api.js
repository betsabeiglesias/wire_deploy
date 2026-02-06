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
      originalRequest.url.includes('/api/token/') ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (!document.cookie.includes("refresh_token")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await api.post(
        '/api/token/refresh/',
        null,
        { withCredentials: true }
      );
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default api;
