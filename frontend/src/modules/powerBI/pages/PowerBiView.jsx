import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import HomeButton from "../../../components/HomeButton";

function PowerBiView() {
  const location = useLocation();
  const datosRecibidos = location.state?.infoPowerBi;

  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setZoom(1);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error al activar pantalla completa:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        e.deltaY < 0 ? zoomIn() : zoomOut();
      }
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

  if (!datosRecibidos) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        No hay datos del informe.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <HomeButton />

      {/* Header */}
      <header className="px-6 py-4 border-b bg-white flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Visualización Power BI
          </h1>
          <p className="text-sm text-gray-600">
            Informe de Predicción
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={zoomOut}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            −
          </button>

          <span className="text-sm font-mono w-14 text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={zoomIn}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            +
          </button>

          <button
            onClick={resetZoom}
            className="text-sm text-blue-600 hover:underline ml-2"
          >
            Reset
          </button>

          <button
            onClick={toggleFullScreen}
            className="ml-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-black transition"
          >
            Pantalla completa
          </button>
        </div>
      </header>

      {/* Contenedor Power BI */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-100"
      >
        <div
          className="origin-top-left transition-transform duration-150"
          style={{
            transform: `scale(${zoom})`,
            width: `${100 / zoom}%`,
            height: `${100 / zoom}%`,
            minWidth: "100%",
            minHeight: "100%",
          }}
        >
          <iframe
            title={datosRecibidos.name}
            src={datosRecibidos.embed_url}
            className="w-full h-full border-none"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default PowerBiView;
