// docker-suite/frontend/src/modules/scada/pages/DevicesPage.jsx

import React, { useState, useEffect } from "react";   
import { useNavigate } from "react-router-dom";
import { getPLCs, deletePLC, togglePLC, regenerateGateway, restartGateway } from "../api/plcApi";
import { useGatewayData } from "../../../hooks/useGatewayData";
import { isConfigDirty, markConfigClean, markConfigDirty } from "../../../utils/configUtils";
import Swal from "sweetalert2";

const DevicesPage = () => {
  const navigate = useNavigate();

  const gateway = useGatewayData();
  const { connected, dataStale, allTags } = gateway;

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [hasPendingChanges, setHasPendingChanges] = useState(isConfigDirty());
  const [isRestarting, setIsRestarting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        console.log("🔍 Fetching PLCs...");
        const data = await getPLCs();
        console.log("✅ PLCs received:", data);
        setDevices(data);
      } catch (err) {
        console.error("❌ Error loading PLC list:", err);
        Swal.fire({
          icon: "error",
          title: "Error loading devices",
          text: err.message || "Could not load devices",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const handleConfigChange = () => {
      setHasPendingChanges(isConfigDirty());
    };
    
    window.addEventListener('configChanged', handleConfigChange);
    return () => window.removeEventListener('configChanged', handleConfigChange);
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar dispositivo?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    try {
      await deletePLC(id);
      setDevices(prev => prev.filter(plc => plc.id !== id));
      
      markConfigDirty();
      
      Swal.fire({
        icon: "success",
        title: "Dispositivo eliminado",
        timer: 1200,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Failed to delete PLC:", err);
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: err.message || "No se pudo eliminar el dispositivo",
      });
    }
  };

  const handleToggle = async (plc) => {
    try {
      const updated = await togglePLC(plc.id, !plc.enabled);
      setDevices(prev =>
        prev.map(d => (d.id === plc.id ? updated : d))
      );
      
      markConfigDirty();
      
      Swal.fire({
        icon: "info",
        title: plc.enabled ? "PLC deshabilitado" : "PLC habilitado",
        text: "Recuerda aplicar la configuración para sincronizar los cambios.",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } catch (err) {
      console.error("Failed to toggle PLC:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cambiar el estado del dispositivo",
      });
    }
  };

  const handleEdit = (plc) => {
    const driverMap = {
      1: "snap7",
      2: "opcua",
      3: "modbus",
    };

    const driverName = driverMap[plc.driver];
    
    if (!driverName) {
      Swal.fire({
        icon: "error",
        title: "Driver no soportado",
        text: "No se puede editar este tipo de dispositivo",
      });
      return;
    }
    navigate(`/devices/edit/${driverName}/${plc.id}`);
  };

  const handleRegenerateGateway = async () => {
    try {
      await regenerateGateway();

      markConfigClean();

      Swal.fire({
        icon: "success",
        title: "Configuración guardada",
        text: "Los archivos YAML han sido actualizados. Para aplicar los cambios, reinicia el gateway.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#3085d6",
      });

      const data = await getPLCs();
      setDevices(data);

    } catch (err) {
      console.error("Failed to regenerate gateway:", err);

      Swal.fire({
        icon: "error",
        title: "Error al guardar configuración",
        text: err.message || "No se pudo guardar la configuración.",
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleRestartGateway = async () => {
    const confirm = await Swal.fire({
      title: "¿Reiniciar Gateway?",
      html: `
        <p>Esta acción va a:</p>
        <ul style="text-align: left; margin-left: 2rem;">
          <li>Guardar todos los cambios en los archivos de configuración</li>
          <li>Reiniciar el proceso del gateway</li>
          <li>Aplicar las variables habilitadas/deshabilitadas</li>
        </ul>
        <p style="margin-top: 1rem;"><strong>¿Continuar?</strong></p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, reiniciar",
      cancelButtonText: "Cancelar"
    });

    if (!confirm.isConfirmed) return;

    setIsRestarting(true);

    try {
      const result = await restartGateway();

      markConfigClean();

      Swal.fire({
        icon: "success",
        title: "Gateway reiniciado",
        html: `
          <p>${result.message || result.detail}</p>
          <p class="text-sm text-gray-600 mt-2">
            Método: <strong>${result.restart_method || 'N/A'}</strong><br/>
            PLCs actualizados: <strong>${result.plcs_updated}</strong>
          </p>
        `,
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#3085d6",
      });

      const data = await getPLCs();
      setDevices(data);

    } catch (err) {
      console.error("Failed to restart gateway:", err);

      Swal.fire({
        icon: "error",
        title: "Error al reiniciar gateway",
        text: err.message || "No se pudo reiniciar el gateway. Prueba reiniciándolo manualmente.",
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsRestarting(false);
    }
  };

  const computeStatus = (plc, mqttData) => {
    if (!plc.enabled) return "disabled";
    if (!mqttData.connected) return "gateway-offline";

    const plcTags = plc.tags || [];
    if (plcTags.length === 0) {
      return "connected"; // Sin tags pero gateway online = conectado
    }

    const hasData = mqttData.allTags.some(
      t => t.equipment_id === plc.equipment_id
    );

    if (hasData && !mqttData.dataStale) return "connected";
    if (hasData && mqttData.dataStale) return "stale";

    return "pending";
  };

  const devicesWithStatus = devices.map(plc => ({
    ...plc,
    status: computeStatus(plc, gateway),
  }));
  
  const goToPLC = (id) => navigate(`/devices/${id}`);
  const goToNewPLC = () => navigate("/devices/new");

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Dispositivos</h1>
        <div className="flex gap-3">
          <button
            onClick={handleRegenerateGateway}
            disabled={!hasPendingChanges}
            className={`px-4 py-2 rounded transition text-white 
              ${hasPendingChanges 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-gray-400 cursor-not-allowed"
              }`}
            title={hasPendingChanges ? "Guardar cambios en archivos YAML" : "No hay cambios pendientes"}
          >
            💾 Guardar Configuración
          </button>

          <button
            onClick={handleRestartGateway}
            disabled={isRestarting}
            className={`px-4 py-2 rounded transition text-white 
              ${isRestarting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
              }`}
            title="Aplicar cambios y reiniciar el gateway"
          >
            {isRestarting ? (
              <>
                <span className="animate-spin inline-block mr-2">⟳</span>
                Reiniciando...
              </>
            ) : (
              <>🔄 Aplicar y Reiniciar Gateway</>
            )}
          </button>

          <button onClick={goToNewPLC}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            + Crear nuevo dispositivo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Cargando dispositivos...</p>
        </div>
      ) : devices.length === 0 ? (
        <div className="p-8 border-2 border-dashed rounded-lg bg-gray-50 text-center">
          <p className="text-gray-600 text-lg mb-4">
            No hay dispositivos configurados
          </p>
          <button
            onClick={() => navigate("/devices/new")}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            + Crear primer dispositivo
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full border border-gray-300 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border text-left">Nombre</th>
                <th className="p-3 border text-left">Driver</th>
                <th className="p-3 border text-left">Unidad de Trabajo</th>
                <th className="p-3 border text-left">Dirección</th>
                <th className="p-3 border text-center">Estado</th>
                <th className="p-3 border text-center">Habilitado</th>
                <th className="p-3 border text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {devicesWithStatus.map(d => (
                <tr 
                  key={d.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td
                    className="p-3 border text-blue-600 font-medium cursor-pointer hover:underline"
                    onClick={() => goToPLC(d.id)}
                  >
                    {d.name}              
                  </td>
                  <td className="p-3 border">{d.driver_name}</td>
                  <td className="p-3 border">{d.work_unit_detail?.name || '-'}</td>
                  <td className="p-3 border font-mono text-sm">{d.connection_string}</td>
                  
                  <td className="p-3 border text-center">
                    <div className="flex items-center justify-center gap-2">
                      {d.status === "connected" && (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-green-600 font-medium">Conectado</span>
                        </>
                      )}
                      {d.status === "stale" && (
                        <>
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          <span className="text-yellow-600 font-medium">Desactualizado</span>
                        </>
                      )}
                      {d.status === "pending" && (
                        <>
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          <span className="text-gray-500 font-medium">Pendiente</span>
                        </>
                      )}
                      {d.status === "disabled" && (
                        <>
                          <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                          <span className="text-gray-400 font-medium">Deshabilitado</span>
                        </>
                      )}
                      {d.status === "gateway-offline" && (
                        <>
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <span className="text-red-600 font-medium">Gateway Offline</span>
                        </>
                      )}
                    </div>
                  </td>

                  <td className="p-3 border text-center">
                    <input
                      type="checkbox"
                      checked={d.enabled}
                      onChange={() => handleToggle(d)}
                      className="w-5 h-5 cursor-pointer"
                      title={d.enabled ? "Clic para deshabilitar" : "Clic para habilitar"}
                    />
                  </td>

                  <td className="p-3 border text-center">
                    <div className="flex justify-center gap-2">
                      {/* 🔥 BOTÓN EDITAR */}
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(d);
                        }}
                        title="Editar dispositivo"
                      >
                        ✏️ Editar
                      </button>

                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(d.id);
                        }}
                        title="Eliminar dispositivo"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-gray-50 px-4 py-3 border-t border-gray-300 text-sm text-gray-600">
            <div className="flex justify-between items-center">
              <span>
                Total: <strong>{devices.length}</strong> dispositivo(s)
              </span>
              <span>
                Habilitados: <strong>{devices.filter(d => d.enabled).length}</strong>
              </span>
              <span>
                Conectados: <strong>{devicesWithStatus.filter(d => d.status === 'connected').length}</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesPage;
