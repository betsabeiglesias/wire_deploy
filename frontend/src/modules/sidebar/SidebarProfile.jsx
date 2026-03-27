import { LogOut } from "lucide-react";

export default function SidebarProfile({ name, role, onLogout, open }) {
  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      <div
        className="rounded-[22px] border border-white/10 bg-white/6 p-3 shadow-[0_18px_30px_-24px_rgba(0,0,0,0.35)] backdrop-blur-sm"
      >
        <div className={`flex items-center ${open ? "gap-3" : "justify-center"}`}>
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#1d3f72_0%,#17345d_100%)] font-semibold text-white"
          >
            {name.slice(0, 1).toUpperCase()}
          </div>

          <div
            className={`min-w-0 transition-all duration-300 ${
              open
                ? "w-auto translate-x-0 opacity-100"
                : "w-0 -translate-x-2 overflow-hidden opacity-0"
            }`}
          >
            <p className="truncate text-sm font-semibold text-white">
              {name}
            </p>
            <p className="text-xs text-[#9fb4d8]">{role}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className={`mt-3 inline-flex cursor-pointer items-center rounded-xl border border-white/10 bg-white/8 text-[#d7e4f8] transition hover:bg-white/12 ${
            open
              ? "w-full justify-between px-4 py-3"
              : "w-full justify-center px-3 py-3"
          }`}
          aria-label="Cerrar sesion"
        >
          <span
            className={`text-sm font-medium transition-all duration-300 ${
              open
                ? "w-auto translate-x-0 opacity-100"
                : "w-0 -translate-x-2 overflow-hidden opacity-0"
            }`}
          >
            Logout
          </span>
          <LogOut className="h-4 w-4 flex-shrink-0" />
        </button>
      </div>
    </div>
  );
}
