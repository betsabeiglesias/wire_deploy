# gateway/drivers/opcua.py
from __future__ import annotations
from pathlib import Path
import threading
import time
from typing import Any, Dict, List, Optional
import datetime
from opcua import Client, ua
from gateway.drivers.base_driver import BaseDriver

from contracts.validators import validate_mapping
from cryptography import x509
from cryptography.hazmat.backends import default_backend
import opcua
from domain.process_value import ProcessValue

# ---------- util ----------
def utc_iso(dt: Optional[datetime.datetime] = None) -> str:
    if dt is None:
        dt = datetime.datetime.now(datetime.timezone.utc)
    elif dt.tzinfo is None:
        dt = dt.replace(tzinfo=datetime.timezone.utc)
    return dt.isoformat().replace("+00:00", "Z")

def datatype_after_scale(datatype_in: str, scale: Optional[float]) -> str:
    if scale is None:
        return datatype_in
    if datatype_in in ("Int16","Int32","UInt16","UInt32"):
        try:
            return datatype_in if float(scale).is_integer() else "Float"
        except Exception:
            return "Float"
    return datatype_in

def quality_from_status(status: ua.StatusCode) -> str:
    return "GOOD" if status.is_good() else ("Uncertain" if status.is_uncertain() else "BAD")

def normalize_opcua_mapping(cfg: Dict[str, Any]) -> Dict[str, Any]:
    out: Dict[str, Any] = dict(cfg)
    conn = cfg.get("connection", {}) or {}
    if "endpoint" in conn:
        out["endpoint"] = conn["endpoint"]
    sec_mode = conn.get("security_mode")
    if sec_mode is not None:
        out["security_mode"] = sec_mode
    sec_pol = conn.get("security_policy")
    if sec_pol is not None:
        out["security_policy"] = sec_pol

    norm_items = []
    for it in cfg.get("items", []):
        addr = it.get("addressing", {}) or {}
        cdc  = it.get("cdc", {}) or {}
        norm_items.append({
            "nodeid":   addr.get("node_id") or addr.get("nodeid"),
            "variable": cdc.get("tag") or it.get("variable"),
            "datatype": it.get("datatype"),
            "unit":     cdc.get("unit"),
        })
    out["items"] = norm_items
    return out

def endpoint_uri(endpoint: str) -> str:
    return f"opcua://{endpoint}"

def cast_opcua_value(dv: ua.DataValue, datatype: str, scale: Optional[float]) -> Any:
    val = dv.Value.Value if dv.Value is not None else None

    # 🔧 FIX: Desempaquetar Variant anidado
    if hasattr(val, "Value"):
        val = val.Value

    def apply_scale(x):
        if scale is None or x is None:
            return x
        try:
            return float(x) * float(scale)
        except Exception:
            return x

    if val is None:
        return None

    if datatype == "Boolean":
        return bool(val)
    if datatype in ("Int16", "Int32", "UInt16", "UInt32"):
        return apply_scale(int(val))
    if datatype in ("Float", "Double"):
        return apply_scale(float(val))
    if datatype == "String":
        return str(val)
    if datatype == "Char":
        s = str(val)
        return s[0] if s else ""
    if datatype == "DateTime":
        dt = dv.SourceTimestamp or dv.ServerTimestamp or None
        if dt is None:
            dt = val if isinstance(val, datetime.datetime) else datetime.datetime.now(datetime.timezone.utc)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=datetime.timezone.utc)
        return dt.isoformat()
    return val




# --- helpers (ponlos a nivel de módulo) ---
def _status_is_good(st) -> bool:
    try:
        return bool(st.is_good())
    except Exception:
        return str(st).endswith("GOOD") if st is not None else False

