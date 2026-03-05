// modules/organizarScada/components/TagSelector.jsx
import { useState, useMemo } from "react";
import useScadaConfig from "../hooks/useScadaConfig";

export function TagSelector({ value, onChange }) {
  const config = useScadaConfig();
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");

  const equipments = useMemo(() => {
    if (!config?.equipments) return [];

    return config.equipments.map((eq) => ({
      equipmentId: eq.equipment_id,
      items: (eq.items ?? []).map((item) => ({
        tag: item.cdc?.tag ?? item.name,
        name: item.name,
        unit: item.cdc?.unit ?? "",
        datatype: item.datatype ?? "Float",
      })),
    }));
  }, [config]);

  const selectedEquipment = equipments.find(
    (eq) => eq.equipmentId === selectedEquipmentId
  );

  const handleVariableChange = (e) => {
    const selectedTagId = e.target.value;

    const item = selectedEquipment?.items.find(
      (i) => i.tag === selectedTagId
    );

    if (!item) return;

    onChange({
      equipmentId: selectedEquipment.equipmentId,
      variableName: item.name,
      tagId: item.tag,
      datatype: item.datatype,
      unit: item.unit,
    });
  };
  if (!config) return <div>Cargando configuración...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {/* Selector equipo */}
      <select
        value={selectedEquipmentId}
        onChange={(e) => {
          setSelectedEquipmentId(e.target.value);
          onChange(null);
        }}
      >
        <option value="">Selecciona equipo</option>
        {equipments.map((eq) => (
          <option key={eq.equipmentId} value={eq.equipmentId}>
            {eq.equipmentId}
          </option>
        ))}
      </select>

      {/* Selector variable */}
      {selectedEquipment && (
        <select
          value={value?.tagId || ""}
          onChange={handleVariableChange}
        >
          <option value="">Selecciona variable</option>
          {selectedEquipment.items.map((item) => (
            <option key={item.tag} value={item.tag}>
              {item.name} {item.unit ? `(${item.unit})` : ""}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}