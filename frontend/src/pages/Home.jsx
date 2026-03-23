import React from "react";
import { Activity, ChartColumnBig, MapPinned, MonitorCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../modules/sidebar/Sidebar";
import MapView from "@/modules/maps/components/MapView";
import Card from "../components/ui/Card";
import Header from "../components/ui/Header";
const Home = () => {
  const navigate = useNavigate();

  const commandCards = [
    {
      title: "Centro HMI",
      description:
        "Acceso a supervisión visual, estados de proceso y control de pantallas operativas.",
      onClick: () => navigate("/hmi"),
      icon: MonitorCog,
      badge: "Operación",
      variant: "operation",
    },
    {
      title: "Analítica Power BI",
      description:
        "Indicadores de rendimiento, tendencias de línea y lectura consolidada de KPIs críticos.",
      onClick: () => navigate("/powerbi-all"),
      icon: ChartColumnBig,
      badge: "Analítica",
      variant: "analytics",
    },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#eef2f4]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#eef2f4]">
        <div className="min-h-full px-4 py-4 md:px-6 md:py-6">
          {/* Contenedor Principal */}
          <div className="overflow-hidden rounded-[30px] border border-[#d9e0e5] bg-[linear-gradient(180deg,#f7f9fa_0%,#f2f5f6_100%)] shadow-lg">
            {/* SECCIÓN HERO */}

            <Header
              badgeText="RDT WIRE"
              title="Home"
              highlightText="RDT WIRE"
              icon={Activity}
            />

            {/* SECCIÓN DE TARJETAS */}
            <section className="px-6 py-6 md:px-8 md:py-8">
              <div className="grid gap-5 xl:grid-cols-3">
                {commandCards.map((card) => (
                  <Card key={card.title} {...card} />
                ))}
              </div>
            </section>

            {/* SECCIÓN DE MAPA */}
            <section className="px-6 pb-6 md:px-8 md:pb-8">
              <div className="overflow-hidden rounded-[30px] border border-[#051145] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[#e5eaee] px-5 py-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#7d8792]">
                      Geolocalización industrial
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#2f3942]">
                      Red de activos desplegados
                    </h2>
                  </div>

                  <div className="hidden items-center gap-2 rounded-full border border-[#051145] bg-[#f7fbfd] px-3 py-1.5 text-xs font-medium text-[#255f82] md:inline-flex">
                    <MapPinned className="h-3.5 w-3.5" />
                    Mapa activo
                  </div>
                </div>

                <div className="h-[58vh] min-h-[520px]">
                  <MapView />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
