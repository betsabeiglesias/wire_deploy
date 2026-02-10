import React from "react";
import { useNavigate } from "react-router-dom";
import { useLayoutStore } from "@/store/useLayoutStore"; // Importamos el store

const DeleteLayOutButton = ({ layoutId, layoutName }) => {
  const navigate = useNavigate();
  const deleteLayout = useLayoutStore((state) => state.deleteLayout); // Extraemos la acción del store

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el Layout "${layoutName}"? Esta acción es irreversible.`)) {
      return;
    }

    try {
      // 1. Usamos la acción del store (que ya hace el api.delete y actualiza el estado global)
      await deleteLayout(layoutId);
      
      console.log(`Layout #${layoutId} eliminado correctamente.`);

      // 2. Navegamos de vuelta a la lista
      // Ya no es estrictamente necesario pasar state: { reloadList: true } 
      // porque el store ya actualizó la lista globalmente.
      navigate("/layout");

    } catch (error) {
      console.error("Error al eliminar el layout:", error);

      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          alert("Error: El Layout no fue encontrado.");
        } else if (status === 403) {
          alert("Error: No tienes permiso para eliminar este Layout.");
        } else {
          alert(`Error en el servidor: ${status} ${error.response.statusText}`);
        }
      } else {
        alert(`No se pudo eliminar el Layout: ${error.message}`);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="
      border border-red-600
        text-red-600
        px-4 py-2
        rounded
        hover:bg-red-50
        hover:text-red-700
        transition-colors
        cursor-pointer"
    >
      Borrar LayOut
    </button>
  );
};

export default DeleteLayOutButton;