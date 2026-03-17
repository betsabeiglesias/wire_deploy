import { NavLink } from "react-router-dom";

export default function SidebarItem({ icon: Icon, label, to, open, theme }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `group flex items-center rounded-2xl px-3 py-3 transition-all duration-300 ${
            isActive
              ? "bg-[linear-gradient(180deg,rgba(246,249,255,0.96)_0%,rgba(235,241,250,0.92)_100%)] text-[#12284a] shadow-[0_16px_26px_-18px_rgba(0,0,0,0.35)]"
              : "text-[#9fb4d8] hover:bg-white/8 hover:text-white"
          } ${open ? "justify-start gap-3" : "justify-center"}`
        }
      >
        <span
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
            open ? "bg-white/8" : "bg-white/10"
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
