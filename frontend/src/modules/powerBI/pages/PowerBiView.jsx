import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Expand,
  FolderKanban,
  House,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import Button from "../../../components/Button";

function PowerBiView() {
  const location = useLocation();
  const navigate = useNavigate();
  const reportData = location.state?.infoPowerBi;

  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setZoom(1);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error al activar pantalla completa:", err);
      });
      return;
    }

    document.exitFullscreen();
  };

  useEffect(() => {
    const handleWheel = (event) => {
      if (!event.ctrlKey) return;

      event.preventDefault();
      event.deltaY < 0 ? zoomIn() : zoomOut();
    };

    const container = containerRef.current;

    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  if (!reportData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#eef2f4]">
        <div className="rounded-[30px] border border-[#dce3e8] bg-white px-10 py-8 text-center shadow-[0_24px_40px_-28px_rgba(31,41,55,0.14)]">
          <p className="text-lg font-semibold text-[#2f3942]">
            No hay datos del informe.
          </p>
          <p className="mt-2 text-sm text-[#697682]">
            Vuelve a la lista y selecciona una vista de Power BI.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#eef2f4]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(52,85,112,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(52,85,112,0.16)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute right-[-60px] top-[-40px] h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.14),transparent_72%)]" />
      <div className="absolute left-0 top-0 h-full w-[30%] bg-[linear-gradient(90deg,rgba(121,200,241,0.08),transparent)]" />

      <div className="pointer-events-none absolute left-4 top-4 z-50 md:left-6 md:top-6">
        <div className="pointer-events-auto rounded-[24px] border border-[#dce3e8] bg-white/92 px-4 py-3 shadow-[0_18px_36px_-24px_rgba(31,41,55,0.24)] backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7a8794]">
            Power BI
          </p>
          <h1
            className="mt-2 max-w-[260px] truncate text-sm font-semibold text-[#1e293b] md:max-w-[340px]"
            title={reportData.name}
          >
            {reportData.name || "Visualizacion"}
          </h1>
          <p className="mt-1 text-xs text-[#697682]">Vista analitica en vivo</p>
        </div>
      </div>

      <div className="pointer-events-none absolute right-4 top-4 z-50 md:right-6 md:top-6">
        <div className="pointer-events-auto relative">
          <Button
            variant="secondary"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="min-w-[180px] justify-between bg-white/94 shadow-[0_18px_36px_-24px_rgba(31,41,55,0.24)] backdrop-blur-sm"
          >
            Acciones
            <ChevronDown
              className={`ml-3 h-4 w-4 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
            />
          </Button>

          {isMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[230px] rounded-[24px] border border-[#dce3e8] bg-white p-3 shadow-[0_24px_40px_-24px_rgba(31,41,55,0.18)]">
              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/");
                  }}
                  className="w-full justify-start"
                >
                  <House className="mr-2 h-4 w-4" />
                  Home
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/powerbi-all");
                  }}
                  className="w-full justify-start"
                >
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Mis Power BI
                </Button>

                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    toggleFullScreen();
                  }}
                  className="w-full justify-start"
                >
                  <Expand className="mr-2 h-4 w-4" />
                  Pantalla completa
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-50 -translate-x-1/2 md:bottom-6">
        <div className="pointer-events-auto flex items-center gap-2 rounded-[24px] border border-[#dce3e8] bg-white/94 px-3 py-3 shadow-[0_18px_36px_-24px_rgba(31,41,55,0.24)] backdrop-blur-sm">
          <Button variant="secondary" onClick={zoomOut} className="min-w-[44px] px-3">
            <Minus className="h-4 w-4" />
          </Button>

          <div className="min-w-[74px] text-center text-sm font-semibold text-[#2f3942]">
            {Math.round(zoom * 100)}%
          </div>

          <Button variant="secondary" onClick={zoomIn} className="min-w-[44px] px-3">
            <Plus className="h-4 w-4" />
          </Button>

          <Button variant="secondary" onClick={resetZoom} className="px-3">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="relative z-10 h-full w-full overflow-auto p-2 md:p-3">
        <div
          className="origin-top-left h-full w-full rounded-[30px] border border-[#dce3e8] bg-white shadow-[0_24px_40px_-28px_rgba(31,41,55,0.18)] transition-transform duration-150"
          style={{
            transform: `scale(${zoom})`,
            width: `${100 / zoom}%`,
            height: `${100 / zoom}%`,
            minWidth: "100%",
            minHeight: "100%",
          }}
        >
          <iframe
            title={reportData.name}
            src={reportData.embed_url}
            className="h-full w-full rounded-[30px] border-none"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default PowerBiView;
