import { LayoutDashboard } from "lucide-react";

/**
 * Sidebar de navegación entre vistas del layout (view-level).
 * Solo se monta cuando el layout tiene más de una vista.
 * Responsabilidad: listar las vistas disponibles y marcar la activa.
 * Sin lógica de canvas, sin lógica de datos.
 *
 * Props:
 *   views        {id, name}[]  — lista de vistas del layout
 *   activeViewId string        — id de la vista actualmente visible
 *   onNavigate   fn(viewId)    — callback para cambiar de vista
 */
const ProductionSidebar = ({ views, activeViewId, onNavigate }) => {
  if (!views?.length || views.length <= 1) return null;

  return (
    <aside className="flex w-fit shrink-0 flex-col border-r border-[#CED5DF] bg-white">
      {/* Cabecera de sección */}
      <div className="flex h-[36px] items-center gap-1.5 border-b border-[#CED5DF] px-3">
        <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          Vistas
        </span>
      </div>

      {/* Lista de vistas */}
      <nav className="flex flex-col gap-0.5 overflow-y-auto p-2">
        {views.map((view) => {
          const isActive = activeViewId === view.id;
          return (
            <button
              key={view.id}
              onClick={() => onNavigate(view.id)}
              className={`whitespace-nowrap rounded-[4px] px-2.5 py-[6px] text-left text-[11px] font-medium transition-colors ${
                isActive
                  ? "bg-[#EEF3FF] text-[#29468B]"
                  : "text-slate-600 hover:bg-[#F2F3F5] hover:text-slate-800"
              }`}
            >
              {view.name || `Vista ${view.id}`}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default ProductionSidebar;
