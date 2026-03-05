import React, { useEffect, useMemo, useState } from "react";
import { getPLC, getPLCs } from "@/modules/scada/api/plcApi";
import { useRealtime } from "@/realtime/RealtimeProvider";
import api from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";

// Modal flotante para gestionar PLCs/tablas.
// El estado se mantiene en memoria y se sincroniza con backend.

const CUSTOM_TAG_GROUPS_ENDPOINTS = [
  "/api/scada-manager/custom-tag-groups/",
  "/api/scada/custom-tag-groups/",
];
const CUSTOM_TAGS_ENDPOINTS = [
  "/api/scada-manager/custom-tags/",
  "/api/scada/custom-tags/",
];

const isNumericId = (value) => {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "string") return false;
  return /^\d+$/.test(value.trim());
};

const toNullable = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
};

const extractApiErrorMessage = (error) => {
  const payload = error?.response?.data;
  if (!payload) return "No se pudo guardar. Verifica tu conexion.";
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) return payload.join(" ");
  if (payload?.detail) return String(payload.detail);

  const firstKey = Object.keys(payload)[0];
  if (!firstKey) return "No se pudo guardar. Verifica los datos.";
  const value = payload[firstKey];
  if (Array.isArray(value)) return `${firstKey}: ${value.join(" ")}`;
  return `${firstKey}: ${String(value)}`;
};

const requestWithEndpointFallback = async (configBuilder, endpoints) => {
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      return await api(configBuilder(endpoint));
    } catch (err) {
      const status = err?.response?.status;
      // Si la ruta no existe, probamos el siguiente prefijo.
      if (status === 404) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error("No se encontro endpoint disponible.");
};

const requestListWithEndpointFallback = async (endpoints, params = {}) => {
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint, { params });
      return response?.data;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error("No se encontro endpoint disponible.");
};

