/**
 * HistorianChrome.jsx
 *
 * Chrome compartido para todas las páginas del módulo Historian:
 *   - Top bar: azul industrial, título + slot derecho para acciones.
 *   - Left rail: navegación entre las secciones del módulo.
 *   - HistorianLayout: envuelve ambas y sirve de root para cada página.
 *
 * Uso:
 *   <HistorianLayout subtitle="Consulta manual" rightSlot={<button>…</button>}>
 *     {contenido}
 *   </HistorianLayout>
 */
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, LayoutGrid, Home } from "lucide-react";

/* ── Navegación del left rail ─────────────────────────────────────────────── */
const RAIL_ITEMS = [
  {
    id: "query",
    icon: Search,
    label: "Consulta manual",
    path: "/historian",
    exact: true,
  },
  {
    id: "dashboards",
    icon: LayoutGrid,
    label: "Dashboards",
    path: "/historian/dashboards",
    exact: false,
  },
];

/* ── Top bar ──────────────────────────────────────────────────────────────── */
export function HistorianTopBar({ subtitle, rightSlot }) {
  return (
    <div className="h-[36px] shrink-0 bg-[#29468b] px-4 text-white shadow-sm">
      <div className="flex h-full items-center justify-between">
        {/* Izquierda: título + subtítulo */}
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium tracking-[0.08em]">
            HISTORIAN
          </span>
          {subtitle && (
            <>
              <span className="text-white/30">/</span>
              <span className="text-[12px] text-white/70">{subtitle}</span>
            </>
          )}
        </div>

        {/* Derecha: slot de acciones + branding */}
        <div className="flex items-center gap-3">
          {rightSlot}
          <span className="text-[14px] font-extrabold tracking-wide text-white/90">
            RDT Wire
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Left rail ────────────────────────────────────────────────────────────── */
export function HistorianLeftRail() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (item) =>
    item.exact ? pathname === item.path : pathname.startsWith(item.path);

  return (
    <div className="flex h-full w-[44px] shrink-0 flex-col items-center border-r border-slate-300 bg-white py-3 gap-1">
      {/* Items de navegación */}
      {RAIL_ITEMS.map(({ id, icon: Icon, label, path }) => (
        <button
          key={id}
          onClick={() => navigate(path)}
          title={label}
          className={[
            "flex h-9 w-9 items-center justify-center rounded-[4px] transition-colors",
            isActive({ path, exact: id === "query" })
              ? "bg-[#eef3ff] text-[#29468b]"
              : "text-[#29468b]/40 hover:text-[#29468b] hover:bg-slate-50",
          ].join(" ")}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}

      {/* Separador */}
      <div className="mt-auto border-t border-slate-200 pt-2 w-full flex justify-center">
        {/* Volver al inicio de la app */}
        <button
          onClick={() => navigate("/")}
          title="Inicio de la aplicación"
          className="flex h-9 w-9 items-center justify-center rounded-[4px] text-[#29468b]/30 hover:text-[#29468b] hover:bg-slate-50 transition-colors"
        >
          <Home className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Layout completo ──────────────────────────────────────────────────────── */
export default function HistorianLayout({ subtitle, rightSlot, children }) {
  return (
    <div className="h-screen overflow-hidden bg-[#e9eaed] text-slate-800">
      <div className="flex h-full flex-col">
        <HistorianTopBar subtitle={subtitle} rightSlot={rightSlot} />
        <div className="flex min-h-0 flex-1">
          <HistorianLeftRail />
          {/* Área de contenido principal */}
          <div className="flex-1 min-h-0 overflow-auto bg-[#efefef]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
