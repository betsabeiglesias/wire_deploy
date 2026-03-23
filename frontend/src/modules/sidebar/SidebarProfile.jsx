export default function SidebarProfile({ name, role, onLogout, open }) {
  return (
    <li className="mt-auto flex items-center px-4 py-4 border-t border-[#e0e0e0] bg-[#e5e7eb]">
      
      {/* Texto perfil */}
      <div
        className={`
          flex flex-col transition-all duration-300
          ${open ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}
        `}
      >
        <span className="font-semibold text-[#1d1b31]">{name}</span>
        <span className="text-sm opacity-70 text-[#1d1b31]">{role}</span>
      </div>

      {/* Icono logout */}
      <i
        className="bx bx-log-out text-2xl cursor-pointer text-[#1d1b31] hover:text-[#11101d] ml-auto"
        onClick={onLogout}
      />
    </li>
  );
}
