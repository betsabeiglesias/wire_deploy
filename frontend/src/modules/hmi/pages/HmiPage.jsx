import React from "react";
import { useNavigate } from "react-router-dom";
import HomeButton from "../../../components/HomeButton";


const HmiPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">

      
      <main className="flex-1 p-8 bg-gray-50 text-gray-900 transition-all duration-300">
       <header className="mb-20 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Panel HMI</h1>
        <HomeButton className="-ml-2"/>
      </header>

       

        <section className="grid grid-cols-3 gap-8 m-6">
          {/* Opción 1: Diseñar HMI */}
          <div
            className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition cursor-pointer border-t-4 border-blue-500"
            onClick={() => navigate("/organizar-scada")}
          >
            <div className="text-xl font-bold mb-2">Diseñar HMI</div>
            <p className="text-gray-500 text-sm">Configuración y editor de interfaces.</p>
          </div>

          {/* Opción 2: Comunicaciones */}
          <div
            className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition cursor-pointer border-t-4 border-green-500"
            onClick={() => navigate("/scada")}
          >
            <div className="text-xl font-bold mb-2">Comunicaciones</div>
            <p className="text-gray-500 text-sm">Gestión de tags y protocolos OPC UA.</p>
          </div>

          {/* Opción 3: Mis HMIs */}
          <div
            className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition cursor-pointer border-t-4 border-purple-500"
            onClick={() => navigate("/layout")}
          >
            <div className="text-xl font-bold mb-2">Mis HMIs</div>
            <p className="text-gray-500 text-sm">Visualización de planos y proyectos guardados.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HmiPage;