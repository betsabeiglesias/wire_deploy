import { formatValueWithDecimals } from "../utils";

export const GatewayTable = ({ data }) => (
  <div className="overflow-auto rounded-sm border border-border-default mt-4">
    <table className="w-full text-base border-collapse">
      <thead>
        <tr className="border-b border-border-default bg-surface-subtle">
          {["Planta", "Área", "Línea", "Celda", "Equipo", "Variable", "Valor", "Unidad", "Calidad", "Timestamp"].map(
            (col) => (
              <th
                key={col}
                className="px-2 py-2 text-left text-xs uppercase tracking-caps text-slate-700 font-semibold whitespace-nowrap"
              >
                {col}
              </th>
            )
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((r, i) => (
          <tr
            key={i}
            className={`border-b border-border-subtle last:border-0 hover:bg-surface-subtle transition-colors duration-100 ${
              i % 2 === 0 ? "bg-white" : "bg-slate-50"
            }`}
          >
            <td className="px-2 py-2 text-slate-800">{r.site}</td>
            <td className="px-2 py-2 text-slate-800">{r.area}</td>
            <td className="px-2 py-2 text-slate-800">{r.line}</td>
            <td className="px-2 py-2 text-slate-800">{r.cell}</td>
            <td className="px-2 py-2 text-slate-800">{r.equipment}</td>
            <td className="px-2 py-2 text-slate-800 font-medium">{r.variable}</td>
            <td className="px-2 py-2 text-slate-900 font-semibold">{formatValueWithDecimals(r.value)}</td>
            <td className="px-2 py-2 text-slate-500">{r.unit}</td>
            <td className="px-2 py-2 text-slate-500">{r.quality}</td>
            <td className="px-2 py-2 text-slate-400 text-sm whitespace-nowrap">{r.timestamp}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
