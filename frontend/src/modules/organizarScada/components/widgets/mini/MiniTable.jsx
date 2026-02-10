import React from "react";

export default function MiniTable({ rows = [] }) {
  return (
    <div className="mini-table">
      <table>
        <thead>
          <tr>
            <th>Planta</th>
            <th>Equipo</th>
            <th>Variable</th>
            <th>Valor</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-cell">
                Sin datos
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={`${row.variable}-${row.timestamp}-${idx}`}>
                <td>{row.site || "-"}</td>
                <td>{row.equipment || "-"}</td>
                <td>{row.variable || "-"}</td>
                <td>{row.value ?? "-"}</td>
                <td>{row.timestamp || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
