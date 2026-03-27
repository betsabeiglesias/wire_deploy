// ─── Tanque ───────────────────────────────────────────────────────────────────
// Depósito cilíndrico vertical con nivel de líquido y tapa elíptica
export function IconTank({ className = "", strokeWidth = 1.8, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Tapa superior */}
      <ellipse cx="12" cy="5" rx="6" ry="1.8" />
      {/* Paredes laterales */}
      <line x1="6"  y1="5"  x2="6"  y2="19" />
      <line x1="18" y1="5"  x2="18" y2="19" />
      {/* Base inferior */}
      <ellipse cx="12" cy="19" rx="6" ry="1.8" />
      {/* Nivel de líquido (~60%) — elipse intermedia */}
      <ellipse cx="12" cy="13" rx="6" ry="1.8" strokeDasharray="2 1.5" />
      {/* Relleno semitransparente del líquido */}
      <ellipse cx="12" cy="19" rx="6" ry="1.8" fill="currentColor" fillOpacity="0.18" stroke="none" />
      <rect x="6" y="13" width="12" height="6" fill="currentColor" fillOpacity="0.12" stroke="none" />
      {/* Indicador de nivel — línea exterior */}
      <line x1="20" y1="5"  x2="20" y2="19" strokeOpacity="0.4" />
      <line x1="19.4" y1="13" x2="21" y2="13" strokeWidth={strokeWidth * 1.1} />
      {/* Tubería de salida */}
      <line x1="9"  y1="21" x2="9"  y2="22.5" />
      <line x1="9"  y1="22.5" x2="15" y2="22.5" />
    </svg>
  );
}