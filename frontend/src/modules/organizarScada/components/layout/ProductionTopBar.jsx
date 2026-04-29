import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  FolderKanban,
  House,
  Layers,
  Maximize2,
  Minimize2,
  SquarePen,
} from "lucide-react";
import { useHmiTheme } from "../widgets/styles/ThemeProvider";

const ProductionTopBar = ({
  layoutName,
  isFullscreen,
  onToggleFullscreen,
  onBack,
  onHome,
  onMyHMIs,
  onEditHMI,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme } = useHmiTheme();

  // Helpers para opacidades sin hardcodear colores
  const withOpacity = (hex, opacity) => {
    if (!hex) return "";
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, "0");
    return hex + alpha;
  };

  const textMain = theme.colors.textHeader;
  const textDim = withOpacity(theme.colors.textHeader, 0.7);
  const hoverBg = "rgba(255,255,255,0.1)";

  return (
    <header
      className="flex h-[36px] shrink-0 items-center justify-between px-2 shadow-sm"
      style={{
        backgroundColor: theme.colors.bgHeader,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* ── IZQUIERDA ───────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        {/* Atrás */}
        <button
          onClick={onBack}
          title="Atrás"
          className="flex h-7 w-7 items-center justify-center rounded-[4px] transition-colors"
          style={{ color: textDim }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = hoverBg;
            e.currentTarget.style.color = textMain;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = textDim;
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Home */}
        <button
          onClick={onHome}
          title="Inicio"
          className="flex h-7 w-7 items-center justify-center rounded-[4px] transition-colors"
          style={{ color: textDim }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = hoverBg;
            e.currentTarget.style.color = textMain;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = textDim;
          }}
        >
          <House className="h-4 w-4" />
        </button>

        {/* Separador */}
        <div
          className="mx-1 h-4 w-px"
          style={{ backgroundColor: withOpacity(textMain, 0.2) }}
        />

        {/* Nombre */}
        <div className="flex items-center gap-1.5">
          <Layers
            className="h-3.5 w-3.5"
            style={{ color: withOpacity(textMain, 0.6) }}
          />
          <span
            className="text-[12px] font-medium uppercase tracking-[0.08em]"
            style={{ color: textMain }}
          >
            {layoutName || "HMI"}
          </span>
        </div>
      </div>

      {/* ── DERECHA ───────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          className="flex h-7 w-7 items-center justify-center rounded-[4px] transition-colors"
          style={{ color: textDim }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = hoverBg;
            e.currentTarget.style.color = textMain;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = textDim;
          }}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>

        {/* Menú */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen((p) => !p)}
            className="flex h-7 items-center gap-1.5 rounded-[4px] px-2.5 text-[11px] font-medium transition-colors"
            style={{ color: textDim }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = hoverBg;
              e.currentTarget.style.color = textMain;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = textDim;
            }}
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
              <div
                className="absolute right-0 top-[calc(100%+6px)] z-50 w-[200px] rounded-[6px] p-1.5 shadow-lg"
                style={{
                  backgroundColor: theme.colors.bgWidget,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onMyHMIs();
                  }}
                  className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-[12px] transition-colors"
                  style={{ color: theme.colors.textMain }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = theme.colors.bgPreview)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <FolderKanban
                    className="h-4 w-4"
                    style={{ color: theme.colors.textDim }}
                  />
                  Mis HMIs
                </button>

                <div
                  className="my-1"
                  style={{ borderTop: `1px solid ${theme.colors.border}` }}
                />

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEditHMI();
                  }}
                  className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-[12px] transition-colors"
                  style={{ color: theme.colors.success }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = theme.colors.bgPreview)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
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