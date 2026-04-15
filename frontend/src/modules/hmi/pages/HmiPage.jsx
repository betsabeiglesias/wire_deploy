import React from "react";
import { FolderKanban, Network, PanelsTopLeft, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../sidebar/Sidebar";
import Card from "../../../components/ui/Card";
import Header from "../../../components/ui/Header";
import { Activity } from "lucide-react";

const HmiPage = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Diseñar HMI",
      description:
        "Configura la estructura visual de cada pantalla, organiza bloques y define la experiencia operativa.",
      icon: PanelsTopLeft,
      eyebrow: "Editor visual",
      route: "/organizar-scada",
      variant: "operation",
    },
    {
      title: "Comunicaciones",
      description:
        "Conecta tags, protocolos y estados para enlazar la capa HMI con la infraestructura industrial.",
      icon: Network,
      eyebrow: "Integración",
      route: "/scada",
      variant: "operation",
    },
    {
      title: "Mis HMIs",
      description:
        "Accede a proyectos desplegados, pantallas guardadas y entornos listos para seguimiento continuo.",
      icon: FolderKanban,
      eyebrow: "Biblioteca",
      route: "/layout",
      variant: "operation",
    },
    {
      title: "Configurar comunicaciones",
      description:
        "Define dispositivos, enlaces y parámetros de comunicación para preparar la conectividad de la capa operativa.",
      icon: SlidersHorizontal,
      eyebrow: "Configuración",
      route: "/devices",
      variant: "operation",
    },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f7f8]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#f7f7f8]">
        <div className="min-h-full px-4 py-4 md:px-6 md:py-6">
          <div className="overflow-hidden rounded-[30px] border border-[#ececee] bg-[#fbfbfc] shadow-[0_24px_70px_-42px_rgba(31,41,55,0.12)]">
            <Header
              badgeText="Scada"
              title="Organiza la operación"
              highlightText="desde una sola vista"
              icon={Activity}
            />
            <section className="px-6 py-6 md:px-8 md:py-8">
              <div className="grid gap-6 lg:grid-cols-3">
                {modules.map((item) => (
                  <Card
                    key={item.title}
                    title={item.title}
                    description={item.description}
                    badge={item.eyebrow}
                    icon={item.icon}
                    variant={item.variant}
                    onClick={() => navigate(item.route)}
                    className="h-full"
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HmiPage;
