import { formatValueWithDecimals } from "../utils";

export const GatewayTable = ({ data }) => (
  <table className="gateway-table">
    <thead>
      <tr>
        <th>Planta</th><th>Area</th><th>Linea</th><th>Celda</th>
        <th>Equipo</th><th>Variable</th><th>Valor</th><th>Unidad</th>
        <th>Calidad</th><th>Timestamp</th>
      </tr>
    </thead>
    <tbody>
      {data.map((r, i) => (
        <tr key={i}>
          <td>{r.site}</td><td>{r.area}</td><td>{r.line}</td><td>{r.cell}</td>
          <td>{r.equipment}</td><td>{r.variable}</td>
          <td>{formatValueWithDecimals(r.value)}</td><td>{r.unit}</td>
          <td>{r.quality}</td><td>{r.timestamp}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
