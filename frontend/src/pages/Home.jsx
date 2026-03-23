import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../modules/sidebar/Sidebar";
import { SERVICE_URLS } from "../routes/service_urls"; 
import MapView from "@/modules/maps/components/MapView";
import { useAuthStore } from "@/store/useAuthStore";

const Home = () => {
  const navigate = useNavigate();
  const activeModules = useAuthStore((state) => state.activeModules);

  // Helper para verificar módulos
  const isEnabled = (moduleName) => activeModules.includes(moduleName);

  const goToHmi = () => navigate("/hmi");
  const goToPowerBi = () => navigate("/powerbi-all");
  // const goToChatBot = () => window.open(SERVICE_URLS.chatbot, "_blank");

  // Definimos los botones potenciales
  const allButtons = [
    {
      label: "Power BI",
      onClick: goToPowerBi,
      color: "border-blue-500",
      module: "powerbi_manager",
    },
    { 
      label: "HMI", 
      onClick: goToHmi, 
      color: "border-cyan-500",
      module: "industrial_config_manager", // O scada_manager según prefieras
    },
  ];

  // Filtramos botones: si no tiene propiedad 'module' es fijo, si la tiene, chequeamos isEnabled
  const visibleButtons = allButtons.filter(btn => !btn.module || isEnabled(btn.module));

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto transition-all duration-300">
        <header className="content-header">
          <h1 className="text-5xl font-bold mb-14 mt-6 text-blue-900">
            RDT WIRE
          </h1>
        </header>

        {/* Sección de Botones Dinámicos */}
        {visibleButtons.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {visibleButtons.map((item, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-xl py-14 px-6 shadow-sm hover:shadow-md 
                  transition duration-200 transform hover:-translate-y-1 cursor-pointer 
                  flex items-center justify-center border-l-4 ${item.color}`}
                onClick={item.onClick}
              >
                <div className="text-2xl text-gray-700 font-bold">
                  {item.label}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Sección del Mapa - Solo si map_manager está activo */}
        {isEnabled('map_manager') && (
          <section className="pb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="h-[50vh] min-h-[400px]">
                <MapView />
              </div>
            </div>
          </section>
        )}
        
        {!isEnabled('map_manager') && visibleButtons.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <i className="bx bx-package text-6xl mb-4"></i>
            <p>No hay módulos activos asignados a este despliegue.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;