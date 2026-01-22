import { NavLink } from "react-router-dom";

export default function SidebarItem({ icon, label, to, open }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `
          flex items-center gap-3 px-4 py-2 rounded-lg transition
          ${isActive 
            ? "bg-[#f3f4f6] text-[#11101D]" 
            : "text-[#1d1b31] hover:bg-[#f3f4f6]"
          }
        `
        }
      >
        {/* Icono */}
        <i className={`${icon} text-xl text-[#4b5563]`}></i>

        {/* Texto con animación de ocultado */}
        <span
          className={`
            text-[#1d1b31] whitespace-nowrap transition-all duration-300
            ${open ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}
          `}
        >
          {label}
        </span>
      </NavLink>
    </li>
  );
}
