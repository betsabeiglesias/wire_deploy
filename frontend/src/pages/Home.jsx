import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../modules/sidebar/Sidebar";
import "../styles/Home.css"; 
import { SERVICE_URLS } from "../App";
import MapView from '@/modules/maps/components/MapView';

const Home = () => {
  const navigate = useNavigate();

  const goToHmi = () => navigate("/hmi");
  const goToChatBot = () => window.open(SERVICE_URLS.chatbot, "_blank");
  const goToPowerBi = () => navigate("/powerbi-all");

  return (
    // h-screen asegura que el contenedor nunca mida más que la pantalla
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      <Sidebar />

      {/* Main con overflow-y-auto permite que solo el contenido haga scroll */}
      <main className="flex-1 p-8 overflow-y-auto transition-all duration-300">
        <header className="content-header">
          <h1 className="text-5xl font-bold mb-14 mt-6 text-blue-900">RDT WIRE</h1>
        </header>

        {/* Sección de Botones */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {[
            { label: "Power BI", onClick: goToPowerBi, color: "border-blue-500" },
            { label: "HMI", onClick: goToHmi, color: "border-cyan-500" },
            // { label: "Chat bot", onClick: goToChatBot, color: "border-purple-500" },
            // { label: "VR", onClick: null, color: "border-gray-500" }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-xl py-14 px-6 shadow-sm hover:shadow-md 
                transition duration-200 transform hover:-translate-y-1 cursor-pointer 
                flex items-center justify-center border-l-4 ${item.color}`}
              onClick={item.onClick}
            >
              <div className="text-2xl text-gray-700 font-bold">{item.label}</div>
            </div>
          ))}
        </section>

        {/* Sección del Mapa */}
        <section className="pb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            {/* Altura relativa para que se vea bien en cualquier pantalla */}
            <div className="h-[50vh] min-h-[400px]">
              <MapView />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;