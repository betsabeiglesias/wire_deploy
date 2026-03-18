import api from "./api";

export const getScadaConfig = async () => {

  const res = await api.get("/api/config/export/");

  return res.data;

};