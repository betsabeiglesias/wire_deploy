export function IconFan({ className = "", strokeWidth = 1.8, ...props }) {
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
      {/* Pala 1 — arriba */}
      <path d="M12 12 C12 8 14 4 12 3 C10 4 10 8 12 12" />
      {/* Pala 2 — abajo-derecha */}
      <path d="M12 12 C15.46 14 18.93 16.93 20 15.46 C19 13.46 15.46 12 12 12" />
      {/* Pala 3 — abajo-izquierda */}
      <path d="M12 12 C8.54 14 5.07 16.93 4 15.46 C5 13.46 8.54 12 12 12" />
      {/* Centro */}
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
      {/* Eje inferior */}
      <line x1="12" y1="21" x2="12" y2="18" />
      {/* Base */}
      <line x1="9" y1="21" x2="15" y2="21" />
    </svg>
  );
}
