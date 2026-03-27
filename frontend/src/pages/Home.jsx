import React, { useRef } from "react";
import {
  Activity,
  ChartColumnBig,
  ChevronLeft,
  ChevronRight,
  MapPinned,
  MonitorCog,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../modules/sidebar/Sidebar";
import MapView from "@/modules/maps/components/MapView";
import Card from "../components/ui/Card";
import Header from "../components/ui/Header";

const Home = () => {
  const navigate = useNavigate();
  const cardsViewportRef = useRef(null);

  const commandCards = [
    {
      title: "Centro HMI",
      description:
        "Acceso a supervision visual, estados de proceso y control de pantallas operativas.",
      onClick: () => navigate("/hmi"),
      icon: MonitorCog,
      badge: "Operacion",
      variant: "operation",
    },
    {
      title: "Analitica Power BI",
      description:
        "Indicadores de rendimiento, tendencias de linea y lectura consolidada de KPIs criticos.",
      onClick: () => navigate("/powerbi-all"),
      icon: ChartColumnBig,
      badge: "Analitica",
      variant: "analytics",
    },
  ];

  const cardsCount = commandCards.length;
  const hasCarousel = cardsCount > 4;
  const commandCardWidth = "20rem";
  const commandCardsMaxWidth = "calc((20rem * 3) + (1rem * 2))";

  const scrollCards = (direction) => {
    const viewport = cardsViewportRef.current;
    if (!viewport) return;

    const amount = Math.max(viewport.clientWidth * 0.72, 280);
    viewport.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#eef2f4]">
      <Sidebar />

      <main className="flex min-w-0 flex-1 overflow-hidden bg-[#eef2f4]">
        <div className="flex h-full w-full min-h-0 p-3 md:p-4">
          <div className="flex h-full w-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-[#d9e0e5] bg-[linear-gradient(180deg,#f7f9fa_0%,#f2f5f6_100%)] shadow-lg">
            <Header
              badgeText="RDT WIRE"
              title="Home"
              highlightText="RDT WIRE"
              icon={Activity}
            />

            <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:gap-5 md:p-5">
              <section className="flex-shrink-0">
                <div className="flex items-center gap-3">
                  {hasCarousel && (
                    <button
                      type="button"
                      onClick={() => scrollCards("left")}
                      className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[#c9d4db] bg-white text-[#255f82] shadow-sm transition hover:border-[#9eb8c5] hover:bg-[#f7fbfd] xl:inline-flex"
                      aria-label="Desplazar tarjetas a la izquierda"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                  )}

                  <div
                    ref={cardsViewportRef}
                    className={[
                      "min-w-0 flex-1",
                      hasCarousel
                        ? "overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        : "overflow-hidden",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        hasCarousel
                          ? "flex w-max gap-4 px-3 py-3 md:px-8 md:py-8"
                          : "flex w-full flex-wrap justify-center gap-4 px-3 py-3 md:px-8 md:py-8",
                      ].join(" ")}
                      style={hasCarousel ? undefined : { maxWidth: commandCardsMaxWidth, marginInline: "auto" }}
                    >
                      {commandCards.map((card, index) => (
                        <div
                          key={`${card.title}-${index}`}
                          className={
                            hasCarousel
                              ? "w-[280px] flex-shrink-0 md:w-[300px] xl:w-[calc((100%-3rem)/4)] xl:max-w-[320px]"
                              : "w-full max-w-[20rem] flex-shrink-0"
                          }
                          style={hasCarousel ? undefined : { width: commandCardWidth }}
                        >
                          <Card {...card} className="min-h-[220px] p-3.5 md:p-4" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {hasCarousel && (
                    <button
                      type="button"
                      onClick={() => scrollCards("right")}
                      className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[#c9d4db] bg-white text-[#255f82] shadow-sm transition hover:border-[#9eb8c5] hover:bg-[#f7fbfd] xl:inline-flex"
                      aria-label="Desplazar tarjetas a la derecha"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </section>

              <section className="min-h-0 flex-1">
                <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-[#051145] bg-white shadow-sm">
                  {/* <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-[#e5eaee] px-4 py-3 md:px-5">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#7d8792]">
                        Geolocalizacion industrial
                      </p>
                      <h4 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[#2f3942] md:text-xl">
                        Red de activos desplegados
                      </h4>
                    </div>

                    <div className="hidden items-center gap-2 rounded-full border border-[#051145] bg-[#f7fbfd] px-3 py-1.5 text-xs font-medium text-[#255f82] md:inline-flex">
                      <MapPinned className="h-3.5 w-3.5" />
                      Mapa activo
                    </div>
                  </div> */}

                  <div className="min-h-0 flex-1">
                    <MapView />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
