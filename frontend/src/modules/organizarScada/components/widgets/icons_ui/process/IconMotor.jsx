export function IconMotor({ className = "", strokeWidth = 1.8, ...props }) {
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
      {/* Cuerpo del motor — rectángulo redondeado */}
      <rect x="3" y="7" width="14" height="10" rx="1.5" />
      {/* Eje de salida */}
      <line x1="17" y1="12" x2="21" y2="12" />
      {/* Terminal de conexión eléctrica (arriba) */}
      <line x1="7" y1="7" x2="7" y2="4" />
      <line x1="10" y1="7" x2="10" y2="4" />
      <line x1="13" y1="7" x2="13" y2="4" />
      {/* Barra de terminales */}
      <line x1="6" y1="4" x2="14" y2="4" />
      {/* Letra M interior */}
      <path d="M6.5 15 L6.5 10 L10 13.5 L13.5 10 L13.5 15" strokeWidth={strokeWidth * 0.9} />
    </svg>
  );
}
