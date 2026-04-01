import React, { useState, useEffect } from 'react';
// Asumiendo que 'api' es un cliente Axios configurado para las llamadas a la API
import api from '../../../services/api'; 
import { useNavigate } from 'react-router-dom'; // Asumiendo uso de react-router-dom
import { useAuthStore } from '@/store/useAuthStore'; // Asumiendo autenticación
import { usePowerBiStore } from '@/store/usePowerBiStore';

/**
 * Componente Modal para crear o editar una vista de Power BI.
 * ⚠️ Recibe showModal, setShowModal, initialData, y el flag isEditMode.
 * @param {boolean} showModal - Controla la visibilidad del modal.
 * @param {function} setShowModal - Función para cerrar el modal.
 * @param {object} [initialData] - Datos del PBI a editar (si isEditMode es true).
 * @param {boolean} [isEditMode=false] - Indica si el modal está en modo edición.
 */
const PbiModal = ({ showModal, setShowModal, initialData, isEditMode = false }) => {
    // Hooks y Stores
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore(); // Asumiendo esta store
    
    // 🔥 Zustand: Desestructurar fetchPowerBis y updatePowerBi
    const { fetchPowerBis, updatePowerBi } = usePowerBiStore(); 

    // Estados Locales del Formulario
    const [isLoading, setIsLoading] = useState(false);
    const [pbiName, setPbiName] = useState("");
    const [pbiSrc, setPbiSrc] = useState(""); // URL de Embed
    const [pbiDescription, setPiDescription] = useState("");
    const [error, setError] = useState(null); // Estado para manejar errores

    // 🆕 EFECTO: Rellenar estados si estamos en modo edición (Tu cambio principal)
    useEffect(() => {
        if (showModal && isEditMode && initialData) {
            setPbiName(initialData.name || "");
            setPbiSrc(initialData.embed_url || "");
            setPiDescription(initialData.description || "");
        } else if (!isEditMode) {
            // Limpiar si es modo creación
            setPbiName("");
            setPbiSrc("");
            setPiDescription("");
        }
        setError(null); // Limpiar errores al abrir el modal
    }, [showModal, isEditMode, initialData]);

    const handleClose = () => {
        if (!isLoading) {
            setShowModal(false);
        }
    };

    const confirmSave = async () => {
        if (!isAuthenticated) {
            alert("Debe iniciar sesión para guardar.");
            navigate('/login');
            return;
        }

        if (isLoading) return;
        
        // Validación básica
        if (!pbiName || !pbiSrc) {
            setError("El Nombre y la URL de Embed son obligatorios.");
            return;
        }

        setIsLoading(true);
        setError(null);

        const requestBody = {
            name: pbiName,
            embed_url: pbiSrc,
            description: pbiDescription,
        };
        
        try {
            if (isEditMode) {
                // 🆕 Lógica de Edición: Usamos updatePowerBi de Zustand
                if (!initialData || !initialData.id) throw new Error("ID de Power BI no encontrado para editar.");
                await updatePowerBi(initialData.id, requestBody);
                
            } else {
                console.log("BODY POWER BI:", requestBody);
                // Lógica de Creación: Usamos API POST y actualizamos la lista
                await api.post("/api/powerbi/mypowerbis/", requestBody); 
                await fetchPowerBis(); 
            }

            // Limpieza y cierre exitoso
            setPbiName("");
            setPbiSrc("");
            setPiDescription("");
            setShowModal(false);

        } catch (err) {
            console.error("Error al guardar Power BI:", err);
            console.log("ERROR BACK RAW:", err.response);
            console.log("ERROR BACK DATA:", err.response?.data);
            const errorMessage = err.response?.data?.message || "Error desconocido al guardar.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Si el modal no debe mostrarse, no renderizamos nada
    if (!showModal) return null;
    
    // ------------------------------------------------------------------
    // RENDERIZADO DEL MODAL (JSX con Tailwind CSS)
    // ------------------------------------------------------------------
    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50"
            onClick={handleClose} 
        >
            {/* Contenedor del Modal */}
            <div 
                className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()} 
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                    {isEditMode ? "Editar Vista Power BI" : "Crear Nueva Vista Power BI"} {/* 🆕 Título dinámico */}
                </h2>

                {/* Mensaje de Error */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4" role="alert">
                        {error}
                    </div>
                )}

                {/* FORMULARIO */}
                <form className="space-y-4">
                    {/* Input Nombre */}
                    <div>
                        <label htmlFor="pbiName" className="block text-sm font-medium text-gray-700">
                            Nombre de la Vista
                        </label>
                        <input
                            type="text"
                            id="pbiName"
                            value={pbiName}
                            onChange={(e) => setPbiName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej: Dashboard de Ventas Q4"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Input URL de Embed (Source) */}
                    <div>
                        <label htmlFor="pbiSrc" className="block text-sm font-medium text-gray-700">
                            URL de Embed (iframe src)
                        </label>
                        <input
                            type="url"
                            id="pbiSrc"
                            value={pbiSrc}
                            onChange={(e) => setPbiSrc(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://app.powerbi.com/view?r=..."
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Input Descripción */}
                    <div>
                        <label htmlFor="pbiDescription" className="block text-sm font-medium text-gray-700">
                            Descripción (Opcional)
                        </label>
                        <textarea
                            id="pbiDescription"
                            rows="3"
                            value={pbiDescription}
                            onChange={(e) => setPiDescription(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Breve descripción del contenido del dashboard."
                            disabled={isLoading}
                        />
                    </div>
                </form>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={confirmSave}
                        disabled={isLoading}
                        className="
                            px-4 py-2
                            text-sm font-medium
                            text-blue-600
                            border border-blue-600
                            rounded-md
                            hover:bg-blue-50
                            hover:text-blue-700
                            hover:border-blue-700
                            transition-colors
                            disabled:text-blue-300
                            disabled:border-blue-300
                            disabled:hover:bg-transparent
                            "

                    >
                        {isLoading 
                            ? "Guardando..." 
                            : isEditMode 
                                ? "Guardar Cambios" 
                                : "Crear Vista PBI"} {/* 🆕 Texto dinámico */}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PbiModal;