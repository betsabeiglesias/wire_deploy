import React from "react";
import {
  ArrowRight,
  CircleDot,
  Cpu,
  FolderKanban,
  Network,
  PanelsTopLeft,
  ScanSearch,
  Waves,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../sidebar/Sidebar";
import { useThemeStore } from "../../../store/useThemeStore";

const HmiPage = () => {
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === "dark";

  const modules = [
    {
      title: "Disenar HMI",
      description:
        "Configura la estructura visual de cada pantalla, organiza bloques y define la experiencia operativa.",
      icon: PanelsTopLeft,
      eyebrow: "Editor visual",
      route: "/organizar-scada",
      accent: "from-[#eef5ff] to-[#ffffff] text-[#2563eb]",
    },
    {
      title: "Comunicaciones",
      description:
        "Conecta tags, protocolos y estados para enlazar la capa HMI con la infraestructura industrial.",
      icon: Network,
      eyebrow: "Integracion",
      route: "/scada",
      accent: "from-[#ecfdf5] to-[#ffffff] text-[#059669]",
    },
    {
      title: "Mis HMIs",
      description:
        "Accede a proyectos desplegados, pantallas guardadas y entornos listos para seguimiento continuo.",
      icon: FolderKanban,
      eyebrow: "Biblioteca",
      route: "/layout",
      accent: "from-[#f5f3ff] to-[#ffffff] text-[#7c3aed]",
    },
  ];

  const sideNotes = [
    {
      title: "Estado general",
      value: "Sistema listo",
      icon: CircleDot,
    },
    {
      title: "Capa de datos",
      value: "Tags sincronizados",
      icon: Waves,
    },
    {
      title: "Revision",
      value: "Ultima sesion activa",
      icon: ScanSearch,
    },
  ];

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
      <Sidebar />

      <main className={`flex-1 overflow-y-auto ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
        <div className="min-h-full px-4 py-4 md:px-6 md:py-6">
          <div className={`overflow-hidden rounded-[30px] ${isDark ? "border border-white/10 bg-[linear-gradient(160deg,#09152f_0%,#0d1d40_42%,#132857_100%)] shadow-[0_24px_70px_-42px_rgba(0,0,0,0.35)]" : "border border-[#ececee] bg-[#fbfbfc] shadow-[0_24px_70px_-42px_rgba(31,41,55,0.12)]"}`}>
            <section className={`px-6 py-6 md:px-8 md:py-8 ${isDark ? "border-b border-white/10" : "border-b border-[#ececee]"}`}>
              <div className="grid gap-6">
                <article className={`relative overflow-hidden rounded-[34px] px-6 py-7 md:px-8 md:py-8 ${isDark ? "border border-white/10 bg-[linear-gradient(180deg,rgba(246,249,255,0.96)_0%,rgba(235,241,250,0.92)_100%)] shadow-[0_24px_50px_-34px_rgba(0,0,0,0.35)]" : "border border-[#ececee] bg-[#ffffff] shadow-[0_24px_50px_-34px_rgba(31,41,55,0.15)]"}`}>
                  <div className={`absolute inset-0 ${isDark ? "opacity-35 [background-image:radial-gradient(#7ec8ff_1px,transparent_1px)] [background-size:8px_8px]" : "opacity-70 [background-image:radial-gradient(#d9cdf7_1px,transparent_1px)] [background-size:8px_8px]"}`} />
                  <div className={`absolute right-[-30px] top-[-20px] h-[220px] w-[220px] rounded-full ${isDark ? "bg-[radial-gradient(circle,rgba(114,176,255,0.16),transparent_72%)]" : "bg-[radial-gradient(circle,rgba(196,181,253,0.16),transparent_72%)]"}`} />
                  <div className="relative z-10 flex justify-start">
                    <div className="max-w-3xl text-left">
                      <h1 className={`max-w-2xl text-4xl font-semibold leading-[1] tracking-[-0.05em] md:text-6xl ${isDark ? "text-[#12284a]" : "text-[#464851]"}`}>
                        Organiza la operacion
                        <br />
                        <span className={isDark ? "text-[#1d3f72]" : "text-[#79c8f1]"}>
                          desde una sola vista.
                        </span>
                      </h1>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <section className="px-6 py-6 md:px-8 md:py-8">
              <div className="grid gap-6 lg:grid-cols-3">
                {modules.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.title}
                      className={`relative overflow-hidden rounded-[34px] p-6 ${isDark ? "border border-white/10 bg-[linear-gradient(180deg,rgba(246,249,255,0.96)_0%,rgba(235,241,250,0.92)_100%)] shadow-[0_20px_40px_-30px_rgba(0,0,0,0.35)]" : "border border-[#ececee] bg-white shadow-[0_20px_40px_-30px_rgba(31,41,55,0.12)]"}`}
                    >
                      <div
                        className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${item.accent} opacity-90`}
                      />

                      <div className="relative z-10">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium text-[#666b76] backdrop-blur">
                            {item.eyebrow}
                          </span>
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-[#41454f] backdrop-blur">
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>

                        <h2 className="mt-16 text-3xl font-semibold tracking-[-0.04em] text-[#3a3d46]">
                          {item.title}
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-[#8a8d97]">
                          {item.description}
                        </p>

                        <button
                          type="button"
                          onClick={() => navigate(item.route)}
                          className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#e3e6ec] bg-[#fafafb] px-4 py-2 text-sm font-medium text-[#3e434d] transition hover:bg-white"
                        >
                          Acceder
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HmiPage;
