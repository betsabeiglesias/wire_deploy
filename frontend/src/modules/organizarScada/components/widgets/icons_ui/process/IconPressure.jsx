
// ─── Presión ──────────────────────────────────────────────────────────────────
// Manómetro analógico con aguja, escala de arco y conector
export function IconPressure({ className = "", strokeWidth = 1.8, ...props }) {
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
      {/* Cuerpo circular */}
      <circle cx="12" cy="11" r="8" />
      {/* Arco de escala (parte inferior abierta) */}
      <path d="M6.5 16.5 A7 7 0 1 1 17.5 16.5" fill="none" />
      {/* Marcas de escala */}
      <line x1="12" y1="4.5" x2="12" y2="6"   />
      <line x1="17.5" y1="7.5" x2="16.3" y2="8.2" />
      <line x1="6.5"  y1="7.5" x2="7.7"  y2="8.2" />
      <line x1="19"   y1="12"  x2="17.5" y2="12"  />
      <line x1="5"    y1="12"  x2="6.5"  y2="12"  />
      {/* Aguja apuntando a ~70% (zona alta) */}
      <line x1="12" y1="11" x2="16.2" y2="7.8" strokeWidth={strokeWidth * 1.1} />
      {/* Pivote central */}
      <circle cx="12" cy="11" r="1.2" fill="currentColor" stroke="none" />
      {/* Conector inferior */}
      <path d="M10.5 19h3v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2z" fill="currentColor" stroke="none" />
    </svg>
  );
}