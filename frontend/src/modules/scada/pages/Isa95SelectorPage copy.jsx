import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DeviceWizardTabs from "../components/DeviceWizardTabs";
import ProtocolNotice from "../components/ProtocolNotice";
import WizardNavigation from "../components/WizardNavigationButton";
import { apiFetch, createPLC } from "../api/plcApi";

const inputCls = "h-8 w-full px-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 placeholder:text-slate-400 bg-white focus:border-[#29468B] focus:ring-1 focus:ring-[#29468B]/20 disabled:bg-slate-50 disabled:text-slate-400 transition-colors";
const selectCls = "h-8 w-full px-2 text-[12px] border border-slate-300 rounded-[4px] outline-none text-slate-700 bg-white focus:border-[#29468B] transition-colors disabled:bg-slate-50 disabled:text-slate-400";
const labelCls = "text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600";
const panelCls = "rounded-[4px] border border-slate-200 bg-white p-3 flex flex-col gap-3";

const Isa95SelectorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { from = "", connection = {} } = location.state || {};

  const backRoutes = {
    snap7: "/devices/new/snap7",
    opcua: "/devices/new/opcua",
    modbus: "/devices/new/modbus",
  };

  const backTo = backRoutes[from] || "/devices/new";
  const hasProtocol = Boolean(from && backRoutes[from]);
  const hasConnection = connection && Object.keys(connection).length > 0;

  const [sites, setSites] = useState([]);
  const [areas, setAreas] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [workUnits, setWorkUnits] = useState([]);

  const [siteId, setSiteId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [workCenterId, setWorkCenterId] = useState("");
  const [workUnitId, setWorkUnitId] = useState("");
  const [equipmentName, setEquipmentName] = useState("");

  useEffect(() => {
    if (!hasProtocol || !hasConnection) return;

    const load = async () => {
      try {
        const [sitesResponse, areasResponse, workCentersResponse, workUnitsResponse] = await Promise.all([
          apiFetch("/sites/"),
          apiFetch("/areas/"),
          apiFetch("/workcenters/"),
          apiFetch("/workunits/"),
        ]);

        setSites(sitesResponse);
        setAreas(areasResponse);
        setWorkCenters(workCentersResponse);
        setWorkUnits(workUnitsResponse);
      } catch (err) {
        console.error("Error loading ISA-95 lists:", err);
      }
    };

    load();
  }, [hasConnection, hasProtocol]);

  const filteredAreas = areas.filter((area) => area.site && area.site.id === siteId);
  const filteredWorkCenters = workCenters.filter((workCenter) => workCenter.area && workCenter.area.id === areaId);
  const filteredWorkUnits = workUnits.filter((workUnit) => workUnit.work_center && workUnit.work_center.id === workCenterId);

  useEffect(() => {
    if (!siteId && sites.length > 0) setSiteId(sites[0].id);
  }, [siteId, sites]);

  useEffect(() => {
    if (!siteId) return;
    if (!filteredAreas.some((area) => area.id === areaId)) {
      setAreaId(filteredAreas[0]?.id || "");
    }
  }, [areaId, filteredAreas, siteId]);

  useEffect(() => {
    if (!areaId) return;
    if (!filteredWorkCenters.some((workCenter) => workCenter.id === workCenterId)) {
      setWorkCenterId(filteredWorkCenters[0]?.id || "");
    }
  }, [areaId, filteredWorkCenters, workCenterId]);

  useEffect(() => {
    if (!workCenterId) return;
    if (!filteredWorkUnits.some((workUnit) => workUnit.id === workUnitId)) {
      setWorkUnitId(filteredWorkUnits[0]?.id || "");
    }
  }, [filteredWorkUnits, workCenterId, workUnitId]);

  const handleFinish = async () => {
    if (!equipmentName) {
      return Swal.fire({ icon: "error", title: "Nombre requerido", text: "Por favor introduce un nombre para el equipo." });
    }

    if (!workUnitId) {
      return Swal.fire({ icon: "error", title: "Unidad de trabajo requerida", text: "Selecciona una unidad de trabajo." });
    }

    if (!hasConnection) {
      return Swal.fire({ icon: "error", title: "Datos incompletos", text: "No se recibiÃ³ informaciÃ³n de conexiÃ³n del paso anterior." });
    }

    let ipOrHost = "";
    let connectionData = {};

    if (from === "snap7") {
      ipOrHost = connection.hostname;
      if (!ipOrHost) return Swal.fire({ icon: "error", title: "Hostname requerido", text: "El driver snap7 necesita un hostname vÃ¡lido." });

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

    if (from === "opcua") {
      ipOrHost = connection.endpoint;
      if (!ipOrHost) return Swal.fire({ icon: "error", title: "Endpoint requerido", text: "El driver OPC-UA necesita un endpoint vÃ¡lido." });

      connectionData = {
        endpoint: connection.endpoint,
        namespace_uri: connection.namespace_uri || "",
        security_mode: connection.security_mode || "None",
        security_policy: connection.security_policy || "None",
      };
    }

    if (from === "modbus") {
      ipOrHost = connection.host;
      if (!ipOrHost) return Swal.fire({ icon: "error", title: "Host requerido", text: "El driver Modbus necesita una IP o hostname vÃ¡lido." });

      connectionData = {
        host: connection.host,
        port: connection.port ?? 502,
        unit_id: connection.unit_id ?? 1,
      };
    }

    const payload = {
      name: equipmentName,
      description: connection.description,
      driver_code: from,
      work_unit: workUnitId,
      connection_string: ipOrHost,
      connection_data: connectionData,
    };

    const result = await createPLC(payload);

    if (!result.ok) {
      return Swal.fire({ icon: "error", title: "Error al crear PLC" });
    }

    Swal.fire({ icon: "success", title: "PLC creado correctamente", timer: 1500, showConfirmButton: false });
    navigate("/devices");
  };

  const wizardSteps = [
    { key: "protocol", label: "Protocolo", description: "Completado", to: "/devices/new", enabled: true, current: false },
    { key: "config", label: "Configuracion", description: hasProtocol ? from.toUpperCase() : "Pendiente", to: hasProtocol ? backTo : null, enabled: hasProtocol, current: false },
    { key: "isa95", label: "ISA-95", description: "Paso actual", to: "/devices/new/isa95", enabled: hasProtocol && hasConnection, current: true },
  ];

  return (
    <div className="flex flex-col h-full bg-[#EFEFEF] overflow-hidden">
      <div className="px-3 py-2 bg-white border-b border-slate-200">
        <h1 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
          Nuevo dispositivo â€” Estructura ISA-95
        </h1>
      </div>

      <DeviceWizardTabs steps={wizardSteps} />

      {!hasProtocol || !hasConnection ? (
        <ProtocolNotice
          title="Necesitas completar antes la configuracion de comunicacion"
          description="Puedes ver este paso del wizard, pero para rellenarlo antes debes seleccionar un protocolo de comunicaciÃ³n y completar su configuraciÃ³n bÃ¡sica."
          primaryActionLabel="Ir a seleccionar protocolo"
          onPrimaryAction={() => navigate("/devices/new")}
          secondaryActionLabel={hasProtocol ? "Volver a configuracion" : null}
          onSecondaryAction={hasProtocol ? () => navigate(backTo) : undefined}
        />
      ) : (
        <>
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-xl mx-auto flex flex-col gap-3">
              <p className="text-[11px] text-slate-500">
                Ubica el dispositivo en la jerarquÃ­a de planta. Selecciona de arriba a abajo.
              </p>

              <section className={panelCls}>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Site</label>
                  <select
                    value={siteId}
                    onChange={(e) => {
                      setSiteId(parseInt(e.target.value, 10) || "");
                      setAreaId("");
                      setWorkCenterId("");
                      setWorkUnitId("");
                    }}
                    className={selectCls}
                  >
                    <option value="">Seleccionar site...</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Ãrea</label>
                  <select
                    value={areaId}
                    onChange={(e) => {
                      setAreaId(parseInt(e.target.value, 10) || "");
                      setWorkCenterId("");
                      setWorkUnitId("");
                    }}
                    className={selectCls}
                    disabled={!siteId}
                  >
                    <option value="">Seleccionar Ã¡rea...</option>
                    {filteredAreas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Centro de trabajo</label>
                  <select
                    value={workCenterId}
                    onChange={(e) => {
                      setWorkCenterId(parseInt(e.target.value, 10) || "");
                      setWorkUnitId("");
                    }}
                    className={selectCls}
                    disabled={!areaId}
                  >
                    <option value="">Seleccionar centro...</option>
                    {filteredWorkCenters.map((workCenter) => (
                      <option key={workCenter.id} value={workCenter.id}>
                        {workCenter.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Unidad de trabajo</label>
                  <select
                    value={workUnitId}
                    onChange={(e) => setWorkUnitId(parseInt(e.target.value, 10) || "")}
                    className={selectCls}
                    disabled={!workCenterId}
                  >
                    <option value="">Seleccionar unidad...</option>
                    {filteredWorkUnits.map((workUnit) => (
                      <option key={workUnit.id} value={workUnit.id}>
                        {workUnit.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Nombre del equipo *</label>
                  <input
                    value={equipmentName}
                    onChange={(e) => setEquipmentName(e.target.value)}
                    className={inputCls}
                    placeholder="Mixer01, Extruder02..."
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
        </>
      )}
    </div>
  );
};

export default Isa95SelectorPage;
