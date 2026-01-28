// docker-suite/frontend/src/modules/scada/pages/Isa95SelectorPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPLC } from "../api/plcApi";
import Swal from "sweetalert2";
import { apiFetch } from "../api/plcApi";
import WizardNavigation from "../components/WizardNavigationButton";



const Isa95SelectorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Leer state enviado desde la página del driver (snap7/opcua/modbus)
  const {
    from = "snap7", // driver string por defecto
    connection = {}, // datos de conexión enviados por el paso anterior
  } = location.state || {};

  const backRoutes = {
    snap7: "/devices/new/snap7",
    opcua: "/devices/new/opcua",
    modbus: "/devices/new/modbus",
  };

  const backTo = backRoutes[from] || "/devices/new";

  // Datos que vienen de la API Django
  const [sites, setSites] = useState([]);
  const [areas, setAreas] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [workUnits, setWorkUnits] = useState([]);

  // Selecciones del usuario
  const [siteId, setSiteId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [workCenterId, setWorkCenterId] = useState("");
  const [workUnitId, setWorkUnitId] = useState("");
  const [equipmentName, setEquipmentName] = useState("");

  // Cargar datos de la API al iniciar (añadido try/catch para ver errores)
  useEffect(() => {
    const load = async () => {
      try {
        const s  = await apiFetch("/sites/");
        const a  = await apiFetch("/areas/");
        const wc = await apiFetch("/workcenters/");
        const wu = await apiFetch("/workunits/");

        setSites(s);
        setAreas(a);
        setWorkCenters(wc);
        setWorkUnits(wu);
      } catch (err) {
        console.error("Error loading ISA-95 lists:", err);
      }
    };
    load();
  }, []);

  // Filtrar jerarquía en cascada
  const filteredAreas = areas.filter((a) => a.site && a.site.id === siteId);
  const filteredWorkCenters = workCenters.filter((wc) => wc.area && wc.area.id === areaId);
  const filteredWorkUnits = workUnits.filter((wu) => wu.work_center && wu.work_center.id === workCenterId);

  const handleFinish = async () => {
    if (!equipmentName) {
      return Swal.fire({
        icon: "error",
        title: "Nombre requerido",
        text: "Por favor introduce un nombre para el equipo.",
      });
    }

    if (!workUnitId) {
      return Swal.fire({
        icon: "error",
        title: "Unidad de trabajo requerida",
        text: "Selecciona una unidad de trabajo.",
      });
    }


    if (!connection || Object.keys(connection).length === 0) {
      return Swal.fire({
        icon: "error",
        title: "Datos incompletos",
        text: "No se recibió información de conexión del paso anterior.",
      });
    }

    let ip_or_host = "";
    let connectionData = {};

    // ========================================
    // SNAP7 (Siemens S7)
    // ========================================
    if (from === "snap7") {
      ip_or_host = connection.hostname;
      if (!ip_or_host) {
        return Swal.fire({
          icon: "error",
          title: "Hostname requerido",
          text: "El driver snap7 necesita un hostname válido.",
        });
      }

      connectionData = {
        hostname: connection.hostname,
        rack: connection.rack ?? 0,
        slot: connection.slot ?? 1,
        port: connection.port ?? 102,
        connection_type: connection.connection_type || "PG",
        timeout_ms: connection.timeout_ms ?? 5000,
        keepalive_ms: connection.keepalive_ms ?? 30000,
      };
    }

    // ========================================
    // OPC UA
    // ========================================
    if (from === "opcua") {
      ip_or_host = connection.endpoint;
      if (!ip_or_host) {
        return Swal.fire({
          icon: "error",
          title: "Endpoint requerido",
          text: "El driver OPC-UA necesita un endpoint URL válido.",
        });
      }

      connectionData = {
        endpoint: connection.endpoint,
        namespace_uri: connection.namespace_uri || "",
        security_mode: connection.security_mode || "None",
        security_policy: connection.security_policy || "None",
        
        // Certificados (opcionales)
        ...(connection.certificate && { certificate: connection.certificate }),
        ...(connection.private_key && { private_key: connection.private_key }),
        ...(connection.application_uri && { application_uri: connection.application_uri }),
        
        // Autenticación (opcional)
        ...(connection.username && { username: connection.username }),
        ...(connection.password && { password: connection.password }),
        
        // Timeouts
        timeouts_ms: {
          connect: connection.timeout_connect ?? 5000,
          session: connection.timeout_session ?? 10000,
        },
        
        // Reconnect
        reconnect: {
          enable: connection.reconnect_enable ?? true,
          min_delay_ms: connection.reconnect_min_delay ?? 1000,
          max_delay_ms: connection.reconnect_max_delay ?? 10000,
        },
      };
    }

    // ========================================
    // MODBUS TCP
    // ========================================
    if (from === "modbus") {
      ip_or_host = connection.host;
      if (!ip_or_host) {
        return Swal.fire({
          icon: "error",
          title: "Host requerido",
          text: "El driver Modbus necesita una IP o hostname válido.",
        });
      }

      connectionData = {
        host: connection.host,
        port: connection.port ?? 502,
        unit_id: connection.unit_id ?? 1,
        timeout_ms: connection.timeout_ms ?? 5000,
        retry_on_empty: connection.retry_on_empty ?? false,
        retry_on_invalid: connection.retry_on_invalid ?? false,
        close_comm_on_error: connection.close_comm_on_error ?? false,
        strict: connection.strict ?? true,
        framer: connection.framer || "socket",
      };
    }

    // ========================================
    // PAYLOAD FINAL
    // ========================================
    const payload = {
      name: equipmentName,
      description: connection.description,
      driver_code: from,  
      work_unit: workUnitId,
      connection_string: ip_or_host,      // Para mostrar en UI
      connection_data: connectionData,     // Objeto completo para YAML
    };

    console.log("Creating PLC with payload:", payload);

    const result = await createPLC(payload);

    if (!result.ok) {
      // Convertir el JSON de error en texto legible
      const message = Object.entries(result.error)
        .map(([field, err]) => {
          if (Array.isArray(err)) return `${field}: ${err.join(", ")}`;
          if (typeof err === "string") return `${field}: ${err}`;
          return `${field}: ${JSON.stringify(err)}`;
        })
        .join("\n");

      return Swal.fire({
        icon: "error",
        title: "Error al crear PLC",
        text: message,
      });
    }

    // Si funciona:
    Swal.fire({
      icon: "success",
      title: "PLC creado correctamente",
      timer: 1500,
      showConfirmButton: false,
    });

    navigate("/devices");
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">ISA-95 Structure</h1>

      {/* SITE */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Site</label>
        <select
          value={siteId}
          onChange={(e) => {
            setSiteId(parseInt(e.target.value) || "");
            setAreaId("");
            setWorkCenterId("");
            setWorkUnitId("");
          }}
          className="w-full border p-2 rounded"
        >
          <option value="">Select site...</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* AREA */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Area</label>
        <select
          value={areaId}
          onChange={(e) => {
            setAreaId(parseInt(e.target.value) || "");
            setWorkCenterId("");
            setWorkUnitId("");
          }}
          className="w-full border p-2 rounded"
          disabled={!siteId}
        >
          <option value="">Select area...</option>
          {filteredAreas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* WORKCENTER */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Work Center</label>
        <select
          value={workCenterId}
          onChange={(e) => {
            setWorkCenterId(parseInt(e.target.value) || "");
            setWorkUnitId("");
          }}
          className="w-full border p-2 rounded"
          disabled={!areaId}
        >
          <option value="">Select work center...</option>
          {filteredWorkCenters.map((wc) => (
            <option key={wc.id} value={wc.id}>
              {wc.name}
            </option>
          ))}
        </select>
      </div>

      {/* WORKUNIT */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Work Unit</label>
        <select
          value={workUnitId}
          onChange={(e) => setWorkUnitId(parseInt(e.target.value) || "")}
          className="w-full border p-2 rounded"
          disabled={!workCenterId}
        >
          <option value="">Select work unit...</option>
          {filteredWorkUnits.map((wu) => (
            <option key={wu.id} value={wu.id}>
              {wu.name}
            </option>
          ))}
        </select>
      </div>

      {/* EQUIPMENT NAME */}
      <div className="mb-6">
        <label className="block text-sm font-medium">Equipment Name</label>
        <input
          value={equipmentName}
          onChange={(e) => setEquipmentName(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Mixer01, Extruder02, EBW01..."
        />
      </div>

      {/* FINISH BUTTON */}
      <WizardNavigation
        onBack={() => navigate(backTo)}
        onNext={handleFinish}
        disabled={!siteId || !areaId || !workCenterId || !workUnitId || !equipmentName}
        nextLabel="Finish"
        nextClassName="bg-green-600 hover:bg-green-700 text-white"
      />
    </div>
  );
};

export default Isa95SelectorPage;
