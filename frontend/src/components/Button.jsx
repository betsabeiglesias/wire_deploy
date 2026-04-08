import React from "react";

// Definimos las variantes de estilos centralizadas
const variants = {
  // Botón principal (Azul Industrial)
  primary: "bg-[#194b68] text-white hover:bg-[#215f82] border-transparent shadow-sm",
  // Botón secundario (Blanco con borde, para Editar)
  secondary: "bg-white text-[#255f82] border border-[#d9e0e5] hover:bg-[#f5f9fb] shadow-sm",
  // Botón de peligro (Rojo, para Eliminar)
  danger: "bg-[#fff8f9] text-[#cf4b68] border border-[#f1d7dc] hover:bg-[#fff1f3] shadow-sm",
};

const handleClick = () => {
    navigate("/organizar-scada", {
      state: {
        // Reutiliza el flujo de "Editar Scada" para cargar todas las vistas de la app
        loadPublishedId: layoutId,
        layoutId,
        layOutName: layoutName,
        editMode: true,
        // Respaldo local por si falla la carga remota
        initialLayoutElements,
      },
    });
  };



const Button = ({ 
  children, 
  onClick, 
  variant = "primary", 
  className = "", 
  type = "button", 
  ...props 
}) => {
  const variantClasses = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      // 1. Aseguramos que sea inline-flex o flex y tenga un z-index relativo si es necesario
      // 2. Mantenemos el group para controlar estados internos si fuera necesario
      className={`group relative flex cursor-pointer items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.03] active:scale-95 ${variantClasses} ${className}`}
      {...props}
    >
      {/* Eliminamos cualquier margen o padding extra que pueda tener el span */}
      <span className="pointer-events-none select-none">
        {children}
      </span>
    </button>
  );
};

export default Button;