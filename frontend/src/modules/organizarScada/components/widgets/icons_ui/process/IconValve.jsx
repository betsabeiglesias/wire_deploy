
// ─── Válvula ──────────────────────────────────────────────────────────────────
// Válvula de globo / símbolo P&ID: tuberías + cuerpo + mariposa + volante
export function IconValve({ className = "", strokeWidth = 1.8, ...props }) {
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
      {/* Tubería izquierda */}
      <line x1="2"  y1="10" x2="8"  y2="10" />
      <line x1="2"  y1="14" x2="8"  y2="14" />
      {/* Tubería derecha */}
      <line x1="16" y1="10" x2="22" y2="10" />
      <line x1="16" y1="14" x2="22" y2="14" />
      {/* Cuerpo de la válvula — rombo / bowtie (símbolo P&ID) */}
      <path d="M8 10 L12 12 L16 10 L12 14 Z" />
      {/* Vástago actuador */}
      <line x1="12" y1="5"  x2="12" y2="10" />
      {/* Volante (handwheel) */}
      <circle cx="12" cy="4" r="2" />
      <line x1="10" y1="4" x2="14" y2="4" strokeWidth={strokeWidth * 0.8} />
    </svg>
  );
}