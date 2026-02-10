import React, { useState } from "react";

/**
 * Modal sencillo para confirmar publicación/guardado.
 * Props:
 * - isOpen: boolean
 * - initialName: string
 * - onConfirm(name: string)
 * - onClose()
 */
const PublishModal = ({ isOpen, initialName = "", onConfirm, onClose }) => {
  const [name, setName] = useState(initialName);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96">
        <h2 className="text-xl font-semibold mb-4">Publicar/Guardar</h2>
        <p className="text-sm text-gray-600 mb-2">
          Nombre de la aplicación/vista:
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-6"
          placeholder="Nombre"
        />
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition duration-150"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition duration-150 disabled:opacity-50"
            disabled={!name.trim()}
            onClick={() => onConfirm?.(name.trim())}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
