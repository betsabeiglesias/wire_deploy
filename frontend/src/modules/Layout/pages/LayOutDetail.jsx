import { useEffect, useState } from "react";
import { Layers3, MonitorPlay, PencilLine } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import DraggableBox from "../../organizarScada/components/canvas/DraggableBox";
import HomeButton from "../../../components/HomeButton";
import EditLayOutButton from "../components/EditLayOutButton";
import DeleteLayOutButton from "../components/DeleteLayOutButton";
import Sidebar from "../../sidebar/Sidebar";
import api from "@/services/api";
import { useThemeStore } from "../../../store/useThemeStore";

const normalizeElements = (items = []) =>
  items.map((item, idx) => ({
    id: item.id || Date.now() + idx,
    x: item.x ?? 100,
    y: item.y ?? 100,
    width: item.width ?? item.data?.width,
    height: item.height ?? item.data?.height,
    data: item.data || item,
  }));

const ViewCard = ({ view, scale = 0.48 }) => {
  const originalWidth = 1400;
  const originalHeight = 900;
  const cardContentHeight = originalHeight * scale;

  return (
    <article className="overflow-hidden rounded-[28px] border border-[#e8eaef] bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfd_100%)] shadow-[0_22px_40px_-28px_rgba(31,41,55,0.18)]">
      <div className="border-b border-[#eef1f5] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-5 py-4">
        <h3
          className="truncate text-center text-lg font-semibold tracking-[-0.03em] text-[#2f3440]"
          title={view.name}
        >
          {view.name || "Vista sin nombre"}
        </h3>
      </div>

      <div className="relative overflow-hidden border-b border-[#eef1f5] bg-[#f3f6fb]">
        <div
          className="origin-top-left absolute top-0 left-0"
          style={{
            width: `${originalWidth}px`,
            height: `${originalHeight}px`,
            transform: `scale(${scale})`,
          }}
        >
          {view.elements.map((item) => (
            <DraggableBox
              key={item.id}
              id={item.id}
              initialX={item.x}
              initialY={item.y}
              initialWidth={item.data?.width || item.width || 150}
              initialHeight={item.data?.height || item.height || 150}
              data={item.data}
              isReadOnly={true}
              onDragStop={() => {}}
              onResizeStop={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>

        <div style={{ height: `${cardContentHeight}px` }} />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,255,0.08)_0%,rgba(248,250,255,0)_40%,rgba(255,255,255,0.78)_100%)]" />
        <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6d7482] shadow-[0_12px_24px_-18px_rgba(31,41,55,0.2)]">
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
  const [allElements, setAllElements] = useState([]);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === "dark";

  useEffect(() => {
    setIsIframe(window.self !== window.top);

    async function loadLayout() {
      setIsLoading(true);
      try {
        const res = await api.get(`/api/scada-manager/layout/${id}/`);
        const data = res.data;
        setLayoutName(data?.name || "Layout");

        let parsedViews = [];

        if (data?.views_data?.views?.length) {
          parsedViews = data.views_data.views.map((view) => ({
            ...view,
            elements: normalizeElements(view.elements || []),
          }));
        } else if (Array.isArray(data)) {
          parsedViews = [
            {
              id: "default",
              name: "Vista principal",
              elements: normalizeElements(data),
            },
          ];
        } else if (data && Array.isArray(data.elements)) {
          parsedViews = [
            {
              id: "default",
              name: "Vista principal",
              elements: normalizeElements(data.elements),
            },
          ];
        } else {
          parsedViews = [];
        }

        setViews(parsedViews);

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

  if (isLoading) {
    return (
      <div className={`flex h-screen w-full items-center justify-center ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
        <div className="rounded-[28px] border border-[#ececee] bg-white px-8 py-6 text-sm font-medium text-[#8f919a] shadow-[0_20px_40px_-30px_rgba(31,41,55,0.12)]">
          Cargando dashboard...
        </div>
      </div>
    );
  }

  if (views.length === 0) {
    return (
      <div className={`flex h-screen w-full items-center justify-center ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
        <div className="rounded-[28px] border border-[#ececee] bg-white px-8 py-8 text-center shadow-[0_20px_40px_-30px_rgba(31,41,55,0.12)]">
          <h2 className="text-lg font-semibold text-[#3b3d45]">Sin datos</h2>
          <p className="mt-2 text-sm text-[#8f919a]">
            No se encontraron componentes visuales para este layout.
          </p>
        </div>
      </div>
    );
  }

  if (isIframe) {
    return (
      <div className={`min-h-screen p-4 ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          {views.map((view) => (
            <ViewCard key={view.id} view={view} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
      <Sidebar />

      <main className={`flex-1 overflow-y-auto ${isDark ? "bg-[#0b1631]" : "bg-[#f7f7f8]"}`}>
        <div className="min-h-full px-4 py-4 md:px-6 md:py-6">
          <div className={`overflow-hidden rounded-[30px] ${isDark ? "border border-white/10 bg-[linear-gradient(160deg,#09152f_0%,#0d1d40_42%,#132857_100%)] shadow-[0_24px_70px_-42px_rgba(0,0,0,0.35)]" : "border border-[#ececee] bg-[#fbfbfc] shadow-[0_24px_70px_-42px_rgba(31,41,55,0.12)]"}`}>
            <section className={`relative px-6 py-6 md:px-8 md:py-8 ${isDark ? "border-b border-white/10" : "border-b border-[#ececee]"}`}>
              <div className={`absolute inset-0 ${isDark ? "opacity-35 [background-image:radial-gradient(#7ec8ff_1px,transparent_1px)] [background-size:8px_8px]" : "opacity-70 [background-image:radial-gradient(#d9cdf7_1px,transparent_1px)] [background-size:8px_8px]"}`} />
              <div className={`absolute right-[-30px] top-[-20px] h-[240px] w-[240px] rounded-full ${isDark ? "bg-[radial-gradient(circle,rgba(114,176,255,0.16),transparent_70%)]" : "bg-[radial-gradient(circle,rgba(196,181,253,0.16),transparent_70%)]"}`} />

              <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl xl:pl-2">
                  <h1 className={`mt-4 max-w-2xl text-left text-4xl font-semibold leading-[0.95] tracking-[-0.05em] md:text-6xl ${isDark ? "text-white" : "text-[#464851]"}`}>
                    {layoutName}
                    <br />
                    <span className={isDark ? "text-[#7ec8ff]" : "text-[#79c8f1]"}>dashboard.</span>
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#e8e9ee] bg-white px-4 py-2 text-sm font-medium text-[#636977]">
                    <MonitorPlay className="h-4 w-4 text-[#79c8f1]" />
                    {views.length} vistas
                  </div>

                  <EditLayOutButton
                    initialLayoutElements={allElements}
                    layoutId={id}
                    layoutName={layoutName}
                  />
                  <DeleteLayOutButton layoutId={id} layoutName={layoutName} />
                  <button
                    onClick={() => navigate(`/scada/production/${id}`)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#343841] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#272b33]"
                    title="Ver modo Producción"
                  >
                    <PencilLine className="h-4 w-4" />
                    Abrir proyecto HMI
                  </button>
                  <HomeButton />
                </div>
              </div>
            </section>

            <section className="px-6 py-6 md:px-8 md:py-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
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
