// src/modules/organizarScada/components/ExportModal.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../../services/api"; 
import { useAuthStore } from '../../../store/useAuthStore'; 

const ExportModal = ({
    showExportModal,
    setShowExportModal,
    canvasElements,
    currentLayoutId,
    layOutName, 
    exportName,
    setExportName,
    setCurrentLayoutId,
    setIsEditMode,
}) => {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [isLoading, setIsLoading] = useState(false);

    const confirmExport = async () => {
        if (isLoading) return; 

        // Chequeo de autenticación
        if (!isAuthenticated) {
            navigate("/login", { replace: true });
            return; 
        }

        setIsLoading(true);

        const isUpdating = !!currentLayoutId;
        const filename = exportName.trim() || (isUpdating ? `layout-${layOutName}` : "Nuevo Layout");

        let httpMethod;
        let apiUrl;
        
        // Lógica de URL
        if (isUpdating) {
            httpMethod = "put";
            apiUrl = `http://localhost:8000/api/scada-manager/layout/${currentLayoutId}/`; 
        } else {
            httpMethod = "post";
            apiUrl = `http://localhost:8000/api/scada-manager/save-layout/`; 
        }

        const requestBody = {
            button_name: filename,
            elements: canvasElements,
        };
        
        try {
            const response = await api({ 
                method: httpMethod,
                url: apiUrl, 
                data: requestBody,
            });

            const result = response.data; 
            let savedLayoutId = currentLayoutId;

            if (!isUpdating) {
                // Al crear, obtenemos el nuevo ID y actualizamos el estado del hook padre
                savedLayoutId = result.id;
                setCurrentLayoutId(savedLayoutId);
                setIsEditMode(true);
            }

            console.log(`Layout ${savedLayoutId} guardado correctamente.`);
            setShowExportModal(false);

            // Descargar JSON local
            const dataStr = JSON.stringify(canvasElements, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `${filename}.json`;
            link.click();
            URL.revokeObjectURL(downloadUrl);

            // 🔑 CLAVE: Redirección ÚNICA a la página de lista de layouts
            // Se usa 'reloadList: true' para asegurar que la lista se actualice,
            // especialmente después de un POST.
            navigate('/layout', { replace: true, state: { reloadList: true } });
            
        } catch (err) {
            // Reacción a la expiración
            if (err.response?.status === 401 || !isAuthenticated) {
                navigate("/login", { replace: true }); 
                return;
            }

            console.error(`Error ${isUpdating ? 'actualizando' : 'creando'} layout:`, err.response?.data || err.message);
            alert(`Error al guardar/actualizar el layout: ${err.response?.data?.detail || err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!showExportModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-96">
                <h2 className="text-xl font-semibold mb-4">
                    {currentLayoutId ? "Confirmar Edición" : "Confirmar Creación"}
                </h2>

                <p className="text-gray-700 mb-4">
                    ¿Estás seguro de que quieres{" "}
                    <span className="font-bold">
                        {currentLayoutId ? "actualizar" : "crear"}
                    </span>{" "}
                    el layout {layOutName ? `**${layOutName}**` : ""} y
                    descargar el archivo?
                </p>
                <p className="text-sm text-gray-500 mb-6">
                    Nombre del archivo/botón:
                </p>
                <input
                    type="text"
                    value={exportName}
                    onChange={(e) => setExportName(e.target.value)}
                    className="w-full px-3 py-2 border rounded mb-6"
                    disabled={isLoading}
                />

                <div className="flex justify-end gap-3">
                    <button
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition duration-150"
                        onClick={() => setShowExportModal(false)}
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>

                    <button
                        className={`px-4 py-2 rounded text-white transition duration-150 ${
                            isLoading 
                                ? "bg-blue-400 cursor-not-allowed" 
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                        onClick={confirmExport}
                        disabled={isLoading}
                    >
                        {isLoading 
                            ? "Guardando..." 
                            : currentLayoutId ? "Actualizar y Descargar" : "Crear y Descargar"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;