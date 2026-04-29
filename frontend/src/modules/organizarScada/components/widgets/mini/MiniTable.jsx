import React from "react";

export default function MiniTable({
  rows = [],
  backgroundColor,
  textColor,
  gridColor,
}) {
  return (
    <div
      className="mini-table"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${gridColor}` }}>
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
              <td
                colSpan={5}
                className="empty-cell"
                style={{ textAlign: "center", padding: "8px" }}
              >
                Sin datos
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={`${row.variable}-${row.timestamp}-${idx}`}
                style={{ borderBottom: `1px solid ${gridColor}` }}
              >
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