import datetime
import struct
import threading
import time
from typing import Any, Dict, List, Optional
import snap7
from snap7.util import get_bool, get_int, get_dint, get_real, get_word, get_dword, get_byte

from contracts.validators.validate_tag import validate_mapping
from gateway.drivers.base_driver import BaseDriver
from domain.process_value import ProcessValue

# -----------------------------
# Parsing de direcciones S7
# Soporta: DB1.DBX0.0 | DB1.DBB10 | DB1.DBW8 | DB1.DBD4
# Devuelve (db, kind, byte_idx, bit_idx, width_bytes)
# kind ∈ {"X","B","W","D"} (bit, byte, word, dword)
# -----------------------------
def parse_s7_address(addr: str):
    s = addr.strip().upper()
    if not s.startswith("DB"):
        raise ValueError(f"Dirección S7 inválida: '{addr}' (debe empezar por DB)")
    try:
        left, right = addr.upper().split(".", 1)     # "DB1" , "DBX0.0"
        db = int(left[2:])
    except Exception:
        raise ValueError(f"Dirección S7 inválida: '{addr}' (DBn mal formado)")

    if not right.startswith("DB") or len(right) < 4:
        raise ValueError(f"Dirección S7 inválida: '{addr}' (se esperaba DBX/DBB/DBW/DBD)")
    kind = right[2]                               # X, B, W o D
    rest = right[3:]                              # "0.0" | "10" | "8" | "4"
    bit = None
    try:
        if kind == "X":
            byte_s, bit_s = rest.split(".")
            byte = int(byte_s); 
            bit = int(bit_s); 
            width = 1
        elif kind == "B":
            byte = int(rest); width = 1
        elif kind == "W":
            byte = int(rest); width = 2
        elif kind == "D":
            byte = int(rest); width = 4
        else:
            raise ValueError(f"Tipo no soportado en dirección: {addr}")
    except Exception as e:
        raise ValueError(f"Dirección S7 inválida: {addr} ({e})")
    
    return db, kind, byte, bit, width

# -----------------------------
# Casting S7 → CDC datatype
# -----------------------------
def utcnow_iso():
    return datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc).isoformat().replace("+00:00", "Z")


def cast_value(buf: bytes, kind: str, byte: int, bit: int | None, datatype: str, scale: float | None):
    def apply_scale(x):
            if scale is None:
                return x
            try:
                return float(x) * float(scale)
            except Exception:
                return x

    if datatype == "Boolean":
        if kind != "X" or bit is None:
            raise ValueError("Boolean requiere DBXbyte.bit (kind X)")
        return get_bool(buf, byte, bit)

    if datatype == "Int16":
        return apply_scale(get_int(buf, byte))

    if datatype == "Int32":
        return apply_scale(get_dint(buf, byte))

    if datatype == "UInt16":
        return apply_scale(get_word(buf, byte))

    if datatype == "UInt32":
        return apply_scale(get_dword(buf, byte))

    if datatype == "Float":
        if kind != "D":
            raise ValueError("Float (REAL) requiere DBD (4 bytes)")
        return apply_scale(get_real(buf, byte))

    if datatype == "Double":
        if len(buf) < byte + 8:
            raise ValueError("Buffer insuficiente para Double (8 bytes requeridos)")
        return apply_scale(struct.unpack_from(">d", buf, byte)[0])

    if datatype == "Char":
        b = get_byte(buf, byte)
        return chr(b) if 32 <= b <= 126 else f"\\x{b:02x}"

    if datatype == "String":
        # ¿¿¿NECESARIO???
        # Para strings S7 nativos necesitarías leer la longitud declarada;
        # aquí se omite por simplicidad (caso poco común para proceso).
        raise NotImplementedError("String no implementado en este probe")
    
    if datatype == "DateTime":
        # Ejemplo genérico: epoch segundos (UInt32/UInt64)
        if len(buf) >= byte + 8:
            epoch = struct.unpack_from(">Q", buf, byte)[0]
        elif len(buf) >= byte + 4:
            epoch = struct.unpack_from(">I", buf, byte)[0]
        else:
            raise ValueError("Buffer insuficiente para DateTime (4 u 8 bytes)")
        return datetime.datetime.fromtimestamp(epoch, tz=datetime.timezone.utc) \
                .isoformat().replace("+00:00", "Z")

    raise ValueError(f"Datatype CDC no soportado: {datatype}")


def build_tag(equipment_id, item, value, endpoint, quality="Good",
              error: str | None = None, datatype_out: str | None = None):

    from urllib.parse import urlparse
    parsed = urlparse(endpoint)
    plc_ip = parsed.hostname

    attrs = dict(item.get("attrs", {}) or {})
    if error:
        attrs["error"] = error

    ts = datetime.datetime.now(datetime.timezone.utc)

    pv = ProcessValue(
        equipment_id=equipment_id,
        variable=item["name"],
        value=value,
        datatype=datatype_out or item["datatype"],
        unit=item.get("unit"),
        timestamp=ts,
        quality=quality,
        source={
            "protocol": "snap7",
            "endpoint": endpoint,
            "ip": plc_ip,
            "address": item["address"],
            "attrs": attrs,
        }
    )

    return pv


