export function IconCompressor({ className = "", strokeWidth = 1.8, ...props }) {
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
      {/* Cilindro del compresor */}
      <rect x="4" y="8" width="11" height="8" rx="1" />
      {/* Pistón */}
      <line x1="9.5" y1="8" x2="9.5" y2="16" />
      {/* Varilla del pistón */}
      <line x1="15" y1="12" x2="19" y2="12" />
      {/* Volante de inercia */}
      <circle cx="20.5" cy="12" r="1.5" />
      {/* Tubo de entrada (izquierda-arriba) */}
      <line x1="4" y1="10" x2="2" y2="10" />
      <line x1="2" y1="9" x2="2" y2="11" />
      {/* Tubo de salida (izquierda-abajo) */}
      <line x1="4" y1="14" x2="2" y2="14" />
      <line x1="2" y1="13" x2="2" y2="15" />
      {/* Flechas de compresión */}
      <path d="M6.5 10.5 L8.5 12 L6.5 13.5" strokeWidth={strokeWidth * 0.8} />
    </svg>
  );
}