const DeviceManagerModal = ({ open, onClose }) => {
  const [devices, setDevices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [apiDevices, setApiDevices] = useState([]);
  const authUser = useAuthStore((state) => state.user);
  const realtime = useRealtime();
  const allTags = realtime?.allTags || [];

  useEffect(() => {
    let cancelled = false;

    const toArray = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.results)) return payload.results;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    };

    const loadCustomTagGroups = async () => {
      try {
        const clientId =
          authUser?.client?.id ||
          authUser?.client_id ||
          authUser?.clientId ||
          null;

        const rawGroups = await requestListWithEndpointFallback(
          CUSTOM_TAG_GROUPS_ENDPOINTS,
          clientId ? { client_id: clientId } : {},
        );
        if (cancelled) return;

        const groups = toArray(rawGroups);
        const backendTables = groups.map((group) => {
          const backendTags = Array.isArray(group?.tags) ? group.tags : [];
          return {
            id: `grp-${group.id}`,
            backendGroupId: group.id,
            name: group?.name || `Tabla ${group.id}`,
            equipmentId: "",
            tags: backendTags.map((tag, idx) => ({
              sourceMode: String(tag?.cdc_tag || "").startsWith("local/")
                ? "local"
                : "conexion",
              id: tag?.id ? String(tag.id) : `grp-${group.id}-tag-${idx}`,
              backendId: tag?.id || null,
              name: tag?.tag_name || `Tag ${idx + 1}`,
              conn: String(tag?.cdc_tag || "").startsWith("local/")
                ? "Local"
                : "Conexion",
              type: tag?.datatype || "Float",
              datatype: tag?.datatype || "Float",
              variableName: tag?.tag_name || "",
              deviceId: "",
              equipment: tag?.equipment_id || "",
              endpoint: "",
              address: "",
              nodeId: tag?.node_id || "",
              node_id: tag?.node_id || "",
              initialValue: "",
              plcName: "",
              unit: tag?.unit || "",
              notes: "",
              plcVariable: tag?.cdc_tag || "",
              cdcTag: tag?.cdc_tag || "",
              variable: tag?.cdc_tag || "",
              deviceTag: tag?.cdc_tag || "",
              bindingKey: `db::${group.id}::${tag?.id || idx}`,
            })),
          };
        });

        setDevices((prev) => {
          const manualTables = prev.filter(
            (table) => !table.backendGroupId && !table.apiDeviceId,
          );
          const byBackendId = new Map(
            prev
              .filter((table) => table.backendGroupId)
              .map((table) => [String(table.backendGroupId), table]),
          );

          const mergedBackend = backendTables.map((table) => {
            const existing = byBackendId.get(String(table.backendGroupId));
            if (!existing) return table;
            return {
              ...table,
              id: existing.id || table.id,
            };
          });

          const apiTables = prev.filter((table) => table.apiDeviceId);
          return [...manualTables, ...mergedBackend, ...apiTables];
        });
      } catch (err) {
        console.error(
          "DeviceManagerModal: no se pudo cargar custom-tag-groups",
          err,
        );
      }
    };

    loadCustomTagGroups();
    return () => {
      cancelled = true;
    };
  }, [authUser]);

  useEffect(() => {
    let cancelled = false;

    const toArray = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.results)) return payload.results;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.items)) return payload.items;
      if (Array.isArray(payload?.plcs)) return payload.plcs;
      if (payload && typeof payload === "object") {
        const values = Object.values(payload);
        if (values.length && values.every((v) => v && typeof v === "object")) {
          return values;
        }
      }
      return [];
    };

    const pickPlcId = (plc) =>
      plc?.id ?? plc?.pk ?? plc?.uuid ?? plc?.plc_id ?? null;

    const extractRows = (plc, basePlc) => {
      const a =
        plc?.items ||
        plc?.tags ||
        plc?.variables ||
        plc?.config?.items ||
        plc?.config?.tags ||
        plc?.config?.variables ||
        [];
      if (Array.isArray(a) && a.length) return a;
      const b =
        basePlc?.items ||
        basePlc?.tags ||
        basePlc?.variables ||
        basePlc?.config?.items ||
        basePlc?.config?.tags ||
        basePlc?.config?.variables ||
        [];
      return Array.isArray(b) ? b : [];
    };

    const loadDevicesFromApi = async () => {
      try {
        const plcsRaw = await getPLCs();
        if (cancelled) return;
        const plcList = toArray(plcsRaw);

        const detailResults = await Promise.allSettled(
          plcList.map((plc) => {
            const plcId = pickPlcId(plc);
            return plcId ? getPLC(plcId) : Promise.resolve(plc);
          }),
        );
        if (cancelled) return;

        const normalizedDevices = [];
        detailResults.forEach((result, index) => {
          const basePlc = plcList[index] || {};
          const plc =
            result.status === "fulfilled" && result.value
              ? result.value
              : basePlc;
          const plcId = pickPlcId(plc) ?? pickPlcId(basePlc) ?? `plc-${index}`;
          const equipmentId =
            plc?.equipment_id ||
            basePlc?.equipment_id ||
            basePlc?.name ||
            plc?.name ||
            "";
          const endpoint =
            plc?.connection?.endpoint ||
            plc?.connection_data?.endpoint ||
            plc?.config?.connection?.endpoint ||
            basePlc?.connection?.endpoint ||
            basePlc?.connection_data?.endpoint ||
            basePlc?.config?.connection?.endpoint ||
            "";
          const driver = plc?.driver || basePlc?.driver || "";
          const sourceRows = extractRows(plc, basePlc);
          const normalizedTags = sourceRows.map((tag, tagIdx) => ({
            cdcTag:
              tag?.cdc?.tag ||
              tag?.plcVariable ||
              tag?.variable ||
              tag?.tag ||
              tag?.attributeKey ||
              tag?.name ||
              "",
            id: tag?.id || `${plcId}-${tagIdx}`,
            name:
              tag?.name ||
              tag?.variable ||
              tag?.tag ||
              tag?.cdc?.tag ||
              tag?.attributeKey ||
              `var_${tagIdx + 1}`,
            variable:
              tag?.variable ||
              tag?.name ||
              tag?.tag ||
              tag?.cdc?.tag ||
              tag?.attributeKey ||
              "",
            variableName:
              tag?.name ||
              tag?.variableName ||
              tag?.variable ||
              tag?.tag ||
              tag?.attributeKey ||
              tag?.cdc?.tag ||
              "",
            plcVariable:
              tag?.plcVariable ||
              tag?.cdc?.tag ||
              tag?.variable ||
              tag?.tag ||
              tag?.attributeKey ||
              tag?.name ||
              "",
            address: tag?.address || endpoint,
            endpoint,
            nodeId:
              tag?.node_id ||
              tag?.nodeId ||
              tag?.nodeid ||
              tag?.addressing?.node_id ||
              tag?.addressing?.nodeid ||
              "",
            node_id:
              tag?.node_id ||
              tag?.nodeId ||
              tag?.nodeid ||
              tag?.addressing?.node_id ||
              tag?.addressing?.nodeid ||
              "",
            datatype: tag?.datatype || tag?.type || "Float",
            unit: tag?.unit || tag?.cdc?.unit || "",
            deviceId: String(plcId),
            equipment: equipmentId,
            plcName: driver,
            sourceMode:
              tag?.sourceMode ||
              (tag?.deviceId || tag?.plcVariable || tag?.address || tag?.nodeId
                ? "conexion"
                : "local"),
            conn: tag?.conn || "Conexion",
            bindingKey:
              tag?.bindingKey ||
              `${plcId}::${tag?.name || tag?.variable || tag?.tag || tag?.attributeKey || tag?.cdc?.tag || ""}`,
          }));

          normalizedDevices.push({
            id: String(plcId),
            name:
              plc?.name || basePlc?.name || equipmentId || `PLC ${index + 1}`,
            equipmentId,
            driver,
            endpoint,
            tags: normalizedTags,
          });
        });
        if (!cancelled) setApiDevices(normalizedDevices);
      } catch (_err) {
        console.error(
          "DeviceManagerModal: no se pudo cargar PLCs desde API",
          _err,
        );
        if (!cancelled) setApiDevices([]);
      }
    };

    loadDevicesFromApi();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!devices.length) {
      setSelectedId(null);
      setSelectedTagId(null);
      return;
    }
    if (!selectedId || !devices.some((d) => d.id === selectedId)) {
      setSelectedId(devices[0].id);
    }
  }, [devices, selectedId]);

  const selected = useMemo(
    () => devices.find((d) => d.id === selectedId) || { tags: [] },
    [devices, selectedId],
  );

  useEffect(() => {
    const tags = selected?.tags || [];
    if (!tags.length) {
      setSelectedTagId(null);
      return;
    }
    if (!selectedTagId || !tags.some((t) => t.id === selectedTagId)) {
      setSelectedTagId(tags[0].id);
    }
  }, [selectedId, selected?.tags, selectedTagId]);

  useEffect(() => {
    if (!apiDevices.length) return;
    setDevices((prev) => {
      const prevByApiId = new Map(
        prev
          .map((table) => [table.apiDeviceId || null, table])
          .filter(([apiId]) => Boolean(apiId)),
      );

      const fromApi = apiDevices.map((dev) => {
        const existing = prevByApiId.get(dev.id);
        if (existing) {
          return {
            ...existing,
            name: existing.name || dev.name || dev.equipmentId || existing.id,
            equipmentId: dev.equipmentId || existing.equipmentId || "",
            endpoint: dev.endpoint || existing.endpoint || "",
            driver: dev.driver || existing.driver || "",
            tags:
              Array.isArray(existing.tags) && existing.tags.length
                ? existing.tags
                : dev.tags || [],
          };
        }
        return {
          id: `api-${dev.id}`,
          apiDeviceId: dev.id,
          name: dev.name || dev.equipmentId || `PLC ${dev.id}`,
          equipmentId: dev.equipmentId || "",
          endpoint: dev.endpoint || "",
          driver: dev.driver || "",
          tags: dev.tags || [],
        };
      });

      const manualTables = prev.filter((table) => !table.apiDeviceId);
      return [...manualTables, ...fromApi];
    });
  }, [apiDevices]);

  const apiDevicesById = useMemo(() => {
    const byId = new Map();
    apiDevices.forEach((dev) => {
      byId.set(dev.id, dev);
    });
    return byId;
  }, [apiDevices]);

  const equipmentOptions = useMemo(() => {
    const seenEquipment = new Set();
    const options = [];

    apiDevices.forEach((dev) => {
      const equipmentId = dev?.equipmentId || dev?.name || "";
      if (!equipmentId || seenEquipment.has(equipmentId)) return;
      seenEquipment.add(equipmentId);
      options.push({
        value: equipmentId,
        label: equipmentId,
      });
    });

    devices.forEach((table) => {
      const tableEq = table?.equipmentId || "";
      if (tableEq && !seenEquipment.has(tableEq)) {
        seenEquipment.add(tableEq);
        options.push({ value: tableEq, label: tableEq });
      }
      (table?.tags || []).forEach((tag) => {
        const tagEq = tag?.equipment || "";
        if (!tagEq || seenEquipment.has(tagEq)) return;
        seenEquipment.add(tagEq);
        options.push({ value: tagEq, label: tagEq });
      });
    });

    allTags.forEach((tag) => {
      const equipmentId = tag?.equipment_id || tag?.equipment || "";
      if (!equipmentId || seenEquipment.has(equipmentId)) return;
      seenEquipment.add(equipmentId);
      options.push({ value: equipmentId, label: equipmentId });
    });

    return options.sort((a, b) =>
      a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
    );
  }, [apiDevices, allTags]);

  const variablesByEquipment = useMemo(() => {
    const byEquipment = {};
    const toDisplayName = (value = "") => {
      const raw = String(value || "").trim();
      if (!raw) return "";
      return raw.includes("/") ? raw.split("/").pop() : raw;
    };
    const appendVar = (equipmentId, variable) => {
      if (!equipmentId || !variable?.variableName) return;
      if (!byEquipment[equipmentId]) byEquipment[equipmentId] = [];
      const exists = byEquipment[equipmentId].some(
        (v) =>
          (variable?.key && v.key === variable.key) ||
          (v.deviceId === variable.deviceId &&
            v.variableName === variable.variableName),
      );
      if (!exists) byEquipment[equipmentId].push(variable);
    };

    apiDevices.forEach((dev) => {
      const equipmentId = dev?.equipmentId || dev?.name || "";
      if (!equipmentId) return;
      (dev.tags || []).forEach((tag) => {
        const sourceName = tag?.name || tag?.variableName || "";
        const variableName = toDisplayName(sourceName);
        if (!variableName) return;
        appendVar(equipmentId, {
          key: `${dev.id}::${sourceName}`,
          deviceId: dev.id,
          equipmentId,
          variableName,
          datatype: tag?.datatype || "Float",
          endpoint: dev?.endpoint || "",
          nodeId: tag?.node_id || tag?.nodeId || tag?.nodeid || "",
          node_id: tag?.node_id || tag?.nodeId || tag?.nodeid || "",
          cdcTag:
            tag?.cdcTag || tag?.plcVariable || tag?.variable || sourceName,
          unit: tag?.unit || "",
          driver: dev?.driver || "",
          address: dev?.endpoint || "",
        });
      });
    });

    allTags.forEach((tag) => {
      const equipmentId = tag?.equipment_id || tag?.equipment || "";
      const variablePath = tag?.variable || "";
      const variableName = toDisplayName(variablePath);
      if (!equipmentId || !variableName) return;
      appendVar(equipmentId, {
        key: `rt::${equipmentId}::${variablePath}`,
        deviceId: `rt::${equipmentId}`,
        equipmentId,
        variableName,
        datatype: tag?.datatype || "Float",
        endpoint: tag?.source?.endpoint || "",
        nodeId: tag?.source?.node_id || tag?.source?.nodeid || "",
        node_id: tag?.source?.node_id || tag?.source?.nodeid || "",
        cdcTag: variablePath,
        unit: tag?.unit || "",
        driver: tag?.source?.driver || "",
        address: tag?.source?.endpoint || "",
      });
    });

    Object.keys(byEquipment).forEach((equipmentId) => {
      byEquipment[equipmentId].sort((a, b) =>
        a.variableName.localeCompare(b.variableName, "es", {
          sensitivity: "base",
        }),
      );
    });

    return byEquipment;
  }, [apiDevices, devices, allTags]);

  const updateCurrentTag = (tagId, updater) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === selectedId
          ? {
              ...d,
              tags: d.tags.map((t) => {
                if (t.id !== tagId) return t;
                return typeof updater === "function"
                  ? updater(t)
                  : { ...t, ...updater };
              }),
            }
          : d,
      ),
    );
    setHasUnsavedChanges(true);
  };

  const addDevice = () => {
    const nextIndex = devices.length + 1;
    const newDevice = {
      id: `dev-${Date.now()}`,
      name: `Tabla ${nextIndex}`,
      tags: [],
    };
    setDevices((prev) => [...prev, newDevice]);
    setSelectedId(newDevice.id);
    setHasUnsavedChanges(true);
  };

  const renameDevice = (id) => {
    const current = devices.find((d) => d.id === id);
    const nextName = window.prompt(
      "Nuevo nombre de tabla/PLC",
      current?.name || "",
    );
    if (!nextName) return;
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, name: nextName } : d)),
    );
    setHasUnsavedChanges(true);
  };

  const deleteDevice = (id) => {
    if (!window.confirm("¿Eliminar esta tabla/PLC y sus tags?")) return;
    setDevices((prev) => {
      const filtered = prev.filter((d) => d.id !== id);
      // Reasignar seleccion
      if (id === selectedId) {
        const next = filtered[0]?.id || null;
        setSelectedId(next);
      }
      return filtered;
    });
    setHasUnsavedChanges(true);
  };

  const addEmptyTag = () => {
    if (!selectedId) return;
    setDevices((prev) =>
      prev.map((d) =>
        d.id === selectedId
          ? {
              ...d,
              tags: [
                ...d.tags,
                {
                  id: `tmp-${Date.now()}`,
                  name: "NuevoTag",
                  sourceMode: "local",
                  type: "Float",
                  variableName: "",
                  deviceId: "",
                  equipment: "",
                  endpoint: "",
                  address: "",
                  nodeId: "",
                  node_id: "",
                  initialValue: "",
                  conn: "Local",
                  plcName: "",
                  unit: "",
                  notes: "",
                  plcVariable: "",
                  cdcTag: "",
                  bindingKey: "",
                },
              ],
            }
          : d,
      ),
    );
    setHasUnsavedChanges(true);
  };

  const removeCurrentTag = (tagId) => {
    if (!selectedId) return;
    setDevices((prev) =>
      prev.map((d) =>
        d.id === selectedId
          ? { ...d, tags: (d.tags || []).filter((t) => t.id !== tagId) }
          : d,
      ),
    );
    setSelectedTagId((prev) => (prev === tagId ? null : prev));
    setHasUnsavedChanges(true);
  };

  const handleCloseRequest = () => {
    if (hasUnsavedChanges) {
      const shouldClose = window.confirm(
        "Tienes cambios sin guardar. ¿Quieres cerrar sin guardar?",
      );
      if (!shouldClose) return;
    }
    onClose?.();
  };

  const handleSaveDevices = async () => {
    if (!selectedId) return;
    if (isSaving) return;

    setIsSaving(true);
    setSaveError("");

    try {
      const normalized = devices.map((table) => ({
        ...table,
        tags: (table.tags || []).map((tag) => {
          const isConnection =
            tag?.sourceMode === "conexion" ||
            !!(tag?.deviceId || tag?.equipment || tag?.variableName);
          if (!isConnection) return tag;
          const telemetryTopic =
            tag?.plcVariable || tag?.cdcTag || tag?.variableName || "";
          return {
            ...tag,
            sourceMode: "conexion",
            conn: "Conexion",
            cdcTag: telemetryTopic,
            plcVariable: telemetryTopic,
            variable: telemetryTopic,
            deviceTag: telemetryTopic,
            address: tag?.address || tag?.endpoint || "",
          };
        }),
      }));
      const selectedTable =
        normalized.find((table) => table.id === selectedId) || null;
      if (!selectedTable) {
        throw new Error("No hay tabla seleccionada para guardar.");
      }

      // 1) Aseguramos que exista el grupo (tabla) en backend.
      const clientId =
        authUser?.client?.id ||
        authUser?.client_id ||
        authUser?.clientId ||
        null;

      let backendGroupId = selectedTable.backendGroupId || null;
      if (!isNumericId(backendGroupId)) {
        const groupPayload = {
          name: selectedTable.name || "Tabla sin nombre",
        };
        if (isNumericId(clientId)) {
          groupPayload.client = Number(clientId);
        }

        const groupRes = await requestWithEndpointFallback(
          (endpoint) => ({
            method: "post",
            url: endpoint,
            data: groupPayload,
          }),
          CUSTOM_TAG_GROUPS_ENDPOINTS,
        );
        backendGroupId =
          groupRes?.data?.id ??
          groupRes?.data?.pk ??
          groupRes?.data?.group_id ??
          null;
      } else {
        backendGroupId = Number(backendGroupId);
      }

      if (!isNumericId(backendGroupId)) {
        throw new Error("No se pudo resolver el ID de la tabla en backend.");
      }

      // 2) Guardamos cada fila de tags como create/update.
      const tagsToPersist = (selectedTable.tags || []).filter((tag) => {
        const hasName = Boolean(String(tag?.name || "").trim());
        if (!hasName) return false;

        const isConnection =
          tag?.sourceMode === "conexion" || tag?.conn === "Conexion";
        if (isConnection) {
          const hasBinding = Boolean(
            tag?.cdcTag || tag?.plcVariable || tag?.variable,
          );
          return hasBinding;
        }
        // Variables locales tambien se persisten en base de datos.
        return true;
      });

      const persistedTags = await Promise.all(
        tagsToPersist.map(async (tag) => {
          const isConnection =
            tag?.sourceMode === "conexion" || tag?.conn === "Conexion";
          const localFallbackTag = `local/${selectedTable.id}/${tag?.name || "tag"}`;
          const payload = {
            tag_name: (tag?.name || "").trim(),
            group: Number(backendGroupId),
            equipment_id: (
              tag?.equipment ||
              selectedTable?.equipmentId ||
              selectedTable?.name ||
              `table:${selectedTable.id}`
            ).trim(),
            cdc_tag: (
              tag?.cdcTag ||
              tag?.plcVariable ||
              tag?.variable ||
              (!isConnection ? localFallbackTag : "")
            ).trim(),
            datatype: (tag?.type || tag?.datatype || "Float").trim(),
            unit: toNullable(tag?.unit),
            node_id: toNullable(tag?.node_id || tag?.nodeId),
          };

          const backendTagId = isNumericId(tag?.backendId)
            ? Number(tag.backendId)
            : null;
          const response = backendTagId
            ? await requestWithEndpointFallback(
                (endpoint) => ({
                  method: "patch",
                  url: `${endpoint}${backendTagId}/`,
                  data: payload,
                }),
                CUSTOM_TAGS_ENDPOINTS,
              )
            : await requestWithEndpointFallback(
                (endpoint) => ({
                  method: "post",
                  url: endpoint,
                  data: payload,
                }),
                CUSTOM_TAGS_ENDPOINTS,
              );

          const returnedId =
            response?.data?.id ??
            response?.data?.pk ??
            response?.data?.tag_id ??
            backendTagId;

          return {
            ...tag,
            ...payload,
            backendId: returnedId,
            id:
              tag?.id ||
              (returnedId ? String(returnedId) : `tmp-${Date.now()}`),
          };
        }),
      );

      const updatedDevices = normalized.map((table) =>
        table.id === selectedId
          ? {
              ...table,
              backendGroupId: Number(backendGroupId),
              tags: (table.tags || []).map((tag) => {
                const match = persistedTags.find((p) => p.id === tag.id);
                return match || tag;
              }),
            }
          : table,
      );

      setDevices(updatedDevices);
      setHasUnsavedChanges(false);

      // 3) Sincronizamos listeners del editor/canvas sin abrir nuevos sockets.
      window.dispatchEvent(
        new CustomEvent("scada:custom-tags-updated", {
          detail: {
            groupId: Number(backendGroupId),
            tableId: selectedId,
            updatedAt: Date.now(),
          },
        }),
      );

      window.alert("Guardado con exito en backend.");
      onClose?.();
    } catch (err) {
      const message =
        (err?.response ? extractApiErrorMessage(err) : err?.message) ||
        "No se pudo guardar.";
      setSaveError(message);
      window.alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="w-[1500px] h-[760px] max-w-[96vw] max-h-[94vh] bg-slate-50 rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Dispositivos
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDevices}
                disabled={isSaving}
                className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:border-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? "Cargando..." : "Guardar"}
              </button>
              <button
                onClick={addDevice}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:border-sky-400 hover:bg-slate-50"
              >
                + Nueva tabla/PLC
              </button>
              <button
                onClick={() => renameDevice(selectedId)}
                disabled={!selectedId}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:border-sky-400 hover:bg-slate-50 disabled:opacity-50"
              >
                Renombrar
              </button>
              <button
                onClick={() => deleteDevice(selectedId)}
                disabled={!selectedId}
                className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:border-rose-300 hover:bg-rose-100 disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </div>
          <button
            onClick={handleCloseRequest}
            className="text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100"
            aria-label="Cerrar"
          >
            X
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Panel izquierdo (arbol/lista) */}
          <div className="w-50 border-r border-slate-200 bg-white overflow-y-auto">
            <div className="px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-slate-500 border-b border-slate-100">
              Tablas / PLC
            </div>
            <ul className="divide-y divide-slate-100 text-sm">
              {devices.map((dev) => (
                <li
                  key={dev.id}
                  className={`px-3 py-2 cursor-pointer flex items-center gap-2 ${
                    dev.id === selectedId
                      ? "bg-sky-50 text-sky-800"
                      : "hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedId(dev.id)}
                >
                  <span className="text-slate-500">#</span>
                  <div className="flex-1">
                    <div className="font-semibold text-xs">{dev.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {dev.tags.length} tags
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {/* se eliminan acciones duplicadas de pie; ahora estan en el header */}
          </div>

          {/* Panel derecho (tabla de tags) */}
          <div className="flex-1 bg-white flex flex-col">
            <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {selected.name || "Selecciona un PLC"}
                </p>
                <p className="text-[11px] text-slate-500">
                  Tags configurados: {selected.tags?.length || 0}
                </p>
                {saveError ? (
                  <p className="text-[11px] text-rose-600 mt-1">{saveError}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={addEmptyTag}
                  className="rounded border border-sky-300 bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700 hover:border-sky-400"
                >
                  + Añadir tag
                </button>
                <button
                  onClick={() => removeCurrentTag(selectedTagId)}
                  disabled={!selectedTagId}
                  className="rounded border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-600 hover:border-rose-300 hover:bg-rose-100 disabled:opacity-50"
                >
                  Eliminar fila
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="min-w-full text-[12px]">
                <thead className="bg-slate-100 text-slate-600 uppercase tracking-[0.08em]">
                  <tr>
                    <th className="px-3 py-2 text-left w-48">Nombre</th>
                    <th className="px-3 py-2 text-left w-36">Local/Conexion</th>
                    <th className="px-3 py-2 text-left w-40">
                      Nombre variable
                    </th>
                    <th className="px-3 py-2 text-left w-28">
                      Tipo de variable
                    </th>
                    <th className="px-3 py-2 text-left w-44">Dispositivo</th>
                    <th className="px-3 py-2 text-left w-44">Direccion</th>
                    <th className="px-3 py-2 text-left w-44">Nodo</th>
                    <th className="px-3 py-2 text-left w-40">Valor inicial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selected.tags?.map((tag) => {
                    const mode =
                      tag.sourceMode ||
                      (tag.deviceId ||
                      tag.plcVariable ||
                      tag.address ||
                      tag.nodeId
                        ? "conexion"
                        : "local");
                    const isLocal = mode === "local";
                    const selectedEquipment =
                      tag.equipment ||
                      apiDevicesById.get(tag.deviceId)?.equipmentId ||
                      (typeof tag.deviceId === "string" &&
                      tag.deviceId.startsWith("rt::")
                        ? tag.deviceId.replace("rt::", "")
                        : "") ||
                      "";
                    const equipmentVariables =
                      variablesByEquipment[selectedEquipment] || [];
                    const selectedVariable =
                      equipmentVariables.find(
                        (opt) =>
                          opt.key ===
                          (tag.bindingKey ||
                            (tag.deviceId && tag.variableName
                              ? `${tag.deviceId}::${tag.variableName}`
                              : "")),
                      ) ||
                      equipmentVariables.find(
                        (opt) => opt.variableName === tag.variableName,
                      ) ||
                      null;
                    const displayAddress = tag.address || tag.endpoint || "";

                    return (
                      <tr
                        key={tag.id}
                        onClick={() => setSelectedTagId(tag.id)}
                        className={`cursor-pointer ${
                          selectedTagId === tag.id
                            ? "bg-sky-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-3 py-2 text-slate-800">
                          <input
                            className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-sky-400 focus:outline-none rounded px-1"
                            value={tag.name}
                            onChange={(e) =>
                              updateCurrentTag(tag.id, { name: e.target.value })
                            }
                          />
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          <select
                            className="w-full bg-transparent border border-slate-200 rounded px-1 text-[12px]"
                            value={mode}
                            onChange={(e) => {
                              const nextMode = e.target.value;
                              if (nextMode === "local") {
                                updateCurrentTag(tag.id, {
                                  sourceMode: "local",
                                  conn: "Local",
                                  variableName: "",
                                  deviceId: "",
                                  endpoint: "",
                                  address: "",
                                  nodeId: "",
                                  node_id: "",
                                  plcVariable: "",
                                  cdcTag: "",
                                  bindingKey: "",
                                  equipment: "",
                                  plcName: "",
                                  unit: "",
                                });
                                return;
                              }
                              updateCurrentTag(tag.id, {
                                sourceMode: "conexion",
                                conn: "Conexion",
                                initialValue: "",
                              });
                            }}
                          >
                            <option value="local">Local</option>
                            <option value="conexion">Conexion</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {isLocal ? (
                            <span className="text-slate-500">-</span>
                          ) : (
                            <select
                              className="w-full bg-transparent border border-slate-200 rounded px-1 text-[12px]"
                              value={selectedVariable?.key || ""}
                              disabled={!selectedEquipment}
                              onChange={(e) => {
                                const picked =
                                  equipmentVariables.find(
                                    (opt) => opt.key === e.target.value,
                                  ) || null;
                                updateCurrentTag(tag.id, {
                                  sourceMode: "conexion",
                                  conn: "Conexion",
                                  bindingKey: picked?.key || "",
                                  variableName: picked?.variableName || "",
                                  plcVariable: picked?.cdcTag || "",
                                  cdcTag: picked?.cdcTag || "",
                                  variable: picked?.cdcTag || "",
                                  deviceTag: picked?.cdcTag || "",
                                  deviceId:
                                    picked?.deviceId || tag.deviceId || "",
                                  equipment:
                                    picked?.equipmentId ||
                                    selectedEquipment ||
                                    "",
                                  plcName: picked?.driver || tag.plcName || "",
                                  type: picked?.datatype || tag.type || "Float",
                                  endpoint: picked?.endpoint || "",
                                  address: picked?.endpoint || "",
                                  nodeId: picked?.nodeId || "",
                                  node_id:
                                    picked?.node_id || picked?.nodeId || "",
                                  unit: picked?.unit || "",
                                  initialValue: "",
                                });
                              }}
                            >
                              <option value="">
                                {selectedEquipment
                                  ? equipmentVariables.length
                                    ? "Selecciona variable"
                                    : "Sin items"
                                  : "Selecciona dispositivo"}
                              </option>
                              {equipmentVariables.map((opt) => (
                                <option key={opt.key} value={opt.key}>
                                  {opt.variableName}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {isLocal ? (
                            <select
                              className="w-full bg-transparent border border-slate-200 rounded px-1 text-[12px]"
                              value={tag.type}
                              onChange={(e) =>
                                updateCurrentTag(tag.id, {
                                  type: e.target.value,
                                })
                              }
                            >
                              {["Float", "UInt32", "Int", "Bool", "String"].map(
                                (opt) => (
                                  <option key={opt}>{opt}</option>
                                ),
                              )}
                            </select>
                          ) : (
                            <span>{tag.type || "-"}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {isLocal ? (
                            <span className="text-slate-500">-</span>
                          ) : (
                            <select
                              className="w-full bg-transparent border border-slate-200 rounded px-1 text-[12px]"
                              value={selectedEquipment}
                              onChange={(e) => {
                                const nextEquipment = e.target.value;
                                const fallbackDevice =
                                  apiDevices.find(
                                    (dev) =>
                                      (dev.equipmentId || dev.name || "") ===
                                      nextEquipment,
                                  ) || null;
                                updateCurrentTag(tag.id, {
                                  sourceMode: "conexion",
                                  conn: "Conexion",
                                  equipment: nextEquipment,
                                  deviceId: fallbackDevice?.id || "",
                                  plcName: fallbackDevice?.driver || "",
                                  endpoint: fallbackDevice?.endpoint || "",
                                  address: fallbackDevice?.endpoint || "",
                                  variableName: "",
                                  plcVariable: "",
                                  cdcTag: "",
                                  variable: "",
                                  deviceTag: "",
                                  bindingKey: "",
                                  nodeId: "",
                                  node_id: "",
                                  unit: "",
                                  initialValue: "",
                                });
                              }}
                            >
                              <option value="">
                                {equipmentOptions.length
                                  ? "Selecciona dispositivo"
                                  : "Sin equipos API"}
                              </option>
                              {equipmentOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {isLocal ? (
                            <span className="text-slate-500">-</span>
                          ) : (
                            <span>{displayAddress || "-"}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {isLocal ? (
                            <span className="text-slate-500">-</span>
                          ) : (
                            <span>
                              {tag.node_id || tag.nodeId || tag.nodeid || "-"}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {isLocal ? (
                            <input
                              className="w-full bg-transparent border border-slate-200 rounded px-1"
                              placeholder="Valor inicial"
                              value={tag.initialValue ?? ""}
                              onChange={(e) =>
                                updateCurrentTag(tag.id, {
                                  initialValue: e.target.value,
                                })
                              }
                            />
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!selected.tags?.length && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-3 py-4 text-center text-slate-500"
                      >
                        No hay tags. Usa "+ Anadir tag".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceManagerModal;
