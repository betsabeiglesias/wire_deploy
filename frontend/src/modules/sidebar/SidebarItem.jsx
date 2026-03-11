import { NavLink } from "react-router-dom";

export default function SidebarItem({ icon: Icon, label, to, open }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `group flex items-center rounded-2xl px-3 py-3 transition-all duration-300 ${
            isActive
              ? "bg-white text-[#3b3f47] shadow-[0_12px_20px_-16px_rgba(31,41,55,0.12)]"
              : "text-[#8b8f99] hover:bg-white hover:text-[#4c5058]"
          } ${open ? "justify-start gap-3" : "justify-center"}`
        }
      >
        <span
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
            open ? "bg-[#fafafb]" : "bg-white"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>

        <span
          className={`min-w-0 transition-all duration-300 ${
            open
              ? "w-auto translate-x-0 opacity-100"
              : "w-0 -translate-x-2 overflow-hidden opacity-0"
          }`}
        >
          <span className="block text-sm font-medium">{label}</span>
        </span>
      </NavLink>
    </li>
  );
}
