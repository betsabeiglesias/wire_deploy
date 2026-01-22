// frontend/src/services/influx.js

const INFLUX_ORG = import.meta.env.VITE_INFLUX_ORG;
const INFLUX_TOKEN = import.meta.env.VITE_INFLUX_TOKEN;
// const INFLUX_TOKEN = "UPaQRl6XGsHmang40vybMYNxIhRT8LuL--4OYEPfyx7i3zyF4t89Z5G06l8eII_9l0X2ABIwXoejD95FBuBHYw==";
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
