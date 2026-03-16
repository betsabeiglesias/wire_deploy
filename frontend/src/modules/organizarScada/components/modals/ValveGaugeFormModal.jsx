import React, { useMemo, useState } from 'react';
import { useRealtime } from "@/context/RealtimeProvider";

const ValveGaugeFormModal = ({ component, userId, onClose, onSave }) => {
    const realtime = useRealtime();
    const allTags = realtime?.allTags || [];

    const [site, setSite] = useState('');
    const [area, setArea] = useState('');
    const [line, setLine] = useState('');
    const [cell, setCell] = useState('');
    const [equipment, setEquipment] = useState('');
    const [variable, setVariable] = useState('');
    const [minValue, setMinValue] = useState('');
    const [maxValue, setMaxValue] = useState('');

    const sites = useMemo(() => [...new Set(allTags.map(t => t.site).filter(Boolean))], [allTags]);
    const areas = useMemo(() => {
        const subset = allTags.filter(t => !site || t.site === site);
        return [...new Set(subset.map(t => t.area).filter(Boolean))];
    }, [allTags, site]);
    const lines = useMemo(() => {
        const subset = allTags.filter(t => (!site || t.site === site) && (!area || t.area === area));
        return [...new Set(subset.map(t => t.line).filter(Boolean))];
    }, [allTags, site, area]);
    const cells = useMemo(() => {
        const subset = allTags.filter(t => (!site || t.site === site) && (!area || t.area === area) && (!line || t.line === line));
        return [...new Set(subset.map(t => t.cell).filter(Boolean))];
    }, [allTags, site, area, line]);
    const equipments = useMemo(() => {
        const subset = allTags.filter(t => (!site || t.site === site) && (!area || t.area === area) && (!line || t.line === line) && (!cell || t.cell === cell));
        return [...new Set(subset.map(t => t.equipment).filter(Boolean))];
    }, [allTags, site, area, line, cell]);
    const variables = useMemo(() => {
        const subset = allTags.filter(t => (!site || t.site === site) && (!area || t.area === area) && (!line || t.line === line) && (!cell || t.cell === cell) && (!equipment || t.equipment === equipment));
        return [...new Set(subset.map(t => t.variable).filter(Boolean))];
    }, [allTags, site, area, line, cell, equipment]);

    const selectedTag = useMemo(() => {
        if (!equipment || !variable) return null;
        return (
          allTags.find(t =>
            t.variable === variable &&
            t.equipment === equipment &&
            (!site || t.site === site) &&
            (!area || t.area === area) &&
            (!line || t.line === line) &&
            (!cell || t.cell === cell)
          ) || null
        );
    }, [allTags, site, area, line, cell, equipment, variable]);

    const unit = selectedTag?.unit || '';

    const handleSaveAndAdd = () => {
        if (!equipment || !variable) {
            alert('Selecciona al menos Equipo y Variable.');
            return;
        }

        const parsedMin = minValue === '' ? undefined : Number(minValue);
        const parsedMax = maxValue === '' ? undefined : Number(maxValue);

        const settings = {
            site: site || undefined,
            area: area || undefined,
            line: line || undefined,
            cell: cell || undefined,
            equipment,
            variable,
            attributeKey: variable,
            attributeLabel: unit ? `${variable} (${unit})` : variable,
            unit: unit || undefined,
            minValue: Number.isFinite(parsedMin) ? parsedMin : undefined,
            maxValue: Number.isFinite(parsedMax) ? parsedMax : undefined,
        };

        onSave(settings);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Vincular Componente: {component.title}</h3>
                    <button className="text-gray-500 hover:text-gray-800 text-2xl font-bold" onClick={onClose}>&times;</button>
                </div>

                <form className="p-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="flex flex-col space-y-1">
                        <label className="text-sm font-medium text-gray-700">Site</label>
                        <select
                            value={site}
                            onChange={(e) => { setSite(e.target.value); setArea(''); setLine(''); setCell(''); setEquipment(''); setVariable(''); }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Cualquiera --</option>
                            {sites.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                        <label className="text-sm font-medium text-gray-700">Area</label>
                        <select
                            value={area}
                            onChange={(e) => { setArea(e.target.value); setLine(''); setCell(''); setEquipment(''); setVariable(''); }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Cualquiera --</option>
                            {areas.map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                        <label className="text-sm font-medium text-gray-700">Line</label>
                        <select
                            value={line}
                            onChange={(e) => { setLine(e.target.value); setCell(''); setEquipment(''); setVariable(''); }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Cualquiera --</option>
                            {lines.map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                        <label className="text-sm font-medium text-gray-700">Cell</label>
                        <select
                            value={cell}
                            onChange={(e) => { setCell(e.target.value); setEquipment(''); setVariable(''); }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Cualquiera --</option>
                            {cells.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                        <label className="text-sm font-medium text-gray-700">Equipo</label>
                        <select
                            value={equipment}
                            onChange={(e) => { setEquipment(e.target.value); setVariable(''); }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Selecciona un equipo --</option>
                            {equipments.map(eq => (
                                <option key={eq} value={eq}>{eq}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                        <label className="text-sm font-medium text-gray-700">Variable</label>
                        <select
                            value={variable}
                            onChange={(e) => setVariable(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            disabled={!equipment}
                        >
                            <option value="">-- Selecciona una variable --</option>
                            {variables.map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">Unidad: <span className="font-medium text-gray-800">{unit || '-'}</span></div>
                    </div>

                    {/* Vista previa del tag seleccionado */}
                    {(equipment && variable) && (
                        <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm">
                            {selectedTag ? (
                                <div className="text-green-700">
                                    <div className="font-medium mb-1">Coincidencia encontrada</div>
                                    <div>Valor actual: <span className="font-semibold text-gray-900">{typeof selectedTag.value === 'boolean' ? (selectedTag.value ? 'True' : 'False') : (selectedTag.value ?? '-')}</span> {unit}</div>
                                    <div className="text-gray-600">Timestamp: {selectedTag.timestamp}</div>
                                    <div className="text-gray-600">Tag: {[site||'*', area||'*', line||'*', cell||'*', equipment||'*', variable||'*'].join('/')}</div>
                                </div>
                            ) : (
                                <div className="text-amber-700">
                                    <div className="font-medium mb-1">Sin datos en vivo para la selección</div>
                                    <div className="text-gray-600">Revisa que site/area/line/cell/equipment/variable coincidan con lo mostrado en Comunicaciones.</div>
                                    <div className="text-gray-600">Tag: {[site||'*', area||'*', line||'*', cell||'*', equipment||'*', variable||'*'].join('/')}</div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700">Min (opcional)</label>
                            <input
                                type="number"
                                value={minValue}
                                onChange={(e) => setMinValue(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700">Max (opcional)</label>
                            <input
                                type="number"
                                value={maxValue}
                                onChange={(e) => setMaxValue(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="100"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end items-center pt-4 border-t border-gray-200 space-x-2">
                        <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            onClick={handleSaveAndAdd}
                            disabled={!equipment || !variable}
                        >
                            Añadir a Canvas
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ValveGaugeFormModal; 
