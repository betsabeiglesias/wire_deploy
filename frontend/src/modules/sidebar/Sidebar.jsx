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
      className={`h-full flex-shrink-0 border-r border-[#ececee] bg-[#fbfbfc] transition-all duration-300 ${
        open ? "w-52" : "w-24"
      }`}
    >
      <div className="flex h-full flex-col px-4 py-5">
        <div className="mb-8 flex items-center justify-between">
          {open ? (
            <div className="flex items-center gap-3">
              <div>
                <p className="text-lg center font-semibold tracking-[-0.03em] text-[#353841]">
                  RDT WIRE
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ececee] bg-white text-[#525661] shadow-[0_12px_20px_-16px_rgba(31,41,55,0.12)]">
              <Orbit className="h-5 w-5" />
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[#8e919a] transition hover:bg-white hover:text-[#52555f]"
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
