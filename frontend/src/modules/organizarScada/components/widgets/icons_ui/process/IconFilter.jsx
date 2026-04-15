export function IconFilter({ className = "", strokeWidth = 1.8, ...props }) {
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
      {/* Cuerpo del filtro — hexágono alargado P&ID */}
      <path d="M12 3 L19 7.5 L19 16.5 L12 21 L5 16.5 L5 7.5 Z" />
      {/* Líneas internas de filtración */}
      <line x1="8"  y1="9"  x2="16" y2="9"  />
      <line x1="7.5" y1="12" x2="16.5" y2="12" />
      <line x1="8"  y1="15" x2="16" y2="15" />
      {/* Tubo entrada (izquierda) */}
      <line x1="2" y1="12" x2="5" y2="12" />
      {/* Tubo salida (derecha) */}
      <line x1="19" y1="12" x2="22" y2="12" />
    </svg>
  );
}
