// import React from "react";

// const ExportModal = ({ exportName, setExportName, onClose, onConfirm, isLoading, currentLayoutId, layOutName }) => (
//   <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//     <div className="bg-white p-6 rounded-xl shadow-xl w-96">
//       <h2 className="text-xl font-semibold mb-4">
//         {currentLayoutId ? "Confirmar Edición" : "Confirmar Creación"}
//       </h2>
//       <p className="text-gray-700 mb-4">
//         ¿Estás seguro de que quieres{" "}
//         <span className="font-bold">{currentLayoutId ? "actualizar" : "crear"}</span>{" "}
//         el layout {layOutName ? `**${layOutName}**` : ""} y descargar el archivo?
//       </p>
//       <input
//         type="text"
//         value={exportName}
//         onChange={(e) => setExportName(e.target.value)}
//         className="w-full px-3 py-2 border rounded mb-6"
//         disabled={isLoading}
//       />
//       <div className="flex justify-end gap-3">
//         <button
//           className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
//           onClick={onClose}
//           disabled={isLoading}
//         >
//           Cancelar
//         </button>
//         <button
//           className={`px-4 py-2 rounded text-white ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
//           onClick={onConfirm}
//           disabled={isLoading}
//         >
//           {isLoading ? "Guardando..." : currentLayoutId ? "Actualizar y Descargar" : "Crear y Descargar"}
//         </button>
//       </div>
//     </div>
//   </div>
// );

// export default ExportModal;
