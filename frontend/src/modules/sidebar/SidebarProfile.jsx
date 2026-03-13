import { LogOut } from "lucide-react";

export default function SidebarProfile({ name, role, onLogout, open, theme }) {
  const isDark = theme === "dark";

  return (
    <div className={`mt-6 pt-5 ${isDark ? "border-t border-white/10" : "border-t border-[#ececee]"}`}>
      <div
        className={`rounded-[22px] p-3 ${
          isDark
            ? "border border-white/10 bg-white/6 shadow-[0_18px_30px_-24px_rgba(0,0,0,0.35)] backdrop-blur-sm"
            : "border border-[#efeff1] bg-white shadow-[0_12px_18px_-16px_rgba(31,41,55,0.1)]"
        }`}
      >
        <div className={`flex items-center ${open ? "gap-3" : "justify-center"}`}>
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full font-semibold ${
              isDark
                ? "bg-[linear-gradient(180deg,#1d3f72_0%,#17345d_100%)] text-white"
                : "bg-[#f2f4f8] text-[#4e525b]"
            }`}
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
            <p className={`truncate text-sm font-semibold ${isDark ? "text-white" : "text-[#3b3e46]"}`}>
              {name}
            </p>
            <p className={`text-xs ${isDark ? "text-[#9fb4d8]" : "text-[#9a9da7]"}`}>{role}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className={`mt-3 inline-flex items-center rounded-xl transition ${
            isDark
              ? "border border-white/10 bg-white/8 text-[#d7e4f8] hover:bg-white/12"
              : "border border-[#ececee] bg-[#fafafb] text-[#555962] hover:bg-white"
          } ${
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
