import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import SidebarProfile from "./SidebarProfile";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <aside
      className={`
        h-full flex flex-col transition-all duration-300 flex-shrink-0
        ${open ? "w-64" : "w-20"}
        bg-white border-r border-gray-200
      `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-gray-100">
        <span
          className={`text-xl font-extrabold text-blue-900 whitespace-nowrap transition-all duration-200 
          ${open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}
        >
          RDT WIRE
        </span>

        <button 
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <i className="bx bx-menu text-2xl text-gray-600" />
        </button>
      </div>

      {/* NAV */}
      <ul className="flex flex-col gap-2 px-3 py-6 flex-grow overflow-y-auto">
        <SidebarItem open={open} icon="bx bx-user" label="User" to="/user" />
        <SidebarItem open={open} icon="bx bx-heart" label="Saved" to="/saved" />
        <SidebarItem open={open} icon="bx bx-cog" label="Settings" to="/settings" />
        <SidebarItem open={open} icon="bx bx-edit" label="Task/Project" to="/task-project" />
      </ul>

      {/* PROFILE */}
      <div className="mt-auto border-t border-gray-100">
        <SidebarProfile 
          open={open} 
          name={sessionStorage.getItem("username") || "Usuario"} 
          role="Administrador" 
          onLogout={handleLogout}
        />
      </div>
    </aside>
  );
}