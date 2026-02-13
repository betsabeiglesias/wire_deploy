// frontend/src/routes/service_urls.jsx

export const SERVICE_URLS = {
  // Usamos las variables de entorno inyectadas por Vite
  djangoApi: `${import.meta.env.VITE_API_URL}/admin`,
  chatbot: import.meta.env.VITE_CHATBOT_URL || "http://localhost:5050/chat",
  mlService: import.meta.env.VITE_ML_SERVICE_URL || "http://localhost:5000/predict",
  vrService: import.meta.env.VITE_VR_SERVICE_URL || "http://localhost:6001/",
  grafana: import.meta.env.VITE_GRAFANA_URL || "http://localhost:3000/login",
  influxDb: import.meta.env.VITE_INFLUX_URL_SIGNIN || "http://localhost:8086/signin"
};