import { useState } from "react";
import {
  ChevronDown,
  FolderKanban,
  House,
  Layers,
  Maximize2,
  Minimize2,
  SquarePen,
} from "lucide-react";

/**
 * TopBar de la consola de producción.
 * Responsabilidad: identidad de la app (nombre del layout) + controles globales
 * (pantalla completa, menú de acciones). Sin lógica de vistas ni de canvas.
 *
 * Props:
 *   layoutName        string   — nombre del layout activo
 *   isFullscreen      boolean  — estado de pantalla completa
 *   onToggleFullscreen fn      — toggle fullscreen
 *   onHome            fn      — navegar a /
 *   onMyHMIs          fn      — navegar a /layout
 *   onEditHMI         fn      — abrir editor
 */
const ProductionTopBar = ({
  layoutName,
  isFullscreen,
  onToggleFullscreen,
  onHome,
  onMyHMIs,
  onEditHMI,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="flex h-[36px] shrink-0 items-center justify-between border-b border-[#CED5DF] bg-[#29468B] px-4 shadow-sm">
      {/* Izquierda: identidad del layout */}
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-white/70" />
        <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-white">
          {layoutName || "HMI"}
        </span>
      </div>

      {/* Derecha: controles globales */}
      <div className="flex items-center gap-1">
        {/* Pantalla completa */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          className="flex h-7 w-7 items-center justify-center rounded-[4px] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>

        {/* Menú de acciones */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen((p) => !p)}
            className="flex h-7 items-center gap-1.5 rounded-[4px] px-2.5 text-[11px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            Acciones
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-[200px] rounded-[6px] border border-[#CED5DF] bg-white p-1.5 shadow-lg">
                <button
                  onClick={() => { setIsMenuOpen(false); onHome(); }}
                  className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-[12px] text-slate-700 hover:bg-[#F2F3F5]"
                >
                  <House className="h-4 w-4 text-slate-400" />
                  Home
                </button>
                <button
                  onClick={() => { setIsMenuOpen(false); onMyHMIs(); }}
                  className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-[12px] text-slate-700 hover:bg-[#F2F3F5]"
                >
                  <FolderKanban className="h-4 w-4 text-slate-400" />
                  Mis HMIs
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => { setIsMenuOpen(false); onEditHMI(); }}
                  className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-[12px] text-[#2f7a57] hover:bg-[#f4fbf7]"
                >
                  <SquarePen className="h-4 w-4" />
                  Editar HMI
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default ProductionTopBar;
