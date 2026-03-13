import React from "react";
import {
  Bot,
  ChartColumnBig,
  MapPinned,
  MonitorUp,
  Search,
  ShieldCheck,
  Sparkles,
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

  const categories = [
    "Operations",
    "Analytics",
    "Support",
    "Monitoring",
    "Map & Data",
    "Settings",
  ];

  const integrations = [
    {
      title: "HMI Control",
      description:
        "Supervision de procesos, estados y acceso central al entorno operativo.",
      icon: MonitorUp,
      onClick: () => navigate("/hmi"),
    },
    {
      title: "Power BI",
      description:
        "Metricas ejecutivas, cuadros de mando e indicadores consolidados.",
      icon: ChartColumnBig,
      onClick: () => navigate("/powerbi-all"),
    },
    // {
    //   title: "Assistant",
    //   description:
    //     "Soporte contextual para consultas rapidas y ayuda guiada dentro del sistema.",
    //   icon: Bot,
    //   onClick: () => window.open(SERVICE_URLS.chatbot, "_blank"),
    // },
  ];

  const floatingIcons = [
    { top: "12%", left: "20%", icon: ShieldCheck, tone: "text-[#1d3f72]" },
    { top: "35%", left: "8%", icon: Bot, tone: "text-[#76b7ff]" },
    { top: "30%", right: "10%", icon: ChartColumnBig, tone: "text-[#7ec8ff]" },
    { top: "58%", right: "14%", icon: Sparkles, tone: "text-[#5aa6ff]" },
    { top: "56%", left: "18%", icon: MonitorUp, tone: "text-[#4054e8]" },
  ];

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
      <Sidebar />

      <main className={`flex-1 overflow-y-auto ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
        <div className="min-h-full px-4 py-4 md:px-6 md:py-6">
          <div className={`overflow-hidden rounded-[30px] ${
            isDark
              ? "border border-white/10 bg-[linear-gradient(160deg,#09152f_0%,#0d1d40_42%,#132857_100%)] shadow-[0_24px_70px_-42px_rgba(0,0,0,0.35)]"
              : "border border-[#ececee] bg-[#fbfbfc] shadow-[0_24px_70px_-42px_rgba(31,41,55,0.12)]"
          }`}>
            <section className={` inset-x-0 top-0 h-[220px] relative px-6 pb-14 pt-8 md:px-10 md:pb-16 ${isDark ? "border-b border-white/10" : "border-b border-[#ececee]"}`}>
              <div className="absolute inset-x-0 top-0 h-[220px]">
                <div className={`absolute inset-0 [background-size:8px_8px] ${
                  isDark
                    ? "opacity-40 [background-image:radial-gradient(#7ec8ff_1px,transparent_1px)]"
                    : "opacity-70 [background-image:radial-gradient(#d9cdf7_1px,transparent_1px)]"
                }`} />
                {isDark && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(114,176,255,0.18),transparent_32%)]" />
                )}
              </div>

              {floatingIcons.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={index}
                    className={`absolute z-10 flex h-14 w-14 items-center justify-center rounded-2xl ${
                      isDark
                        ? "border border-white/12 bg-white/8 shadow-[0_16px_26px_-18px_rgba(0,0,0,0.35)] backdrop-blur-sm"
                        : "border border-[#ececee] bg-white shadow-[0_16px_26px_-18px_rgba(31,41,55,0.12)]"
                    }`}
                    style={{
                      top: item.top,
                      left: item.left,
                      right: item.right,
                    }}
                  >
                    <Icon className={`h-6 w-6 ${item.tone}`} />
                  </div>
                );
              })}

              <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
                <h1 className={`mt-6 text-3xl font-semibold leading-[1.02] tracking-[-0.04em] md:text-5xl ${isDark ? "text-white" : "text-[#4a4a4e]"}`}>
                  Centro de control para
                  <br />
                  <span className={isDark ? "text-[#7ec8ff]" : "text-[#79c8f1]"}>
                    operacion, analitica y supervision.
                  </span>
                </h1>
              </div>
            </section>
            <section className="px-1 py-1 md:px-6 md:py-6">
              <div className="grid gap-6 xl:grid-cols-3">
                {integrations.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.title}
                      className={`rounded-[28px] p-6 ${
                        isDark
                          ? "border border-white/10 bg-[linear-gradient(180deg,rgba(246,249,255,0.96)_0%,rgba(235,241,250,0.92)_100%)] shadow-[0_20px_40px_-30px_rgba(0,0,0,0.35)]"
                          : "border border-[#f0f0f2] bg-white shadow-[0_20px_40px_-30px_rgba(31,41,55,0.12)]"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${isDark ? "border border-[#dde4ee] bg-white text-[#1d3f72]" : "border border-[#ededf1] bg-[#fbfbfc] text-[#5b606d]"}`}>
                          <Icon className="h-6 w-6" />
                        </div>

                        <div className="min-w-0">
                          <h2 className={`text-3xl font-semibold tracking-[-0.04em] ${isDark ? "text-[#12284a]" : "text-[#3b3d45]"}`}>
                            {item.title}
                          </h2>

                          <p className={`mt-3 text-sm leading-7 ${isDark ? "text-[#667b96]" : "text-[#8a8d97]"}`}>
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={item.onClick}
                        className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-medium transition ${
                          isDark
                            ? "bg-[#1d3f72] text-white hover:bg-[#17345d]"
                            : "border border-[#e5e6ea] bg-[#fafafb] text-[#33363f] hover:bg-white"
                        }`}
                      >
                        Entrar
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className=" px-6 py-8 md:px-5 md:py-5">
              <div className={`overflow-hidden rounded-[28px] ${
                isDark
                  ? "border border-white/10 bg-[linear-gradient(180deg,rgba(246,249,255,0.96)_0%,rgba(235,241,250,0.92)_100%)] shadow-[0_20px_40px_-30px_rgba(0,0,0,0.35)]"
                  : "border border-[#ececee] bg-white shadow-[0_20px_40px_-30px_rgba(31,41,55,0.12)]"
              }`}>
                <div className="h-[46vh] min-h-[380px]">
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
