export function IconMixer({ className = "", strokeWidth = 1.8, ...props }) {
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
      {/* Depósito — trapecio */}
      <path d="M5 6 L4 20 L20 20 L19 6 Z" />
      {/* Eje vertical del agitador */}
      <line x1="12" y1="2" x2="12" y2="14" />
      {/* Aspa superior */}
      <line x1="8" y1="11" x2="16" y2="11" />
      {/* Aspa inferior */}
      <line x1="8.5" y1="14" x2="15.5" y2="14" />
      {/* Motor en la parte superior */}
      <rect x="10" y="1" width="4" height="2.5" rx="0.5" />
      {/* Nivel del líquido */}
      <path d="M4.4 15 Q8 13.5 12 15 Q16 16.5 19.6 15" strokeWidth={strokeWidth * 0.7} />
    </svg>
  );
}
