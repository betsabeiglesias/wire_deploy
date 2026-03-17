import { Activity, Heart, Layers3, ShieldCheck } from "lucide-react";
import Sidebar from "../modules/sidebar/Sidebar";
import { FavoriteViews } from "../modules/favoritos/components/FavoriteViews";
import { useThemeStore } from "../store/useThemeStore";

export default function SavedPage() {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === "dark";

  const statusCards = [
    {
      label: "Favoritos",
      value: "Activos",
      icon: Heart,
      tone: "cyan",
    },
    {
      label: "Bibliotecas",
      value: "Power BI + HMI",
      icon: Layers3,
      tone: "steel",
    },
    {
      label: "Estado",
      value: "Sincronizado",
      icon: ShieldCheck,
      tone: "amber",
    },
  ];

  return (
    <div
      className={`flex h-screen w-full overflow-hidden ${
        isDark ? "bg-[#070d14]" : "bg-[#eef2f4]"
      }`}
    >
      <Sidebar />

      <main
        className={`flex-1 overflow-y-auto ${
          isDark ? "bg-[#070d14]" : "bg-[#eef2f4]"
        }`}
      >
        <div className="min-h-full px-3 py-3 md:px-5 md:py-5">
          <div
            className={`overflow-hidden rounded-[30px] ${
              isDark
                ? "border border-[#162433] bg-[linear-gradient(180deg,#0a1119_0%,#0d151e_44%,#101a24_100%)] shadow-[0_34px_92px_-54px_rgba(0,0,0,0.68)]"
                : "border border-[#d9e0e5] bg-[linear-gradient(180deg,#f7f9fa_0%,#f2f5f6_100%)] shadow-[0_28px_68px_-44px_rgba(31,41,55,0.16)]"
            }`}
          >
            <section
              className={`relative overflow-hidden px-6 py-7 md:px-8 md:py-8 ${
                isDark ? "border-b border-[#162433]" : "border-b border-[#dde4e8]"
              }`}
            >
              <div
                className={`absolute inset-0 ${
                  isDark
                    ? "opacity-[0.16] [background-image:linear-gradient(rgba(124,215,255,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(124,215,255,0.28)_1px,transparent_1px)] [background-size:28px_28px]"
                    : "opacity-[0.08] [background-image:linear-gradient(rgba(52,85,112,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(52,85,112,0.16)_1px,transparent_1px)] [background-size:28px_28px]"
                }`}
              />
              <div
                className={`absolute inset-x-0 top-0 h-px ${
                  isDark
                    ? "bg-[linear-gradient(90deg,transparent,rgba(124,215,255,0.48),transparent)]"
                    : "bg-[linear-gradient(90deg,transparent,rgba(37,95,130,0.22),transparent)]"
                }`}
              />
              <div
                className={`absolute left-0 top-0 h-full w-[38%] ${
                  isDark
                    ? "bg-[linear-gradient(90deg,rgba(124,215,255,0.06),transparent)]"
                    : "bg-[linear-gradient(90deg,rgba(121,200,241,0.08),transparent)]"
                }`}
              />

              <div className="relative z-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="max-w-4xl">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                      isDark
                        ? "border border-[#21415f] bg-[#0d1d2a] text-[#89dfff]"
                        : "border border-[#d6e2ea] bg-white text-[#5f7487]"
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                    SCADA favorites control
                  </div>

                  <h1
                    className={`mt-6 max-w-5xl text-4xl font-semibold leading-[0.92] tracking-[-0.06em] md:text-6xl ${
                      isDark ? "text-white" : "text-[#2f3942]"
                    }`}
                  >
                    Consola tecnica
                    <br />
                    <span className={isDark ? "text-[#89dfff]" : "text-[#255f82]"}>
                      para accesos favoritos y vistas criticas.
                    </span>
                  </h1>

                  <p
                    className={`mt-5 max-w-3xl text-sm leading-7 md:text-base ${
                      isDark ? "text-[#98a9bb]" : "text-[#667380]"
                    }`}
                  >
                    Reune dashboards y layouts en una sola zona de acceso rapido.
                    La lectura se vuelve mas operativa, mas tecnica y mas cercana
                    a una consola SCADA de supervisión diaria.
                  </p>
                </div>

                <aside className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  {statusCards.map((item) => {
                    const Icon = item.icon;
                    const tones = isDark
                      ? {
                          cyan: "border-[#21415f] bg-[linear-gradient(145deg,#0f2232_0%,#133149_100%)] text-[#89dfff]",
                          steel:
                            "border-[#2d3b49] bg-[linear-gradient(145deg,#121a22_0%,#1a2632_100%)] text-[#d4dde7]",
                          amber:
                            "border-[#4b4328] bg-[linear-gradient(145deg,#221e11_0%,#2d2717_100%)] text-[#f1cf80]",
                        }
                      : {
                          cyan: "border-[#d6e2ea] bg-white text-[#255f82]",
                          steel: "border-[#dce3e8] bg-white text-[#49566f]",
                          amber: "border-[#ece3c6] bg-white text-[#8f6a18]",
                        };

                    return (
                      <article
                        key={item.label}
                        className={`rounded-[22px] border px-4 py-4 ${tones[item.tone]}`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] uppercase tracking-[0.16em] opacity-80">
                            {item.label}
                          </p>
                          <Icon className="h-4.5 w-4.5 opacity-90" />
                        </div>
                        <p className="mt-4 text-2xl font-semibold tracking-[-0.05em]">
                          {item.value}
                        </p>
                      </article>
                    );
                  })}
                </aside>
              </div>
            </section>

            <section className="px-6 py-6 md:px-8 md:py-8">
              <FavoriteViews title="Power BI" type="mypowerbi" />
              <FavoriteViews title="HMI" type="mylayout" />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
