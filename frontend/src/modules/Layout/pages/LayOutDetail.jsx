import { useEffect, useState } from "react";
import {
  MonitorPlay,
  PencilLine,
  Activity,
  Pencil,
  Trash2,
  Home,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Componentes de Negocio
import DraggableBox from "../../organizarScada/components/canvas/DraggableBox";
import Sidebar from "../../sidebar/Sidebar";
import api from "@/services/api";

// Componentes UI Reutilizables
import Header from "../../../components/ui/Header";
import Button from "../../../components/Button";

/**
 * Utilidad para normalizar los elementos del canvas
 */
const normalizeElements = (items = []) =>
  items.map((item, idx) => ({
    id: item.id || Date.now() + idx,
    x: item.x ?? 100,
    y: item.y ?? 100,
    width: item.width ?? item.data?.width ?? 150,
    height: item.height ?? item.data?.height ?? 150,
    data: item.data || item,
  }));

/**
 * Componente ViewCard: Renderiza el contenido real del SCADA escalado
 */
const ViewCard = ({ view, scale = 0.43 }) => {
  const originalWidth = 1400;
  const originalHeight = 900;
  const cardContentHeight = originalHeight * scale;

  return (
    <article className="h-[370px] overflow-hidden rounded-t-[30px] rounded-b-none border border-[#dce3e8] bg-white shadow-[0_20px_45px_-25px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_25px_50px_-20px_rgba(0,0,0,0.15)]">
      <div className="border-b border-[#eef1f5] bg-[#fbfcfd] px-5 py-4 text-center">
        <h3
          className="truncate text-lg font-semibold tracking-[-0.03em] text-[#2f3440]"
          title={view.name}
        >
          {view.name || "Vista sin nombre"}
        </h3>
      </div>
      <div className="relative overflow-hidden border-b border-[#eef1f5] bg-[#f3f6fb]">
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: `${originalWidth}px`,
            height: `${originalHeight}px`,
            transform: `scale(${scale})`,
          }}
        >
          {/* Renderizado de elementos nativos restaurado */}
          {view.elements &&
            view.elements.map((item) => (
              <DraggableBox
                key={item.id}
                id={item.id}
                initialX={item.x}
                initialY={item.y}
                initialWidth={item.width}
                initialHeight={item.height}
                data={item.data}
                isReadOnly={true}
                onDragStop={() => {}}
                onResizeStop={() => {}}
                onDelete={() => {}}
              />
            ))}
        </div>

        {/* Espaciador dinámico para mantener el alto de la tarjeta */}
        <div style={{ height: `${cardContentHeight}px` }} />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
        <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-[#dce3e8] bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#6d7482]">
          Vista previa
        </div>
      </div>
    </article>
  );
};

export default function LayOutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [views, setViews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [layoutName, setLayoutName] = useState("");
  const [isIframe, setIsIframe] = useState(false);
  const [allElements, setAllElements] = useState([]); // Añadido para capturar elementos para edición

  useEffect(() => {
    // Detectar si estamos en un iframe para visualización compacta
    setIsIframe(window.self !== window.top);

    async function loadLayout() {
      setIsLoading(true);
      try {
        const res = await api.get(`/api/scada/layout/${id}/`);
        const data = res.data;
        setLayoutName(data?.name || "Layout");

        let parsedViews = [];

        // Lógica de detección de estructura de datos original corregida
        if (data?.views_data?.views?.length) {
          parsedViews = data.views_data.views.map((view) => ({
            ...view,
            elements: normalizeElements(view.elements || []),
          }));
        } else if (data && Array.isArray(data.elements)) {
          parsedViews = [
            {
              id: "default",
              name: "Vista principal",
              elements: normalizeElements(data.elements),
            },
          ];
        } else if (Array.isArray(data)) {
          parsedViews = [
            {
              id: "default",
              name: "Vista principal",
              elements: normalizeElements(data),
            },
          ];
        }

        setViews(parsedViews);
        // Capturamos los elementos de la primera vista para el flujo de edición
        if (parsedViews.length > 0) {
          setAllElements(parsedViews[0].elements);
        }
      } catch (error) {
        console.error("Error al cargar el layout:", error);
        setViews([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadLayout();
  }, [id]);

  // Lógica de pulsar el botón editar
  const handleEditClick = () => {
    navigate("/organizar-scada", {
      state: {
        loadPublishedId: id,
        layoutId: id,
        layOutName: layoutName,
        editMode: true,
        initialLayoutElements: allElements,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#eef2f4]">
        <div className="animate-pulse rounded-[30px] border border-[#dce3e8] bg-white px-10 py-8 font-medium text-[#8f919a]">
          Sincronizando consola SCADA...
        </div>
      </div>
    );
  }

  // Si no hay vistas, mostrar estado vacío coherente con el diseño
  if (views.length === 0) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#eef2f4]">
        <Sidebar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="rounded-[30px] border border-[#dce3e8] bg-white p-12 text-center max-w-md shadow-lg">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#2f3942]">
              Sin datos visuales
            </h2>
            <p className="mt-2 text-sm text-[#8f919a]">
              No se han encontrado componentes para este layout.
            </p>
            <Button
              variant="secondary"
              onClick={() => navigate("/")}
              className="mt-6"
            >
              Volver al inicio
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Vista compacta para IFRAME
  if (isIframe) {
    return (
      <div className="min-h-screen p-4 bg-white">
        <div className="grid grid-cols-1 gap-6">
          {views.map((view) => (
            <ViewCard key={view.id} view={view} scale={0.6} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#eef2f4]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#eef2f4]">
        <div className="min-h-full px-4 py-4 md:px-6 md:py-6">
          <div className="overflow-hidden rounded-[30px] border border-[#d9e0e5] bg-[linear-gradient(180deg,#f7f9fa_0%,#f2f5f6_100%)] shadow-lg">
            {/* CABECERA */}
            <Header
              badgeText="Proyecto SCADA"
              title={layoutName}
              highlightText="Dashboard"
              icon={Activity}
            />

            {/* BARRA DE ACCIONES Y STATUS */}
            <section className="border-b border-[#dde4e8] px-6 py-5 md:px-8">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                {/* Contador de vistas */}
                <div className="rounded-2xl border border-[#e7edf1] bg-[#f8fbfd] p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5f8] text-[#255f82]">
                      <MonitorPlay className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#8a94a3]">
                        Vistas activas
                      </p>
                      <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#2f3942]">
                        {views.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones Reutilizando componente Button */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="secondary" onClick={handleEditClick}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>

                  <Button onClick={() => navigate(`/scada/production/${id}`)}>
                    <PencilLine className="mr-2 h-4 w-4" />
                    Abrir proyecto HMI
                  </Button>
                </div>
              </div>
            </section>

            {/* GRID DE VISTAS SCADA */}
            <section className="px-6 py-8 md:px-8 md:py-10">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 2xl:grid-cols-3">
                {views.map((view) => (
                  <ViewCard key={view.id} view={view} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