def endpoint_uri(ip, rack, slot):
    return f"snap7://{ip}/{rack}/{slot}"

def group_items_by_db(items):
    groups = {}
    for idx, it in enumerate(items):
        db, kind, byte, bit, width = parse_s7_address(it["address"])
        end_byte = byte + (1 if kind == "X" else {"B": 1, "W": 2, "D": 4}[kind])
        g = groups.setdefault(db, [])
        g.append({
            **it,
            "_parsed": (db, kind, byte, bit, width),
            "_start": byte,
            "_end": end_byte,
            "_idx": idx,
        })
    return groups

def compute_read_span(db_items):
    if not db_items:
        return 0, 0
    min_start = min(x["_start"] for x in db_items)
    max_end   = max(x["_end"]   for x in db_items)
    size = max_end - min_start
    return min_start, size


class S7Driver(BaseDriver):
    """
    Driver S7 (Snap7) por polling:
      - valida mapping (aplica defaults)
      - conecta (ip/rack/slot)
      - agrupa items por DB y lee spans compactos
      - castea valores y emite CDC tags
    """
    def __init__(self, mapping_cfg: Dict[str, Any], publisher=None) -> None:
        super().__init__(mapping_cfg, publisher, driver_name="snap7" )
        self.cfg = validate_mapping(mapping_cfg, apply_defaults=True)

        conn = self.cfg["connection"]
        self.ip: str = conn["ip"]
        self.rack: int = int(conn["rack"])
        self.slot: int = int(conn["slot"])
        self.timeout_ms: int = int(conn.get("timeout_ms", 2000))
        self.pdu_size: int = int(conn.get("pdu_size", 960))

        # Configuración general
        self.equipment_id: str = self.cfg["equipment_id"]
        self.items: List[Dict[str, Any]] = self.cfg.get("items", [])
        self.poll_ms: int = self.cfg.get("poll_ms", 1000)

        self.mode = "polling"
        self._client = None
        self._thread: Optional[threading.Thread] = None
        self._poll_thread = None
        self._consec_fail = 0
        self._min_ok_span_sec = 2.0
        
        self._last_emit_ts = None  # 🔥 Inicializar como None
        self._stop_event = threading.Event()

        self.timeout_sec = self.cfg.get("timeouts_sec", {}).get("no_emit", 10.0)


    # --- helpers internos ---
    def _poll_loop_alive(self) -> bool:
        return bool(self._poll_thread and self._poll_thread.is_alive())
    
    def _start_poll_loop(self) -> None:
        if self._poll_loop_alive():
            return
        self._stop_event.clear()

        def _loop():
            while not self._stop_event.is_set():
                try:
                    tags = self.read_once(endpoint=f"snap7://{self.ip}/{self.rack}/{self.slot}")
                    for tag in tags:
                        self.emit_tag(tag)
                    self._last_emit_ts = time.time()                  
                    self._consec_fail = 0
                    time.sleep(self.poll_ms / 1000.0)
                except Exception as ex:
                    # si algo falla, lo registramos y seguimos(sin matar el hilo)
                    self._consec_fail += 1
                    self.log.warning(f"Polling S7 falló (#{self._consec_fail}): {ex!r}")
                    time.sleep(min(1.0, self.poll_ms / 1000.0))

        self._poll_thread = threading.Thread(
            target=_loop,  name=f"snap7-poll-{self.equipment_id}", daemon=True
        )
        self._poll_thread.start()
    
    # ---------------------------
    # Ciclo de vida
    # ---------------------------
    def connect(self) -> None:
        """Establece conexión Snap7 con el PLC."""
        self.log.info(f"Conectando a S7 {self.ip} rack={self.rack} slot={self.slot} ...")
        cli = snap7.client.Client()

        # Opcional: timeouts (no todos los bindings los exponen; si no, omite)
        # try:
        #     cli.set_connection_timeout(self.timeout_ms)
        # except Exception:
        #     pass  # algunos entornos no exponen este ajuste

        # Conectar
        cli.connect(self.ip, self.rack, self.slot)
        if not cli.get_connected():
            raise RuntimeError("No se pudo establecer conexión con el PLC.")

        self._client = cli
        self.connected = True
        self.log.info("Conectado a PLC S7.")

    def disconnect(self) -> None:
        """Cierra la conexión Snap7."""
        if not self._client:
            return
        try:
            if self._client.get_connected():
                self._client.disconnect()
            # opcional: self._client.destroy() (en algunos entornos)
        except Exception as ex:
            self.log.error(f"Error al desconectar Snap7: {ex}")
        finally:
            self._client = None
            self.connected = False
            self.log.info("Cliente S7 desconectado.")

    def start(self) -> None:
        """Arranca el loop de polling en un hilo."""
        assert self._client is not None and self.connected, "S7 no conectado"
        if self._thread and self._thread.is_alive():
            self.log.warning("Snap7Driver ya está ejecutándose.")
            return

        self._stop_event.clear()
        self._thread = threading.Thread(target=self._poll_loop, name=f"snap7-poll-{self.equipment_id}", daemon=True)
        self._thread.start()
        self.log.info("Polling S7 iniciado.")

    def stop(self) -> None:
        """Detiene el loop de polling y espera finalización."""
        self._stop_event.set()
        if self._poll_thread and self._poll_thread.is_alive():
            self._thread.join(timeout=5.0)
        self._thread = None
        self.log.info("Polling S7 detenido.")

    def reconnect(self) -> None:
        """Reconecta al PLC después de un fallo."""
        self.log.info("Reconectando a PLC S7...")
        try:
            # Detener polling si está activo
            if self._poll_thread and self._poll_thread.is_alive():
                self._stop_event.set()
                self._poll_thread.join(timeout=2.0)
            
            # Desconectar
            self.disconnect()
            
            # Esperar un poco antes de reconectar
            time.sleep(1.0)
            
            # Reconectar
            self.connect()
            
            # Reiniciar polling
            self._start_poll_loop()
            
            self.log.info("Reconexión exitosa")
        except Exception as ex:
            # Limpiar mensaje Snap7 (bytes → str)
            msg = ex.args[0].decode(errors="ignore") if ex.args and isinstance(ex.args[0], bytes) else str(ex)
            self.log.warning("PLC S7 no disponible: %s", msg)


    def run_supervisor_step(self) -> None:
        """Supervisa el estado del driver y reconecta si es necesario."""
        try:
            # Verificar si el polling está vivo
            if not self._poll_loop_alive():
                self.log.warning("Polling S7 no está vivo — intentando reiniciar...")
                self.reconnect()
                return
            
            # Verificar si ha pasado mucho tiempo sin datos
            age = self.last_emit_age_sec()
            if age > self.timeout_sec:
                self.log.warning(f"Sin datos desde hace {age:.1f}s — reconectando S7...")
                self.reconnect()
                
        except Exception as ex:
            msg = ex.args[0].decode(errors="ignore") if ex.args and isinstance(ex.args[0], bytes) else str(ex)
            self.log.warning("Supervisor S7 error: %s", msg)

    # ---------------------------
    # Operación
    # ---------------------------
    def _poll_loop(self) -> None:
        """Bucle cíclico: lee todos los items y emite tags."""
        endpoint = endpoint_uri(self.ip, self.rack, self.slot)

        while not self._stop_event.is_set():
            try:
                tags = self.read_once(endpoint)
                for tag in tags:
                    self.emit_tag(tag)
            except Exception as ex:
                # No tumbes el hilo por un error puntual: log y sigue
                self.log.error(f"Error en ciclo de polling: {ex}", exc_info=True)

            # dormir el periodo configurado
            time.sleep(max(0.01, self.poll_ms / 1000.0))

    def read_once(self, endpoint: str) -> List[Dict[str, Any]]:
        """
        Lee una vez todos los items configurados, agrupando por DB para minimizar lecturas.
        Devuelve una lista de CDC tags (Good/Bad según resultado).
        """
        assert self._client is not None, "S7 no conectado"
        client = self._client

        groups = group_items_by_db(self.items)
        out_tags: List[Dict[str, Any]] = []

        for db, db_items in groups.items():
            try:
                start, size = compute_read_span(db_items)
                if size <= 0:
                    continue  # nada que leer
                buf: bytes = client.db_read(db, start, size)

                # Para cada item del DB, extraer su trozo y castear
                for it in db_items:
                    db_parsed = it["_parsed"]   # (db, kind, byte, bit, width)
                    _, kind, byte, bit, _ = db_parsed

                    # offset relativo dentro del buffer leído
                    rel_off = byte - start
                    # Por si acaso: validar que el slice cabe
                    if rel_off < 0 or rel_off >= len(buf):
                        raise ValueError(f"Offset fuera de rango para {it['address']}")

                    # Castear y escalar valor
                    value = cast_value(
                        buf=buf,
                        kind=kind,
                        byte=rel_off,
                        bit=bit,
                        datatype=it["datatype"],
                        scale=it.get("scale"),
                    )

                    tag = build_tag(
                        equipment_id=self.equipment_id,
                        item=it,
                        value=value,
                        endpoint=endpoint,
                        quality="Good",
                    )
                    out_tags.append(tag)

            except Exception as ex:
                # Si falla la lectura del bloque DB completo, marca todos los items de ese DB como Bad
                now_iso = datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc).isoformat().replace("+00:00", "Z")
                for it in db_items:
                    bad_tag = build_tag(
                        equipment_id=self.equipment_id,
                        item=it,
                        value=None,
                        endpoint=endpoint,
                        quality="Bad",
                        error=str(ex),
                    )
                    # Sobrescribe timestamp para coherencia (opcional)
                    bad_tag["timestamp"] = now_iso
                    out_tags.append(bad_tag)

        return out_tags