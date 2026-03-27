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
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#9fb4d8] transition hover:bg-white/10 hover:text-white"
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
                icon={item.icon}
                label={item.label}
                to={item.to}
              />
            ))}
          </ul>
        </nav>

        <SidebarProfile
          open={open}
          name={displayName}
          role="Administrador"
          onLogout={handleLogout}
        />
      </div>
    </aside>
  );
}
