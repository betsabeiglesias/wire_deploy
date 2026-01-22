// frontend/src/modules/organizarScada/pages/Scada.jsx


//// OJO!! SI SE VA A EMPEZAR A USAR, METERLO EN GATEWAY/PAGES

import React, { useState, useEffect } from 'react';
import DynamicChart from '../../components/DynamicChart';
import { scadaService } from '../../services/scadaService';

function PageScada() {
  const [allEquipment, setAllEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedVariables, setSelectedVariables] = useState([]);

  // Filtros jerárquicos
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedCell, setSelectedCell] = useState('');

  // Cargar todo
  useEffect(() => {
    scadaService.getEquipmentWithVariables().then(data => {
      setAllEquipment(data);
    });
  }, []);

  // Aplicar filtros progresivos
  useEffect(() => {
    const filtered = allEquipment.filter(e =>
      (!selectedSite || e.site === selectedSite) &&
      (!selectedArea || e.area === selectedArea) &&
      (!selectedLine || e.line === selectedLine) &&
      (!selectedCell || e.cell === selectedCell)
    );
    setFilteredEquipment(filtered);
  }, [allEquipment, selectedSite, selectedArea, selectedLine, selectedCell]);

  const unique = (arr, key) => [...new Set(arr.map(item => item[key]).filter(Boolean))];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">SCADA Dashboard</h1>

      {/* Selectores jerárquicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <select onChange={e => setSelectedSite(e.target.value)} className="border px-3 py-2">
          <option value="">-- Selecciona Site --</option>
          {unique(allEquipment, 'site').map(site => (
            <option key={site} value={site}>{site}</option>
          ))}
        </select>

        <select onChange={e => setSelectedArea(e.target.value)} className="border px-3 py-2" disabled={!selectedSite}>
          <option value="">-- Selecciona Área --</option>
          {unique(filteredEquipment, 'area').map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>

        <select onChange={e => setSelectedLine(e.target.value)} className="border px-3 py-2" disabled={!selectedArea}>
          <option value="">-- Selecciona Línea --</option>
          {unique(filteredEquipment, 'line').map(line => (
            <option key={line} value={line}>{line}</option>
          ))}
        </select>

        <select onChange={e => setSelectedCell(e.target.value)} className="border px-3 py-2" disabled={!selectedLine}>
          <option value="">-- Selecciona Celda --</option>
          {unique(filteredEquipment, 'cell').map(cell => (
            <option key={cell} value={cell}>{cell}</option>
          ))}
        </select>

        <select onChange={e => {
          const eq = filteredEquipment.find(equip => equip.equipment_id === e.target.value);
          setSelectedEquipment(eq);
          setSelectedVariables(eq?.variables.slice(0, 3) || []);
        }} className="border px-3 py-2" disabled={!selectedCell}>
          <option value="">-- Selecciona Equipo --</option>
          {filteredEquipment.map(eq => (
            <option key={eq.equipment_id} value={eq.equipment_id}>
              {eq.name} ({eq.equipment_id.split("/").pop()})
            </option>
          ))}
        </select>
      </div>

      {/* Selector de variables */}
      {selectedEquipment && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Variables a visualizar:</label>
          <div className="flex flex-wrap gap-2">
            {selectedEquipment.variables.map(variable => (
              <label key={variable} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedVariables.includes(variable)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedVariables([...selectedVariables, variable]);
                    } else {
                      setSelectedVariables(selectedVariables.filter(v => v !== variable));
                    }
                  }}
                />
                {variable}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedVariables.map((variable, index) => (
          <DynamicChart
            key={`${selectedEquipment.equipment_id}-${variable}`}
            equipmentId={selectedEquipment.equipment_id}
            variable={variable}
            title={`${selectedEquipment.name} - ${variable}`}
            color={['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'][index % 4]}
          />
        ))}
      </div>
    </div>
  );
}

export default PageScada;