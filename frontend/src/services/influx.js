// frontend/src/services/influx.js

const INFLUX_ORG = import.meta.env.VITE_INFLUX_ORG;
const INFLUX_TOKEN = import.meta.env.VITE_INFLUX_TOKEN;


// 1. Usamos la variable que definimos en el .env y pasamos por el docker-compose
// la variable recoge solo el valor del puerto, no la url completa
// es decir, no inclyye el "http://localhost:" , eso hay que hardcodearlo
const INFLUX_PORT = import.meta.env.VITE_INFLUX_PORT || '8086';

export async function queryInflux(fluxQuery) {
  // 2. Reemplazamos el localhost:puerto por la variable dinámica
  const response = await fetch(`http://localhost:${INFLUX_PORT}/api/v2/query?org=${INFLUX_ORG}`, {
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
