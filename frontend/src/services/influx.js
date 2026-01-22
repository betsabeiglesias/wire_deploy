// frontend/src/services/influx.js

const INFLUX_ORG = import.meta.env.VITE_INFLUX_ORG;
const INFLUX_TOKEN = import.meta.env.VITE_INFLUX_TOKEN;
export async function queryInflux(fluxQuery) {
  const response = await fetch(`http://localhost:8086/api/v2/query?org=${INFLUX_ORG}`, {
    method: "POST",
    headers: {
      "Authorization": `Token ${INFLUX_TOKEN}`,
      "Content-Type": "application/vnd.flux",
      "Accept": "application/csv"
    },
    body: fluxQuery
  });

  if (!response.ok) {
    throw new Error("Error en la consulta InfluxDB");
  }

  const csv = await response.text();
  return csv;
}
