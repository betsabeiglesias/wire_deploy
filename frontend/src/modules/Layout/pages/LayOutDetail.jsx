import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DraggableBox from "../../organizarScada/components/canvas/DraggableBox";
import HomeButton from "../../../components/HomeButton";
import EditLayOutButton from "../../../components/EditLayOutButton";
import DeleteLayOutButton from "../../../components/DeleteLayOutButton";
import api from "@/services/api";

const normalizeElements = (items = []) =>
  items.map((item, idx) => ({
    id: item.id || Date.now() + idx,
    x: item.x ?? 100,
    y: item.y ?? 100,
    width: item.width ?? item.data?.width,
    height: item.height ?? item.data?.height,
    data: item.data || item,
  }));

// Componente para renderizar una vista individual en miniatura (Tarjeta)
const ViewCard = ({ view, scale = 0.35 }) => {
  // Asumimos un tamaño base grande para el canvas original, ej. 1300x800
  // El contenedor "escalado" tendrá ese tamaño, pero transformado.
  const originalWidth = 1400; // Ancho estimado del canvas original
  const originalHeight = 900; // Alto estimado del canvas original

  // Altura del contenedor de la tarjeta ajustada al contenido escalado
  const cardContentHeight = originalHeight * scale;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold text-slate-700 truncate" title={view.name}>
          {view.name || "Vista sin nombre"}
        </h3>
        {/* Aquí se podrían agregar botones de acción por tarjeta (editar, expandir) */}
      </div>

      <div className="relative flex-grow bg-slate-50/50 w-full overflow-hidden">
        {/* Contenedor Escalable */}
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
              isReadOnly={true} // Solo visualización en el dashboard
              onDragStop={() => {}}
              onResizeStop={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>
        {/* Espaciador para mantener la altura de la tarjeta */}
        <div style={{ height: `${cardContentHeight}px` }} />
      </div>
    </div>
  );
};

export default function LayOutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [views, setViews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [layoutName, setLayoutName] = useState("");
  const [isIframe, setIsIframe] = useState(false);
  const [allElements, setAllElements] = useState([]); // Para pasar al botón editar (legacy support)

  useEffect(() => {
    setIsIframe(window.self !== window.top);

    async function loadLayout() {
      setIsLoading(true);
      try {
        const res = await api.get(`/api/scada-manager/layout/${id}/`);
        const data = res.data;
        setLayoutName(data?.button_name || data?.name || "Layout");

        let parsedViews = [];

        if (data?.views_data?.views?.length) {
          // Estructura nueva con múltiples vistas
          parsedViews = data.views_data.views.map((v) => ({
            ...v,
            elements: normalizeElements(v.elements || []),
          }));
        } else if (Array.isArray(data)) {
          // Estructura legacy array
          parsedViews = [
            {
              id: "default",
              name: "Vista Principal",
              elements: normalizeElements(data),
            },
          ];
        } else if (data && Array.isArray(data.elements)) {
          // Estructura legacy objeto con elements
          parsedViews = [
            {
              id: "default",
              name: "Vista Principal",
              elements: normalizeElements(data.elements),
            },
          ];
        } else {
          parsedViews = [];
        }

        setViews(parsedViews);

        // Aplanar elementos para el modo "Editar" si se requiere pasar todo junto
        // (Depende de cómo EditLayOutButton maneje la carga, idealmente debería volver a pedir al API o recibir estructura completa)
        // Por ahora pasamos los de la primera vista o concatenamos.
        // EditLayOutButton usa initialLayoutElements. Lo correcto sería pasarle las views completas si el botón lo soporta,
        // pero para evitar romper, pasaremos los elementos de la primera vista si hay.
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
      <div className="flex h-screen w-full items-center justify-center bg-[#f4f4f4]">
        <div className="text-xl text-slate-500 font-semibold animate-pulse">
          Cargando Dashboard... ⏳
        </div>
      </div>
    );
  }

  if (views.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f4f4f4]">
        <div className="p-8 bg-white rounded-lg shadow text-center">
          <h2 className="text-lg font-bold text-gray-700 mb-2">Sin Datos</h2>
          <p className="text-gray-500">
            No se encontraron componentes visuales para este Layout.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#f4f4f4] ${isIframe ? "p-4" : "p-6"}`}>
      {/* Cabecera del Dashboard */}
      {!isIframe && (
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {layoutName}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Dashboard en Tiempo Real
            </p>
          </div>

          <div className="flex items-center gap-3">
            <EditLayOutButton
              initialLayoutElements={allElements} // Nota: Esto edita solo la vista principal en modo legacy por ahora
              layoutId={id}
              layoutName={layoutName}
            />
            <DeleteLayOutButton layoutId={id} layoutName={layoutName} />
            <button
              onClick={() => navigate(`/scada/production/${id}`)}
              className="border border-blue-600
                          text-blue-600
                          px-4 py-2
                          rounded
                          hover:bg-blue-50
                          hover:text-blue-700
                          transition-colors
                          cursor-pointer"
              title="Ver modo Producción"
            >
              Abrir proyecto HMI
            </button>
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            <HomeButton />
          </div>
        </div>
      )}

      {/* Grid de Vistas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {views.map((view) => (
          <div key={view.id} className="h-full">
            <ViewCard view={view} />
          </div>
        ))}
      </div>
    </div>
  );
}