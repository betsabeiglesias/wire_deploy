// ─── Flujo ────────────────────────────────────────────────────────────────────
// Tubería con flechas de dirección de caudal
export function IconFlow({ className = "", strokeWidth = 1.8, ...props }) {
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
      {/* Tubería superior */}
      <path d="M2 9 Q7 7 12 9 Q17 11 22 9" />
      {/* Tubería inferior */}
      <path d="M2 15 Q7 13 12 15 Q17 17 22 15" />
      {/* Flecha 1 — izquierda del centro */}
      <polyline points="6,11 9,12 6,13" />
      {/* Flecha 2 — derecha del centro */}
      <polyline points="15,11 18,12 15,13" />
      {/* Extremos de la tubería — tapas */}
      <line x1="2"  y1="9"  x2="2"  y2="15" />
      <line x1="22" y1="9"  x2="22" y2="15" />
    </svg>
  );
}
