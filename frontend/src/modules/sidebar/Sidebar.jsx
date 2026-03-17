import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Heart,
  Orbit,
  Settings,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import SidebarProfile from "./SidebarProfile";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";

const navigationItems = [
  { icon: Orbit, label: "Home", to: "/" },
  { icon: UserRound, label: "User", to: "/user" },
  { icon: Heart, label: "Saved", to: "/saved" },
  { icon: ClipboardList, label: "Projects", to: "/task-project" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const displayName = user?.username || "Usuario";

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <aside
      className={`h-full flex-shrink-0 transition-all duration-300 ${
        open ? "w-52" : "w-24"
      } border-r border-white/10 bg-[linear-gradient(180deg,#09152f_0%,#0d1d40_42%,#132857_100%)]`}
    >
      <div className="flex h-full flex-col px-4 py-5">
        <div className="mb-8 flex items-center justify-between">
          {open ? (
            <div className="transition-all duration-300 opacity-100 translate-x-0">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-200/80">
                    RDT Wire
                  </p>
                  <p className="text-sm font-semibold text-white">
                    Control Center
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className=""></div>
          )}

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#9fb4d8] transition hover:bg-white/10 hover:text-white"
            aria-label={open ? "Contraer menu" : "Expandir menu"}
          >
            {open ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="flex-1">
          <ul className="flex flex-col gap-3">
            {navigationItems.map((item) => (
              <SidebarItem
                key={item.to}
                open={open}
                theme="dark"
                icon={item.icon}
                label={item.label}
                to={item.to}
              />
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={toggleTheme}
          className={`mb-4 inline-flex items-center rounded-2xl border border-white/10 bg-white/6 text-[#d7e4f8] transition hover:bg-white/10 ${open ? "w-full justify-between px-4 py-3" : "w-full justify-center px-3 py-3"}`}
          aria-label="Cambiar tema"
        >
          <span
            className={`text-sm font-medium transition-all duration-300 ${
              open
                ? "w-auto translate-x-0 opacity-100"
                : "w-0 -translate-x-2 overflow-hidden opacity-0"
            }`}
          >
            Cambiar tema
          </span>
          <Orbit className="h-4 w-4 flex-shrink-0" />
        </button>

        <SidebarProfile
          open={open}
          theme="dark"
          name={displayName}
          role="Administrador"
          onLogout={handleLogout}
        />
      </div>
    </aside>
  );
}
