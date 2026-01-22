import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DraggableBox from "../../organizarScada/components/DraggableBox";
import HomeButton from "../../../components/HomeButton";
import EditLayOutButton from "../../../components/EditLayOutButton";
import api from "@/services/api";
import DeleteLayOutButton from "../../../components/DeleteLayOutButton";

const normalizeElements = (items = []) =>
  items.map((item, idx) => ({
    id: item.id || Date.now() + idx,
    x: item.x ?? 100,
    y: item.y ?? 100,
    width: item.width ?? item.data?.width,
    height: item.height ?? item.data?.height,
    data: item.data || item,
  }));

export default function LayOutDetail() {
  const { id } = useParams();
  const [elements, setElements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [buttonName, setButtonName] = useState("");
  
  // Detección de iframe para ocultar los botones
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    setIsIframe(window.self !== window.top);

    async function loadLayout() {
      setIsLoading(true);
      try {
        const res = await api.get(`/api/scada-manager/layout/${id}/`);
        const data = res.data;
        setButtonName(data?.button_name || data?.name || "Layout");

        if (data?.views_data?.views?.length) {
          const firstView = data.views_data.views[0];
          setElements(normalizeElements(firstView?.elements || []));
        } else if (Array.isArray(data)) {
          setElements(normalizeElements(data));
        } else if (data && Array.isArray(data.elements)) {
          setElements(normalizeElements(data.elements));
        } else {
          setElements([]);
        }
      } catch (error) {
        console.error("Error al cargar el layout:", error);
        setElements([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadLayout();
  }, [id]);

  if (isLoading) {
    return <div className="p-6">Cargando Layout... ⏳</div>;
  }

  if (elements.length === 0) {
    return <div className="p-6">No se encontraron componentes para el Layout {id}.</div>;
  }

  return (
    <>
      {/* ESTE ES EL DIV QUE SE OCULTA EN EL IFRAME */}
      {!isIframe && (
        <div className="flex items-center justify-between mb-6 p-6">
          <div className="flex gap-4">
            <EditLayOutButton initialLayoutElements={elements} layoutId={id} layoutName={buttonName} />
            <DeleteLayOutButton layoutId={id} layoutName={buttonName} />
          </div>
          <HomeButton />
        </div>
      )}

      <div className={isIframe ? "p-0" : "p-6"}>
        {!isIframe && (
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Layout Actual: {buttonName}</h1>
          </div>
        )}

        <div
          className="relative border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden shadow-inner w-full"
          style={{ minHeight: "800px" }}
        >
          {elements.map((item) => (
            <DraggableBox
              key={item.id}
              id={item.id}
              initialX={item.x}
              initialY={item.y}
              initialWidth={item.data?.width || item.width || 150}
              initialHeight={item.data?.height || item.height || 150}
              data={item.data}
              // ES INTERACTIVO (QUITADO EL READONLY FORZADO)
              isReadOnly={false} 
              onDragStop={() => {}}
              onResizeStop={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>
      </div>
    </>
  );
}