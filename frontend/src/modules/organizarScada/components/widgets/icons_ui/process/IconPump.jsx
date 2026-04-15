export function IconPump({ className = "", strokeWidth = 1.8, ...props }) {
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
      {/* Carcasa circular de la bomba */}
      <circle cx="12" cy="13" r="5.5" />
      {/* Impulsor — aspas */}
      <path d="M12 13 L9 10" />
      <path d="M12 13 L15 10" />
      <path d="M12 13 L12 9" />
      {/* Tubo de entrada (izquierda) */}
      <line x1="2" y1="13" x2="6.5" y2="13" />
      {/* Tubo de salida (arriba) */}
      <line x1="12" y1="2" x2="12" y2="7.5" />
      {/* Brida entrada */}
      <line x1="2" y1="11.5" x2="2" y2="14.5" />
      {/* Brida salida */}
      <line x1="10.5" y1="2" x2="13.5" y2="2" />
    </svg>
  );
}
