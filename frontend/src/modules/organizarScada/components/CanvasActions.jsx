// src/modules/organizarScada/components/CanvasActions.js (Se mantiene igual, solo para referencia)

import React from 'react';
import NavbarPLCs from "./NavbarPLCs"; // Asumimos que NavbarPLCs está en el mismo directorio
import { 
    createMiniGaugeData, 
    createLampData, 
    createTableData, 
    createChartData 
} from './ComponentCreationTools'; 

const CanvasActions = ({ 
    addTemplateElements, 
    handleClearCanvas, // 💡 Esta función ahora es la que resetea el ID en el padre
    handleExportCanvas, 
    handleImportCanvas 
}) => {

    // Lógica del Mini Template (sin cambios funcionales)
    const handleAddMiniTemplate = () => {
        const topY = 70;
        const bottomY = 320;
        const startX = 80;
        const spacing = 220;
        const elements = [
            {
                x: startX,
                y: topY,
                data: createMiniGaugeData("temperature", "mini-ring", { initial: 55, unit: "°C" }),
            },
            {
                x: startX + spacing,
                y: topY,
                data: createMiniGaugeData("pressure", "mini-horizontal", { initial: 68, unit: "bar" }),
            },
            {
                x: startX + spacing * 2,
                y: topY,
                data: createMiniGaugeData("rotation", "mini-donut", { initial: 270, max: 360, unit: "deg" }),
            },
            {
                x: startX,
                y: bottomY,
                data: createMiniGaugeData("flow", "mini-bubble", { initial: 42, unit: "L/min" }),
            },
            {
                x: startX + spacing,
                y: bottomY,
                data: createMiniGaugeData("humidity", "mini-horizontal", { initial: 35, unit: "%" }),
            },
            {
                x: startX + spacing * 2,
                y: bottomY,
                data: createLampData("heater_on", true),
            },
        ];
        addTemplateElements(elements);
    };

    // Lógica del Dashboard Template (sin cambios funcionales)
    const handleAddDashboardTemplate = () => {
        const elements = [
            {
                x: 60,
                y: 60,
                data: createMiniGaugeData("temperature", "mini-ring", { initial: 62, unit: "°C" }),
            },
            {
                x: 300,
                y: 60,
                data: createMiniGaugeData("tank level", "mini-horizontal", { initial: 48, unit: "%" }),
            },
            {
                x: 540,
                y: 60,
                data: createMiniGaugeData("valve state", "mini-bubble", { initial: 1, unit: "Open" }),
            },
            {
                x: 60,
                y: 320,
                data: createTableData("Producción", [
                    { site: "Planta A", equipment: "Linea 1", variable: "Output", value: "120 u", timestamp: "2025-01-12 09:30:00" },
                    { site: "Planta A", equipment: "Linea 2", variable: "Output", value: "98 u", timestamp: "2025-01-12 09:30:00" },
                    { site: "Planta A", equipment: "Linea 3", variable: "Output", value: "75 u", timestamp: "2025-01-12 09:30:00" },
                ]),
            },
            { x: 460, y: 320, data: createChartData("Tendencia", [45, 50, 62, 58, 70, 66, 72]) },
            { x: 820, y: 320, data: createLampData("alarm", false) },
        ];
        addTemplateElements(elements);
    };

    return (
        <NavbarPLCs
            toolbar={{
                showActions: true,
                onClear: handleClearCanvas,
                onExport: handleExportCanvas,
                onImport: handleImportCanvas,
                onTemplateMini: handleAddMiniTemplate,
                onTemplateDashboard: handleAddDashboardTemplate,
            }}
        />
    );
};

export default CanvasActions;