def _normalize_create_results(results):
    """Devuelve (lista_de_resultados, es_lista_de_handles_int) para create_monitored_items."""
    # 1) lista directa
    if isinstance(results, list):
        if results and isinstance(results[0], int):
            return results, True
        return results, False

    # 2) tupla (results, diag)
    if isinstance(results, tuple) and results:
        return _normalize_create_results(results[0])

    # 3) objeto con Results/results
    for attr in ("Results", "results"):
        inner = getattr(results, attr, None)
        if inner is not None:
            if inner and isinstance(inner[0], int):
                return inner, True
            return inner, False

    # 4) un único resultado suelto
    if hasattr(results, "MonitoredItemId") or hasattr(results, "StatusCode"):
        return [results], False

    # 5) desconocido
    return [], False

def _result_ok_and_id(result_obj):
    """Devuelve (ok, id_o_handle) desde un resultado (objeto o int)."""
    if isinstance(result_obj, int):   # algunas builds devuelven handles
        return True, result_obj
    st  = getattr(result_obj, "StatusCode", None)
    mid = getattr(result_obj, "MonitoredItemId", None)
    return _status_is_good(st), mid



# ---------- driver ----------
class OPCUADriver(BaseDriver):
    def __init__(self, mapping_cfg: Dict[str, Any], publisher=None):
        super().__init__(mapping_cfg, publisher, driver_name="opcua")
        mapping_cfg = normalize_opcua_mapping(mapping_cfg)
        self.cfg = validate_mapping(mapping_cfg, apply_defaults=True)

        self._client: Optional[Client] = None
        self._subscription: Optional[ua.Subscription] = None
        self.endpoint = (
            self.cfg.get("endpoint")
            or (self.cfg.get("connection") or {}).get("endpoint")
        )

        self.publishing_interval_ms = int((self.cfg.get("subscription") or {}).get("publishing_interval_ms", 500))
        self.sampling_interval: int = int((self.cfg.get("subscription") or {}).get("sampling_interval_ms", 200))
        self.mode = "subscription"
        self._monitored_items: Dict[str, Any] = {}
        self._recreate_lock = threading.RLock()

        self._reconnecting = False
        self._last_reconnect_monotonic = 0.0
        self._last_successful_connect_monotonic = 0.0

        sub = self.cfg.get("subscription", {})
        self._supervisor_debounce_s = float(sub.get("debounce_ms", 5000)) / 1000.0

        pub_ms = self.publishing_interval_ms
        default_watchdog = max(10 * pub_ms + 500, 30000)  # 30s mínimo
        sub = self.cfg.get("subscription", {})
        self._watchdog_ms = int(sub.get("watchdog_ms", default_watchdog))

        

    # -------------------------------
    # Helper security
    # -------------------------------
    def _get_cert_uri(self) -> str:
        conn = self.cfg.get("connection", {}) or {}
        default_uri = "urn:gateway:predictivo"
        if conn.get("cert_uri"):
            return conn["cert_uri"]

        cert_name = conn.get("certificate")
        if not cert_name:
            return default_uri

        cert_file = (Path.cwd() / "configs" / "certificates" / cert_name).resolve()
        if not cert_file.exists():
            self.log.warning(f"Certificado no encontrado: {cert_file}")
            return default_uri

        try:
            cert_data = cert_file.read_bytes()
            cert = x509.load_der_x509_certificate(cert_data, default_backend())
            for ext in cert.extensions:
                if isinstance(ext.value, x509.SubjectAlternativeName):
                    uris = ext.value.get_values_for_type(x509.UniformResourceIdentifier)
                    if uris:
                        return uris[0]
        except Exception as e:
            self.log.warning(f"No se pudo extraer URI del certificado: {e}")
        return default_uri


    # -------------------------------
    # Helper subscription
    # -------------------------------
    def _create_subscription_with_revised(self) -> Optional[ua.Subscription]:
        """
        Intenta:
        1) Client.create_subscription(period, handler)
        2) UaClient.create_subscription(period, handler, publish_callback)
        3) UaClient.create_subscription(period, publish_callback) + inyectar handler
        Luego intenta ModifySubscription para Revised*.
        """
        self._sub_revised = (None, None, None)
        period = float(self.publishing_interval_ms)
        sub = None
        last_err = None

        # Intento 1: API alta
        try:
            sub = self._client.create_subscription(period, self)
        except Exception as e1:
            last_err = e1

        # Intento 2: pide publish_callback
        if sub is None:
            try:
                sub = self._client.uaclient.create_subscription(period, self, self._on_publish)
            except Exception as e2:
                last_err = e2

        # Intento 3: (period, publish_callback) y luego inyectar handler
        if sub is None:
            try:
                sub = self._client.uaclient.create_subscription(period, self._on_publish)
                try:
                    setattr(sub, "handler", self)
                except Exception:
                    pass
            except Exception as e3:
                last_err = e3

        if sub is None:
            raise RuntimeError(f"No se pudo crear la suscripción: {last_err!r}")

        # Asegurar publish_callback si existe setter
        try:
            set_pub_cb = getattr(self._client.uaclient, "set_publish_callback", None)
            if callable(set_pub_cb):
                set_pub_cb(self._on_publish)
        except Exception:
            pass

        # Revised*
        try:
            mp = ua.ModifySubscriptionParameters()
            mp.SubscriptionId = sub.subscription_id
            mp.RequestedPublishingInterval = period
            mp.RequestedMaxKeepAliveCount = 10
            mp.RequestedLifetimeCount = 60
            mp.MaxNotificationsPerPublish = 0
            res = self._client.uaclient.modify_subscription(mp)
            rv_pub  = getattr(res, "RevisedPublishingInterval", None)
            rv_keep = getattr(res, "RevisedMaxKeepAliveCount", None)
            rv_life = getattr(res, "RevisedLifetimeCount", None)
            self._sub_revised = (rv_pub, rv_keep, rv_life)
            self.log.info(f"Revised sub: pub={rv_pub} keep={rv_keep} life={rv_life}")

            if rv_pub:
                keep = rv_keep if (rv_keep and rv_keep > 0) else 10
                base = keep * float(rv_pub) + 500.0
                self._watchdog_ms = max(5000, min(60000, int(base)))
                self.log.info(f"Watchdog ajustado a {self._watchdog_ms} ms (revised pub={rv_pub}, keep={rv_keep})")
        except Exception as ex:
            self.log.debug(f"ModifySubscription no disponible: {ex!r}")

        return sub




    # -------------------------------
    # Ciclo de vida
    # -------------------------------
    def connect(self) -> None:
        assert self.endpoint, "No se ha encontrado 'endpoint' en el mapping"
        self.set_state("CONNECTING", connected=False)

        client = Client(self.endpoint)
        conn = self.cfg.get("connection", {}) or {}

        cert_uri = self._get_cert_uri()
        client.application_uri = cert_uri
        self.log.info(f"Usando Application URI: {cert_uri}")

        mode = conn.get("security_mode", "None")
        policy = conn.get("security_policy", "None")

        if mode != "None" and policy != "None":
            base_dir = (Path.cwd() / "configs" / "certificates").resolve()
            cert = conn.get("certificate")
            pkey = conn.get("private_key")
            cert_path = (base_dir / cert).resolve() if cert else None
            pkey_path = (base_dir / pkey).resolve() if pkey else None
            if cert_path and not cert_path.exists():
                self.log.warning(f"Certificado no encontrado: {cert_path}")
            if pkey_path and not pkey_path.exists():
                self.log.warning(f"Clave privada no encontrada: {pkey_path}")
            sec_str = f"{policy},{mode}"
            if cert_path and pkey_path:
                sec_str += f",{cert_path},{pkey_path}"
            self.log.info(f"Seguridad OPC UA activa: {sec_str}")
            client.set_security_string(sec_str)
        else:
            self.log.info("OPC UA sin seguridad (mode=None o policy=None)")

        try:
            client.connect()
            self._client = client
            self._last_successful_connect_monotonic = time.monotonic()
            self.set_state("DEGRADED", connected=True)
            print(f"[OK] Conectado a {self.endpoint}")
            self.log.info(f"Conectado a {self.endpoint}")
       
        except Exception as e:
            self.set_state("OFFLINE", err=e, connected=False)
            self.log.error(f"Fallo conectando a {self.endpoint}: {e!r}")

    def disconnect(self) -> None:
        c = self._client
        self._client = None
        try:
            if c is not None:
                if not hasattr(c, "_subscription"):
                    self.log.warning("freeopcua quirk: _subscription ausente en disconnect()")
                    try:
                        setattr(c, "_subscription", None)
                    except Exception:
                        pass
                try:
                    c.close_session()
                except Exception:
                    pass
                try:
                    c.disconnect()
                except AttributeError as ex:
                    self.log.warning(f"disconnect AttributeError (quirk): {ex!r}")
                    try:
                        proto = getattr(c, "uaclient", None) and c.uaclient.protocol
                        if proto and hasattr(proto, "close"):
                            proto.close()
                    except Exception:
                        pass
                except Exception as ex:
                    self.log.error(f"EN DISCONNECT Error al desconectar OPC UA: {ex}")
            self.log.info("Cliente OPC UA desconectado.")
        finally:
            self.connected = False

    def _clear_subscription(self) -> None:
        with self._recreate_lock:
            sub = self._subscription
            self._subscription = None
            self._monitored_items.clear()
        if sub is None:
            return
        try:
            sub.delete()
            self.log.debug("Suscripción OPC UA eliminada.")
        except Exception as ex:
            self.log.warning(f"No se pudo eliminar la suscripción existente: {ex!r}")

    def _should_supervise(self) -> bool:
        return bool(self.connected and self._subscription is not None and len(self._monitored_items) > 0)
    


    def _subscribe_item(self, nodeid: str) -> bool:
        assert self._subscription is not None, "No hay suscripción activa"
        node = self._client.get_node(nodeid)

        # Overrides por item
        item_cfg = next((it for it in self.items if (
            it.get("nodeid") or (it.get("addressing") or {}).get("node_id")
            or it.get("address") or it.get("node_id")
        ) == nodeid), {}) or {}

        sampling_ms = int((item_cfg.get("sampling_interval_ms")
                        or (self.cfg.get("subscription") or {}).get("sampling_interval_ms")
                        or self.sampling_interval))
        queue_size  = int(item_cfg.get("queue_size") or (self.cfg.get("subscription") or {}).get("queue_size", 10))

        # Deadband
        db_cfg = (item_cfg.get("deadband")
                or (self.cfg.get("deadband") if isinstance(self.cfg.get("deadband"), dict) else None)
                or ((self.cfg.get("cdc") or {}).get("deadband") if isinstance(self.cfg.get("cdc"), dict) else None))
        dcf = None
        if db_cfg and str(db_cfg.get("type", "none")).lower() != "none":
            dcf = ua.DataChangeFilter()
            dcf.Trigger = ua.DataChangeTrigger.StatusValue
            t = str(db_cfg.get("type")).lower()
            dcf.DeadbandType = ua.DeadbandType.Percent if t == "percent" else ua.DeadbandType.Absolute
            try:
                dcf.DeadbandValue = float(db_cfg.get("value", 0.0))
            except Exception:
                dcf.DeadbandValue = 0.0

        # API alta si está
        create_on_sub = getattr(self._subscription, "create_monitored_items", None)
        subscribe_dc  = getattr(self._subscription, "subscribe_data_change", None)

        if callable(create_on_sub):
            rvid = ua.ReadValueId()
            rvid.NodeId = node.nodeid
            rvid.AttributeId = ua.AttributeIds.Value

            params = ua.MonitoringParameters()
            params.ClientHandle = int(time.time() * 1000) & 0x7FFFFFFF
            params.SamplingInterval = float(sampling_ms)
            params.QueueSize = int(queue_size)
            params.DiscardOldest = True
            if dcf:
                params.Filter = dcf

            req = ua.MonitoredItemCreateRequest()
            req.ItemToMonitor = rvid
            req.MonitoringMode = ua.MonitoringMode.Reporting
            req.RequestedParameters = params

            # 1) firma con timestamps posicional
            try:
                results = create_on_sub([req], ua.TimestampsToReturn.Both)
            except TypeError:
                # 2) firma sin timestamps
                results = create_on_sub([req])

            results, are_handles = _normalize_create_results(results)
            if not results:
                raise RuntimeError("CreateMonitoredItems vacío/inesperado")

            ok, mid_or_handle = _result_ok_and_id(results[0])
            if ok and mid_or_handle is not None:
                self._monitored_items[nodeid] = mid_or_handle
                return True

            self.log.error(
                f"CreateMonitoredItems parse: ok={ok} item={results[0]!r} "
                f"(tipo={type(results[0]).__name__}) para {nodeid}"
            )
            return False

        # Fallback 2: subscribe_data_change (no respeta sampling/queue/deadband)
        if callable(subscribe_dc):
            handle = subscribe_dc(node)
            if handle is not None:
                self._monitored_items[nodeid] = handle
                return True
            self.log.warning(f"subscribe_data_change devolvió None para {nodeid}")
            # sigue al fallback 3

        # Fallback 3: API baja directa
        rvid = ua.ReadValueId()
        rvid.NodeId = node.nodeid
        rvid.AttributeId = ua.AttributeIds.Value

        params = ua.MonitoringParameters()
        params.ClientHandle = int(time.time() * 1000) & 0x7FFFFFFF
        params.SamplingInterval = float(sampling_ms)
        params.QueueSize = int(queue_size)
        params.DiscardOldest = True
        if dcf:
            params.Filter = dcf

        req = ua.MonitoredItemCreateRequest()
        req.ItemToMonitor = rvid
        req.MonitoringMode = ua.MonitoringMode.Reporting
        req.RequestedParameters = params

        cmp_ = ua.CreateMonitoredItemsParameters()
        cmp_.SubscriptionId = self._subscription.subscription_id
        cmp_.TimestampsToReturn = ua.TimestampsToReturn.Both
        cmp_.ItemsToCreate = [req]

        res = self._client.uaclient.create_monitored_items(cmp_)
        results, _ = _normalize_create_results(res)
        if not results:
            raise RuntimeError("CreateMonitoredItems vacío (uaclient)")

        ok, mid = _result_ok_and_id(results[0])
        if ok and mid is not None:
            self._monitored_items[nodeid] = mid
            # print(f"[OK] Suscrito a {nodeid} (mid={mid})")
            return True

        st = getattr(results[0], "StatusCode", None)
        self.log.error(f"CreateMonitoredItems(uaclient) StatusCode={st} mid={mid} para {nodeid}")
        return False



    # -------------------------------
    # Operación principal
    # -------------------------------
    def start(self) -> None:
        if self._client is None:
            self.set_state("OFFLINE", connected=False)
            self.log.info("Start: no hay cliente conectado. El supervisor intentará reconectar.")
            return
        
        self.log.info("Creando suscripción DataChange...")

        self._clear_subscription()
        if not self.items:
            self.log.warning("No hay items en el mapping; no se crea suscripción.")
            self.set_state("DEGRADED", connected=True)
            return

        try:
            self._subscription = self._create_subscription_with_revised()
            self.log.info("CREADA LA SUSCRIPCIÓN")
        except Exception as ex:
            self.log.error(f"Fallo creando la suscripción OPC UA: {ex!r}")
            self.set_state("DEGRADED", err=ex, connected=True)
            # 🔥 NO arrancar supervisor aquí - se arranca desde GatewayManager
            return

        ok = 0
        fail = 0
        for item in self.items:
            nodeid = (
                item.get("nodeid")
                or (item.get("addressing") or {}).get("node_id")
                or item.get("address")
                or item.get("node_id")
            )
            if not nodeid:
                fail += 1
                continue
            try:
                ok_item = self._subscribe_item(nodeid)
                if not ok_item:
                    raise RuntimeError(f"Estado no Good al suscribir {nodeid}")
                ok += 1
            except Exception as ex:
                self.log.error(f"No se pudo suscribir a {nodeid}: {ex!r}")
                fail += 1

        if ok == 0:
            self.set_state("DEGRADED", connected=True)
            self.log.warning("Suscripción creada pero 0 nodos suscritos correctamente.")
        elif fail == 0:
            self.set_state("ONLINE", connected=True)
            self.log.info(f"Suscripción activa. Nodos suscritos: {ok}.")
        else:
            self.set_state("DEGRADED", connected=True)
            self.log.warning(f"Suscripción parcial. OK={ok}, FAIL={fail}.")

    def stop(self) -> None:
        self.stop_supervisor()
        sub = self._subscription
        self._subscription = None
        if sub is not None:
            try:
                sub.delete()
                self.log.info("Suscripción cancelada correctamente.")
            except Exception as ex:
                self.log.debug(f"Al cancelar suscripción (ignorable): {ex!r}")

    # -------------------------------
    # Reconexiones
    # -------------------------------
    def _recreate_subscription(self) -> bool:
        """
        Intenta recrear la suscripción sin destruir la sesión.
        Devuelve True si la sesión sigue viva (aunque la sub falle).
        """
        try:
            with self._recreate_lock:
                if not self._should_supervise():
                    self.log.debug("Skip recreate_subscription(): sin conexión o sin items.")
                    return True

                self._clear_subscription()
                if self._client is None or not self.connected:
                    self.log.warning("Recreate subscription: cliente nulo o desconectado.")
                    return False
                
                try:
                    self._subscription = self._create_subscription_with_revised()
                except Exception as ex:
                    self.log.error(f"No se pudo crear la suscripción: {ex!r}")
                    # No destruimos la sesión, solo marcamos degradado
                    self.set_state("DEGRADED", err=ex, connected=True)
                    return True

                if self._subscription is None:
                    self.log.warning("Suscripción no creada (None).")
                    self.set_state("DEGRADED", connected=True)
                    return True

                rp, rk, rl = getattr(self, "_sub_revised", (None, None, None))
                if rp:
                    keep = rk if (rk and rk > 0) else 10
                    base = keep * float(rp) + 500.0
                    self._watchdog_ms = max(5000, min(60000, int(base)))
                    self.log.info(f"Watchdog ajustado a {self._watchdog_ms} ms (revised pub={rp}, keep={rk})")

                ok, fail = 0, 0
                for item in self.items:
                    nodeid = (
                        item.get("nodeid")
                        or (item.get("addressing") or {}).get("node_id")
                        or item.get("address")
                        or item.get("node_id")
                    )
                    if not nodeid:
                        fail += 1
                        continue
                    try:
                        if self._subscribe_item(nodeid):
                            ok += 1
                        else:
                            fail += 1
                            self.log.warning(f"Estado no Good al suscribir {nodeid}")
                    except Exception as ex:
                        fail += 1
                        self.log.error(f"No se pudo suscribir a {nodeid}: {ex!r}")

                if ok == 0 and fail > 0:
                    self.set_state("DEGRADED", connected=True)
                    self.log.warning("Suscripción recreada pero 0 nodos suscritos correctamente (sesión viva).")
                    return True

                if fail == 0:
                    self.set_state("ONLINE", connected=True)
                    self.log.info(f"Suscripción recreada. Nodos OK={ok}.")
                else:
                    self.set_state("DEGRADED", connected=True)
                    self.log.warning(f"Suscripción recreada parcialmente. OK={ok}, FAIL={fail}.")

                return True

        except Exception as ex:
            self.log.exception(f"Error recreando suscripción: {ex!r}")
            self.set_state("DEGRADED", err=ex, connected=True)
            return True




    def _recreate_session_once(self):
        with self._recreate_lock:
            try:
                if self._client is not None:
                    self.disconnect()
            except Exception:
                self.log.exception("Error en disconnect()")
            self._client = None
            self.connected = False
            self.connect()
            if self._client is None or not self.connected:
                raise RuntimeError("Sesión no establecida tras connect().")
            self.start()


    # -------------------------------
    # Callbacks
    # -------------------------------
    def datachange_notification(self, node, val, data):
        try:

            nodeid = node.nodeid.to_string()
            dv = data.monitored_item  # DataValue completo

            ts = dv.Value.SourceTimestamp or dv.Value.ServerTimestamp or datetime.datetime.now(datetime.timezone.utc)
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=datetime.timezone.utc)
            ts_iso = ts.isoformat().replace("+00:00", "Z")

         
            from urllib.parse import urlparse
            parsed_endpoint = urlparse(self.endpoint)
            plc_ip = parsed_endpoint.hostname  

            item = next(
                (it for it in self.items if (
                    it.get("nodeid")
                    or (it.get("addressing") or {}).get("node_id")
                    or it.get("address")
                    or it.get("node_id")
                ) == nodeid),
                None
            )
            if not item:
                return

            variable = item.get("variable") or (item.get("cdc") or {}).get("tag") or nodeid
            unit = (item.get("cdc") or {}).get("unit") or item.get("unit")
            datatype = item.get("datatype", "String")
            scale = (item.get("cdc") or {}).get("scale") or item.get("scale")

            quality = quality_from_status(dv.Value.StatusCode)
            value_norm = cast_opcua_value(dv, datatype, scale)
            datatype_out = datatype_after_scale(datatype, scale)

            # Política simple "on_change_only" (si la mapeas en cfg)
            if self.cfg.get("on_change_only"):
                last_vals = getattr(self, "_last_vals", {})
                if last_vals.get(nodeid) == value_norm:
                    return
                if not hasattr(self, "_last_vals"):
                    self._last_vals = {}
                self._last_vals[nodeid] = value_norm

            pv = ProcessValue(
                equipment_id=self.equipment_id,
                variable=variable,
                value=value_norm,
                datatype=datatype_out,
                unit=unit,
                timestamp=ts,
                quality=quality,
                source={
                    "protocol": "opcua",
                    "endpoint": self.endpoint,
                    "ip": plc_ip,
                    "nodeid": nodeid,
                    "status_code": str(dv.Value.StatusCode),  # Fix 1: requerido por normalize_quality
                    "attrs": dict(item.get("attrs") or {}),
                }
            )

            if not pv.validate():
                return

            self.emit_tag(pv)
        except Exception as ex:
            self.log.error(f"Error en callback DataChange: {ex}", exc_info=True)

    def status_change_notification(self, status):
        self._last_emit_ts = time.time()
        
    def event_notification(self, event):
        self._last_emit_ts = time.time()

    def _on_publish(self, publish_result):
        self._last_emit_ts = time.time()

    # -------------------------------
    # Supervisor
    # -------------------------------
    def _attempt_recovery(self, now_mono: float) -> None:
        if getattr(self, "_reconnecting", False):
            return
        self._reconnecting = True
        self._last_reconnect_monotonic = now_mono
        try:
            # 🔥 Si NO está conectado → recrear sesión completa
            if not self.connected or self._client is None:
                self.log.warning("Recovery: sin conexión → recrear sesión completa")
                try:
                    self._recreate_session_once()
                    self._last_emit_monotonic = time.monotonic()
                    self.log.info("✅ Sesión recreada exitosamente")
                except Exception as ex:
                    self.log.error(f"❌ Fallo recreando sesión: {ex!r}")
                return
            
            # 🔥 Si está conectado pero no recibe datos → recrear suscripción
            self.log.info("Recovery: intentando recrear suscripción...")
            ok = False
            try:
                ok = self._recreate_subscription()
            except Exception:
                self.log.exception("Fallo recreando suscripción")
                ok = False
            
            if ok:
                self._last_emit_monotonic = time.monotonic()
                self.set_state("ONLINE", connected=True)
                self.log.info("✅ Suscripción recreada exitosamente")
            else:
                self.log.warning(f"⚠️  Suscripción no se pudo recrear → próximo intento en {self._supervisor_debounce_s:.1f}s")
                
        finally:
            self._reconnecting = False

    def run_supervisor_step(self) -> None:
        now_mono = time.monotonic()

        # ----- 1) 🔥 Si NO está conectado → intentar reconectar (SIN SALIR) -----
        if not self.connected or self._client is None:
            # Debounce para no saturar intentos de reconexión
            if (now_mono - self._last_reconnect_monotonic) < self._reconnect_backoff:
                return  # Todavía no toca reintentar
            
            self.log.info(f"🔄 Intentando reconectar a {self.endpoint}...")
            self._last_reconnect_monotonic = now_mono
            
            try:
                ok = self.connect()
                if ok and self._client is not None:
                    self.log.info("✅ Reconexión exitosa, recreando suscripción...")
                    try:
                        self.start()  # Recrea la suscripción
                    except Exception as ex:
                        self.log.error(f"Error recreando suscripción tras reconexión: {ex!r}")
                else:
                    self.log.debug("❌ Reconexión falló, reintentando más tarde...")
            except Exception as ex:
                self.log.debug(f"❌ Error en reconexión: {ex!r}")
            
            return  # Salir para próximo ciclo

        # ----- 2) Si está "CONNECTING", esperar -----
        if self.state == "CONNECTING":
            return

        # ----- 3) 🔥 PERÍODO DE GRACIA: Esperar 3s después de conectar -----
        grace_period_sec = 3.0
        time_since_connect = now_mono - self._last_successful_connect_monotonic
        if time_since_connect < grace_period_sec:
            # Recién conectado, darle tiempo a estabilizarse
            return

        # ----- 4) Debounce para no saturar recovery -----
        if getattr(self, "_reconnecting", False):
            return
        if (now_mono - getattr(self, "_last_reconnect_monotonic", 0.0)) < getattr(self, "_supervisor_debounce_s", 5.0):
            return

        # ----- 5) Healthcheck de sesión -----
        try:
            if not self._healthcheck():
                raise RuntimeError("healthcheck failed")
        except Exception as ex:
            self.log.warning(f"⚠️  Supervisor OPC UA: sesión caída → {ex!r}")
            self.set_state("OFFLINE", err=ex, connected=False)
            self._attempt_recovery(now_mono)
            return
        
        # ----- 6) Healthcheck de silencio (sin datos) -----
        age_sec = self.last_emit_age_sec()
        if age_sec is not None:
            pub_ms = int(getattr(self, "publishing_interval_ms", 500))
            watchdog_ms = getattr(self, "_watchdog_ms", max(10 * pub_ms + 500, 6000))
            silence_ms = age_sec * 1000.0
            if silence_ms > watchdog_ms:
                self.log.warning(
                    f"⚠️  Supervisor OPC UA: sin datos durante {silence_ms:.0f} ms > {watchdog_ms} ms → recovery."
                )
                self.set_state("DEGRADED", connected=True)
                self._attempt_recovery(now_mono)
                return

        # ----- 7) Todo OK -----
        if self.state != "ONLINE":
            self.set_state("ONLINE", connected=True)

    def _healthcheck(self) -> bool:
        """Verifica que la sesión OPC UA está viva."""
        # Si no hay cliente, salud = False
        if self._client is None:
            return False

        # Si no hay sesión abierta en freeopcua
        sess = getattr(self._client.uaclient, "session", None)
        if sess is None:
            return False
        
        # Si el socket está cerrado
        proto = getattr(self._client.uaclient, "protocol", None)
        if proto is None or not getattr(proto, "connected", False):
            return False

        # Intentar leer un nodo estándar para confirmar conectividad
        try:
            node = self._client.get_node(ua.NodeId(ua.ObjectIds.Server_ServerStatus_CurrentTime))
            node.get_value()
            return True
        except Exception:
            return False
        
    def get_health(self) -> dict:
        health = super().get_health()
        health["consec_fail"] = getattr(self, "_consec_fail", None)
        return health


    def _watchdog(self):
        while True:
            time.sleep(5)
            for driver in self._drivers.values():
                try:
                    health = driver.get_health()
                    equip = health.get("equipment_id", "unknown")
                    age = health.get("last_emit_age_sec", None)
                    if age is not None and age > 10:
                        self.log.warning(f"[Watchdog] {equip}: sin datos desde hace {age:.1f}s.")
                except Exception as ex:
                    self.log.error(f"[Watchdog] Error al consultar estado de {equip}: {ex}")