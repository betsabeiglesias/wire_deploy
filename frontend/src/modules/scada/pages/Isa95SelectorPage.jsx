// frontend/src/modules/scada/pages/Isa95SelectorPage.jsx

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPLC } from "../api/plcApi";
import Swal from "sweetalert2";
import { apiFetch } from "../api/plcApi";
import WizardNavigation from "../components/WizardNavigationButton";

const inputCls  = "h-8 w-full px-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 placeholder:text-slate-400 bg-white focus:border-[#29468B] focus:ring-1 focus:ring-[#29468B]/20 disabled:bg-slate-50 disabled:text-slate-400 transition-colors";
const selectCls = "h-8 w-full px-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 bg-white focus:border-[#29468B] transition-colors disabled:bg-slate-50 disabled:text-slate-400";
const labelCls  = "text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600";
const panelCls  = "rounded-[4px] border border-slate-200 bg-white p-3 flex flex-col gap-3";

const Isa95SelectorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    from = "snap7",
    connection = {},
  } = location.state || {};

  const backRoutes = {
    snap7:  "/devices/new/snap7",
    opcua:  "/devices/new/opcua",
    modbus: "/devices/new/modbus",
  };
  const backTo = backRoutes[from] || "/devices/new";

  const [sites, setSites]             = useState([]);
  const [areas, setAreas]             = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [workUnits, setWorkUnits]     = useState([]);

  const [siteId, setSiteId]               = useState("");
  const [areaId, setAreaId]               = useState("");
  const [workCenterId, setWorkCenterId]   = useState("");
  const [workUnitId, setWorkUnitId]       = useState("");
  const [equipmentName, setEquipmentName] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a, wc, wu] = await Promise.all([
          apiFetch("/sites/"),
          apiFetch("/areas/"),
          apiFetch("/workcenters/"),
          apiFetch("/workunits/"),
        ]);
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

  const filteredAreas       = areas.filter((a) => a.site && a.site.id === siteId);
  const filteredWorkCenters = workCenters.filter((wc) => wc.area && wc.area.id === areaId);
  const filteredWorkUnits   = workUnits.filter((wu) => wu.work_center && wu.work_center.id === workCenterId);

  const handleFinish = async () => {
    if (!equipmentName) {
      return Swal.fire({ icon: "error", title: "Nombre requerido", text: "Por favor introduce un nombre para el equipo." });
    }
    if (!workUnitId) {
      return Swal.fire({ icon: "error", title: "Unidad de trabajo requerida", text: "Selecciona una unidad de trabajo." });
    }
    if (!connection || Object.keys(connection).length === 0) {
      return Swal.fire({ icon: "error", title: "Datos incompletos", text: "No se recibió información de conexión del paso anterior." });
    }

    let ip_or_host = "";
    let connectionData = {};

    if (from === "snap7") {
      ip_or_host = connection.hostname;
      if (!ip_or_host) return Swal.fire({ icon: "error", title: "Hostname requerido", text: "El driver snap7 necesita un hostname válido." });
      connectionData = {
        hostname:        connection.hostname,
        rack:            connection.rack ?? 0,
        slot:            connection.slot ?? 1,
        port:            connection.port ?? 102,
        connection_type: connection.connection_type || "PG",
        timeout_ms:      connection.timeout_ms ?? 5000,
        keepalive_ms:    connection.keepalive_ms ?? 30000,
      };
    }

    if (from === "opcua") {
      ip_or_host = connection.endpoint;
      if (!ip_or_host) return Swal.fire({ icon: "error", title: "Endpoint requerido", text: "El driver OPC-UA necesita un endpoint URL válido." });
      connectionData = {
        endpoint:      connection.endpoint,
        namespace_uri: connection.namespace_uri || "",
        security_mode: connection.security_mode || "None",
        security_policy: connection.security_policy || "None",
        ...(connection.certificate && { certificate: connection.certificate }),
        ...(connection.private_key && { private_key: connection.private_key }),
        ...(connection.application_uri && { application_uri: connection.application_uri }),
        ...(connection.username && { username: connection.username }),
        ...(connection.password && { password: connection.password }),
        timeouts_ms: {
          connect: connection.timeout_connect ?? 5000,
          session: connection.timeout_session ?? 10000,
        },
        reconnect: {
          enable:        connection.reconnect_enable ?? true,
          min_delay_ms:  connection.reconnect_min_delay ?? 1000,
          max_delay_ms:  connection.reconnect_max_delay ?? 10000,
        },
      };
    }

    if (from === "modbus") {
      ip_or_host = connection.host;
      if (!ip_or_host) return Swal.fire({ icon: "error", title: "Host requerido", text: "El driver Modbus necesita una IP o hostname válido." });
      connectionData = {
        host:                connection.host,
        port:                connection.port ?? 502,
        unit_id:             connection.unit_id ?? 1,
        timeout_ms:          connection.timeout_ms ?? 5000,
        retry_on_empty:      connection.retry_on_empty ?? false,
        retry_on_invalid:    connection.retry_on_invalid ?? false,
        close_comm_on_error: connection.close_comm_on_error ?? false,
        strict:              connection.strict ?? true,
        framer:              connection.framer || "socket",
      };
    }

    const payload = {
      name:              equipmentName,
      description:       connection.description,
      driver_code:       from,
      work_unit:         workUnitId,
      connection_string: ip_or_host,
      connection_data:   connectionData,
    };

    const result = await createPLC(payload);

    if (!result.ok) {
      const message = Object.entries(result.error)
        .map(([field, err]) => {
          if (Array.isArray(err)) return `${field}: ${err.join(", ")}`;
          if (typeof err === "string") return `${field}: ${err}`;
          return `${field}: ${JSON.stringify(err)}`;
        })
        .join("\n");
      return Swal.fire({ icon: "error", title: "Error al crear PLC", text: message });
    }

    Swal.fire({ icon: "success", title: "PLC creado correctamente", timer: 1500, showConfirmButton: false });
    navigate("/devices");
  };

  return (
    <div className="flex flex-col h-full bg-[#EFEFEF] overflow-hidden">
      <div className="px-3 py-2 bg-white border-b border-slate-200">
        <h1 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
          Nuevo dispositivo — Estructura ISA-95
        </h1>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-xl mx-auto flex flex-col gap-3">
          <p className="text-[11px] text-slate-500">
            Ubica el dispositivo en la jerarquía de planta. Selecciona de arriba a abajo.
          </p>

          <section className={panelCls}>

            {/* SITE */}
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Site</label>
              <select
                value={siteId}
                onChange={(e) => { setSiteId(parseInt(e.target.value) || ""); setAreaId(""); setWorkCenterId(""); setWorkUnitId(""); }}
                className={selectCls}
              >
                <option value="">Seleccionar site...</option>
                {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* AREA */}
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Área</label>
              <select
                value={areaId}
                onChange={(e) => { setAreaId(parseInt(e.target.value) || ""); setWorkCenterId(""); setWorkUnitId(""); }}
                className={selectCls}
                disabled={!siteId}
              >
                <option value="">Seleccionar área...</option>
                {filteredAreas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            {/* WORK CENTER */}
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Centro de trabajo</label>
              <select
                value={workCenterId}
                onChange={(e) => { setWorkCenterId(parseInt(e.target.value) || ""); setWorkUnitId(""); }}
                className={selectCls}
                disabled={!areaId}
              >
                <option value="">Seleccionar centro de trabajo...</option>
                {filteredWorkCenters.map((wc) => <option key={wc.id} value={wc.id}>{wc.name}</option>)}
              </select>
            </div>

            {/* WORK UNIT */}
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Unidad de trabajo</label>
              <select
                value={workUnitId}
                onChange={(e) => setWorkUnitId(parseInt(e.target.value) || "")}
                className={selectCls}
                disabled={!workCenterId}
              >
                <option value="">Seleccionar unidad de trabajo...</option>
                {filteredWorkUnits.map((wu) => <option key={wu.id} value={wu.id}>{wu.name}</option>)}
              </select>
            </div>

            {/* EQUIPMENT NAME */}
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Nombre del equipo *</label>
              <input
                value={equipmentName}
                onChange={(e) => setEquipmentName(e.target.value)}
                className={inputCls}
                placeholder="Mixer01, Extruder02, EBW01..."
              />
            </div>
          </section>
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-t border-slate-200">
        <div className="max-w-xl mx-auto">
          <WizardNavigation
            onBack={() => navigate(backTo)}
            onNext={handleFinish}
            nextDisabled={!siteId || !areaId || !workCenterId || !workUnitId || !equipmentName}
            nextLabel="Finalizar"
            nextClassName="bg-[#2A8B4B] hover:bg-[#237A41] text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default Isa95SelectorPage;
