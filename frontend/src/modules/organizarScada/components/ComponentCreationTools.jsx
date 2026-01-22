// src/modules/organizarScada/components/ComponentCreationTools.js

export const createMiniGaugeData = (label, type, config = {}) => ({
    type,
    width: config.width ?? 220,
    height: config.height ?? 220,
    label,
    settings: {
        attributeLabel: label,
        minValue: config.min ?? 0,
        maxValue: config.max ?? 100,
        initialValue: config.initial ?? 50,
        unit: config.unit,
    },
});

export const createLampData = (label, active = false) => ({
    type: "mini-lamp",
    width: 180,
    height: 200,
    label,
    settings: { attributeLabel: label, initialValue: active },
});

export const createTableData = (label, rows = []) => ({
    type: "mini-table",
    width: 360,
    height: 220,
    label,
    settings: {
        attributeLabel: label,
        rows,
    },
});

export const createChartData = (label, series = []) => ({
    type: "mini-chart",
    width: 340,
    height: 220,
    label,
    settings: {
        attributeLabel: label,
        series,
    },
});