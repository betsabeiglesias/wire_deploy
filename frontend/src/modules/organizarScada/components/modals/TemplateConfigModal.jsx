// TemplateConfigModal.jsx
import React from "react";

const TemplateConfigModal = ({
  isOpen,
  template,
  selectedEquipment,
  selectedVariable,
  onVariableChange,
  variables,
  decimalPlaces,
  onDecimalPlacesChange,
  onConfirm,
  onClose,
}) => {
  if (!isOpen || !template) return null;

  return (
    <div className="modal-backdrop gauge-modal-backdrop" onClick={onClose}>
      <div
        className="modal-content gauge-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Configurar {template.title}</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-form">
          <div className="modal-info">
            Equipo seleccionado:{" "}
            <strong>{selectedEquipment || "Ninguno"}</strong>
          </div>
          <label>Variable</label>
          <select
            value={selectedVariable}
            onChange={(e) => onVariableChange(e.target.value)}
            disabled={!selectedEquipment}
          >
            <option value="">Selecciona una variable</option>
            {variables.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          <label>Decimales</label>
          <input
            type="number"
            min="0"
            max="4"
            value={decimalPlaces}
            onChange={(e) =>
              onDecimalPlacesChange(parseInt(e.target.value) || 0)
            }
          />
        </div>
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="add-button"
            disabled={!selectedVariable || !selectedEquipment}
            onClick={onConfirm}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateConfigModal;
