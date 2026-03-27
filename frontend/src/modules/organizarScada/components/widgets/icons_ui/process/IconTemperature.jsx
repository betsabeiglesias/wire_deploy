export function IconTemperature({ className = "", strokeWidth = 1.8, ...props }) {
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
      {/* Tubo del termómetro */}
      <path d="M12 3a2 2 0 0 0-2 2v8.27A4 4 0 1 0 14 13.27V5a2 2 0 0 0-2-2z" />
      {/* Relleno de mercurio */}
      <path d="M12 6v7" strokeWidth={strokeWidth * 1.8} strokeLinecap="round" />
      {/* Escala — marcas laterales */}
      <line x1="14" y1="6"  x2="16" y2="6"  />
      <line x1="14" y1="8"  x2="15.5" y2="8"  />
      <line x1="14" y1="10" x2="16" y2="10" />
      <line x1="14" y1="12" x2="15.5" y2="12" />
      {/* Bulbo — círculo relleno */}
      <circle cx="12" cy="17" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}