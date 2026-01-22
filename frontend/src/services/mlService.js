import api from "./api";

export async function getPrediction(data) {
  const response = await api.post("/predict", data);
  return response.data;
}
