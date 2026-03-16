import React from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  ChartColumnBig,
  Gauge,
  MapPinned,
  MonitorCog,
  Network,
  RadioTower,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../modules/sidebar/Sidebar";
import { SERVICE_URLS } from "../routes/service_urls";
import MapView from "@/modules/maps/components/MapView";
import { useThemeStore } from "../store/useThemeStore";

const Home = () => {
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === "dark";

  const goToHmi = () => navigate("/hmi");
  const goToPowerBi = () => navigate("/powerbi-all");
  const goToChatBot = () => window.open(SERVICE_URLS.chatbot, "_blank");

  const commandCards = [
    {
      title: "Centro HMI",
      description:
        "Acceso a supervision visual, estados de proceso y control de pantallas operativas.",
      onClick: goToHmi,
      icon: MonitorCog,
      badge: "Operacion",
      tone: isDark
        ? "border-[#28435e] bg-[linear-gradient(145deg,#10202f_0%,#153149_55%,#183f5d_100%)]"
        : "border-[#d6e2ea] bg-[linear-gradient(145deg,#f7fbfd_0%,#edf5f8_55%,#fdfefe_100%)]",
      iconTone: isDark
        ? "bg-[#7cd7ff] text-[#0d2337]"
        : "bg-[#194b68] text-white",
      accent: isDark ? "text-[#89dfff]" : "text-[#255f82]",
    },
    {
      title: "Analitica Power BI",
      description:
        "Indicadores de rendimiento, tendencias de linea y lectura consolidada de KPIs criticos.",
      onClick: goToPowerBi,
      icon: ChartColumnBig,
      badge: "Analitica",
      tone: isDark
        ? "border-[#4a4c3d] bg-[linear-gradient(145deg,#25281d_0%,#343824_55%,#44492d_100%)]"
        : "border-[#e8e2c5] bg-[linear-gradient(145deg,#fffdf5_0%,#f8f2dd_55%,#fdfcf8_100%)]",
      iconTone: isDark
        ? "bg-[#e9c46a] text-[#33270b]"
        : "bg-[#8f6a18] text-white",
      accent: isDark ? "text-[#f1cf80]" : "text-[#8f6a18]",
    },
    {
      title: "Asistente digital",
      description:
        "Canal rapido para apoyo contextual, consulta guiada y soporte sobre la operacion diaria.",
      onClick: goToChatBot,
      icon: Bot,
      badge: "Soporte",
      tone: isDark
        ? "border-[#4b465f] bg-[linear-gradient(145deg,#1c1f2b_0%,#2b3042_55%,#3a425a_100%)]"
        : "border-[#dde0eb] bg-[linear-gradient(145deg,#f8f9fc_0%,#eef1f8_55%,#fcfcfe_100%)]",
      iconTone: isDark
        ? "bg-[#c0c8da] text-[#252c3b]"
        : "bg-[#49566f] text-white",
      accent: isDark ? "text-[#d5dbea]" : "text-[#49566f]",
    },
  ];

  const quickSignals = [
    {
      label: "Estado red OT",
      value: "Estable",
      detail: "98.4% disponibilidad",
      icon: Network,
    },
    {
      label: "Telemetria",
      value: "Activa",
      detail: "148 nodos en linea",
      icon: RadioTower,
    },
    {
      label: "Alarmas",
      value: "03",
      detail: "2 preventivas, 1 critica",
      icon: AlertTriangle,
    },
    {
      label: "Seguridad",
      value: "Alta",
      detail: "Politicas aplicadas",
      icon: ShieldCheck,
    },
  ];

  const controlNotes = [
    {
      title: "Linea principal",
      value: "Produccion sincronizada",
    },
    {
      title: "Consumo energetico",
      value: "Dentro de umbral",
    },
    {
      title: "Mantenimiento",
      value: "Revision prevista 18:00",
    },
  ];

  return (
    <div
      className={`flex h-screen w-full overflow-hidden ${
        isDark ? "bg-[#0b1631]" : "bg-[#eef2f4]"
      }`}
    >
      <Sidebar />

      <main
        className={`flex-1 overflow-y-auto ${
          isDark ? "bg-[#0b1631]" : "bg-[#eef2f4]"
        }`}
      >
        <div className="min-h-full px-4 py-4 md:px-6 md:py-6">
          <div
            className={`overflow-hidden rounded-[30px] ${
              isDark
                ? "border border-white/10 bg-[linear-gradient(180deg,#09152f_0%,#0d1d40_45%,#132857_100%)] shadow-[0_32px_90px_-52px_rgba(0,0,0,0.52)]"
                : "border border-[#d9e0e5] bg-[linear-gradient(180deg,#f7f9fa_0%,#f2f5f6_100%)] shadow-[0_28px_70px_-46px_rgba(31,41,55,0.16)]"
            }`}
          >
            <section
              className={`relative overflow-hidden px-6 py-7 md:px-8 md:py-8 ${
                isDark ? "border-b border-[#1b2a3a]" : "border-b border-[#dde4e8]"
              }`}
            >
              <div
                className={`absolute inset-0 ${
                  isDark
                    ? "opacity-[0.12] [background-image:linear-gradient(rgba(126,200,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(126,200,255,0.5)_1px,transparent_1px)] [background-size:64px_64px]"
                    : "opacity-[0.08] [background-image:linear-gradient(rgba(52,85,112,0.42)_1px,transparent_1px),linear-gradient(90deg,rgba(52,85,112,0.42)_1px,transparent_1px)] [background-size:64px_64px]"
                }`}
              />
              <div
                className={`absolute left-[-6%] top-[-10%] h-[280px] w-[280px] rounded-full ${
                  isDark
                    ? "bg-[radial-gradient(circle,rgba(114,176,255,0.18),transparent_70%)]"
                    : "bg-[radial-gradient(circle,rgba(121,200,241,0.14),transparent_70%)]"
                }`}
              />
              <div
                className={`absolute right-[-4%] top-[18%] h-[220px] w-[220px] rounded-full ${
                  isDark
                    ? "bg-[radial-gradient(circle,rgba(126,200,255,0.12),transparent_72%)]"
                    : "bg-[radial-gradient(circle,rgba(233,196,106,0.12),transparent_72%)]"
                }`}
              />

              <div className="relative z-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <div
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                        isDark
                          ? "border border-[#2f5e9c] bg-[#12325f] text-[#8fd0ff]"
                          : "border border-[#d6e2ea] bg-white text-[#5f7487]"
                      }`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                    Industrial control room
                  </div>

                  <h1
                    className={`mt-6 max-w-4xl text-4xl font-semibold leading-[0.94] tracking-[-0.06em] md:text-6xl ${
                      isDark ? "text-white" : "text-[#2f3942]"
                    }`}
                  >
                    Plataforma unificada
                    <br />
                    <span className={isDark ? "text-[#8fd0ff]" : "text-[#255f82]"}>
                      para control, analitica y campo.
                    </span>
                  </h1>

                  <p
                    className={`mt-5 max-w-3xl text-sm leading-7 md:text-base ${
                      isDark ? "text-[#98a9bb]" : "text-[#667380]"
                    }`}
                  >
                    Una portada pensada como centro de mando industrial: lectura
                    rapida, estado de infraestructura y acceso directo a las
                    herramientas que realmente se usan en operacion.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {quickSignals.map((item) => {
                      const Icon = item.icon;
                      return (
                        <article
                          key={item.label}
                      className={`rounded-[24px] px-4 py-4 ${
                        isDark
                          ? "border border-[#24456f] bg-[rgba(255,255,255,0.04)]"
                          : "border border-[#dce3e8] bg-white"
                      }`}
                        >
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-[11px] uppercase tracking-[0.16em] ${
                                isDark ? "text-[#8ea6cf]" : "text-[#7d8792]"
                              }`}
                            >
                              {item.label}
                            </p>
                            <Icon
                              className={`h-4.5 w-4.5 ${
                                isDark ? "text-[#7ec8ff]" : "text-[#355570]"
                              }`}
                            />
                          </div>
                          <p
                            className={`mt-4 text-3xl font-semibold tracking-[-0.05em] ${
                              isDark ? "text-white" : "text-[#29343d]"
                            }`}
                          >
                            {item.value}
                          </p>
                          <p
                              className={`mt-2 text-sm ${
                                isDark ? "text-[#9fb4d8]" : "text-[#6b7681]"
                              }`}
                          >
                            {item.detail}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                </div>

                <aside
                    className={`rounded-[28px] p-6 ${
                      isDark
                        ? "border border-[#2f5e9c] bg-[linear-gradient(145deg,#10213d_0%,#15325f_55%,#1b467f_100%)]"
                        : "border border-[#d6e2ea] bg-[linear-gradient(145deg,#ffffff_0%,#f5f9fb_100%)]"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`text-[11px] uppercase tracking-[0.18em] ${
                          isDark ? "text-[#8ea6cf]" : "text-[#7d8792]"
                        }`}
                      >
                        Sala de control
                      </p>
                      <h2
                        className={`mt-2 text-2xl font-semibold tracking-[-0.04em] ${
                          isDark ? "text-white" : "text-[#2f3942]"
                        }`}
                      >
                        Estado operativo general
                      </h2>
                    </div>

                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          isDark
                            ? "border border-[#2f5e9c] bg-[#10284d] text-[#8fd0ff]"
                            : "border border-[#d6e2ea] bg-[#f5f9fb] text-[#255f82]"
                        }`}
                    >
                      <Gauge className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {controlNotes.map((item) => (
                      <div
                        key={item.title}
                          className={`rounded-[22px] px-4 py-4 ${
                            isDark
                              ? "border border-[#24456f] bg-[rgba(255,255,255,0.04)]"
                              : "border border-[#dde4e8] bg-white"
                          }`}
                      >
                        <p
                            className={`text-xs uppercase tracking-[0.18em] ${
                              isDark ? "text-[#8ea6cf]" : "text-[#7d8792]"
                            }`}
                        >
                          {item.title}
                        </p>
                        <p
                          className={`mt-2 text-base font-semibold ${
                            isDark ? "text-white" : "text-[#2f3942]"
                          }`}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div
                    className={`mt-5 rounded-[24px] p-5 ${
                      isDark
                        ? "border border-[#2f5e9c] bg-[linear-gradient(145deg,#14325b_0%,#1b447c_100%)]"
                        : "border border-[#e8e2c5] bg-[linear-gradient(145deg,#fffdf4_0%,#f9f2da_100%)]"
                    }`}
                  >
                    <p
                      className={`text-xs uppercase tracking-[0.18em] ${
                        isDark ? "text-[#8fd0ff]" : "text-[#8f6a18]"
                      }`}
                    >
                      Prioridad del turno
                    </p>
                    <p
                      className={`mt-2 text-xl font-semibold ${
                        isDark ? "text-white" : "text-[#3d3216]"
                      }`}
                    >
                      Mantener continuidad y anticipar incidencias.
                    </p>
                  </div>
                </aside>
              </div>
            </section>

            <section className="px-6 py-6 md:px-8 md:py-8">
              <div className="grid gap-5 xl:grid-cols-3">
                {commandCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <button
                      key={card.title}
                      type="button"
                      onClick={card.onClick}
                    className={`group overflow-hidden rounded-[28px] border p-6 text-left transition hover:-translate-y-1 hover:shadow-[0_24px_54px_-32px_rgba(0,0,0,0.24)] ${card.tone}`}
                  >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                              isDark
                                ? "border border-white/10 bg-white/6 text-[#dfe9f4]"
                                : "border border-white bg-white/80 text-[#63707e]"
                            }`}
                          >
                            {card.badge}
                          </span>

                          <h2
                            className={`mt-5 text-3xl font-semibold tracking-[-0.05em] ${
                              isDark ? "text-white" : "text-[#2f3942]"
                            }`}
                          >
                            {card.title}
                          </h2>
                        </div>

                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.iconTone}`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>

                      <p
                        className={`mt-5 text-sm leading-7 ${
                          isDark ? "text-[#c7d1db]" : "text-[#697682]"
                        }`}
                      >
                        {card.description}
                      </p>

                      <div className="mt-8 flex items-center justify-between">
                        <span
                        className={`text-sm font-semibold ${card.accent}`}
                      >
                          Acceso directo
                        </span>
                        <span
                          className={`inline-flex items-center gap-2 text-sm font-semibold ${
                            isDark ? "text-white" : "text-[#2f3942]"
                          }`}
                        >
                          Abrir
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section
              className={`px-6 pb-6 md:px-8 md:pb-8 ${
                isDark ? "" : ""
              }`}
            >
              <div
                className={`overflow-hidden rounded-[30px] ${
                  isDark
                    ? "border border-[#24456f] bg-[linear-gradient(180deg,#10213d_0%,#173252_100%)]"
                    : "border border-[#dce3e8] bg-white"
                }`}
              >
                <div
                    className={`flex items-center justify-between px-5 py-4 ${
                    isDark ? "border-b border-[#24456f]" : "border-b border-[#e5eaee]"
                  }`}
                >
                  <div>
                    <p
                      className={`text-[11px] uppercase tracking-[0.18em] ${
                        isDark ? "text-[#8ea6cf]" : "text-[#7d8792]"
                      }`}
                    >
                      Geolocalizacion industrial
                    </p>
                    <h2
                      className={`mt-1 text-2xl font-semibold tracking-[-0.03em] ${
                        isDark ? "text-white" : "text-[#2f3942]"
                      }`}
                    >
                      Red de sitios, nodos y activos desplegados
                    </h2>
                  </div>

                  <div
                      className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium md:inline-flex ${
                        isDark
                          ? "border border-[#2f5e9c] bg-[#12325f] text-[#8fd0ff]"
                          : "border border-[#d6e2ea] bg-[#f7fbfd] text-[#255f82]"
                      }`}
                  >
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
