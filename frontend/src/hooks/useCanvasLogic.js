// src/hooks/useCanvasLogic.js

import { useState, useEffect, useCallback } from "react";

const useCanvasLogic = (initialLayoutElements = [], layoutId = null, layOutName = null) => {
    const [canvasElements, setCanvasElements] = useState(initialLayoutElements);
    const [currentLayoutId, setCurrentLayoutId] = useState(layoutId);
    const [isEditMode, setIsEditMode] = useState(!!layoutId);
    const [exportName, setExportName] = useState(layoutId ? layOutName : "Nuevo");

    useEffect(() => {
        setCurrentLayoutId(layoutId);
        if (layoutId) {
            setExportName(layOutName);
            setIsEditMode(true);
        }
    }, [layoutId, layOutName]);

    // -----------------------------------------------------------
    // FUNCIONES DE MANIPULACIÓN DEL CANVAS (Optimizadas con useCallback)
    // -----------------------------------------------------------

    const addWithAutoPosition = useCallback((data) => {
        setCanvasElements((prev) => {
            const index = prev.length;
            const offset = 24;
            const baseX = 100;
            const baseY = 100;
            const newX = baseX + (index % 8) * offset;
            const newY = baseY + (index % 8) * offset;
            const newComponent = {
                id: Date.now(),
                x: newX,
                y: newY,
                data,
            };
            return [...prev, newComponent];
        });
    }, []);

    const addComponentToCanvas = useCallback((data) => {
        addWithAutoPosition(data);
    }, [addWithAutoPosition]);

    const addTemplateElements = useCallback((elements = []) => {
        setCanvasElements((prev) => {
            const baseId = Date.now();
            const mapped = elements.map((el, idx) => ({
                id: el.id || baseId + idx,
                x: el.x ?? 100 + idx * 20,
                y: el.y ?? 100 + idx * 20,
                data: el.data,
            }));
            return [...prev, ...mapped];
        });
    }, []);

    const handleClearCanvas = useCallback(() => setCanvasElements([]), []);

    const handleUpdateComponent = useCallback((id, newWidth, newHeight, newX, newY) => {
        setCanvasElements((prevItems) =>
            prevItems.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        x: newX !== undefined ? newX : item.x,
                        y: newY !== undefined ? newY : item.y,
                        data: {
                            ...item.data,
                            width: newWidth !== undefined ? newWidth : item.data.width,
                            height: newHeight !== undefined ? newHeight : item.data.height,
                        },
                    }
                    : item
            )
        );
    }, []);

    const handleDeleteComponent = useCallback((id) => {
        setCanvasElements((prevItems) => prevItems.filter((item) => item.id !== id));
    }, []);
    
    // -----------------------------------------------------------
    // FUNCIONES DE IMPORTACIÓN/EXPORTACIÓN LOCAL
    // -----------------------------------------------------------

    const handleImportCanvas = useCallback((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                if (Array.isArray(parsed)) {
                    setCanvasElements(
                        parsed.map((item, idx) => ({
                            // Usamos Date.now() para generar IDs nuevos, evitando colisiones
                            id: Date.now() + idx, 
                            x: item.x ?? 100,
                            y: item.y ?? 100,
                            data: item.data,
                        }))
                    );
                }
            } catch (err) {
                console.error("No se pudo importar el archivo", err);
            }
        };
        reader.readAsText(file);
    }, []);

    // 🔑 NUEVA FUNCIÓN CLAVE: Resetea el ID para forzar una nueva creación (POST)
    const resetLayoutMetadata = useCallback(() => {
        setCurrentLayoutId(null);
        setIsEditMode(false);
        setExportName("Hmi");
    }, []);

    return {
        canvasElements,
        setCanvasElements,
        currentLayoutId,
        isEditMode,
        exportName,
        setExportName,
        addComponentToCanvas,
        addTemplateElements,
        handleClearCanvas,
        handleUpdateComponent,
        handleDeleteComponent,
        handleImportCanvas,
        setCurrentLayoutId,
        setIsEditMode,
        // 🔑 CLAVE: Devolver la función de reseteo
        resetLayoutMetadata,
    };
};

export default useCanvasLogic;