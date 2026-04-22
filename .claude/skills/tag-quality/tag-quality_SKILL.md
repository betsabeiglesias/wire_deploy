---
name: tag-quality
description: Modelo de calidad del dato para drivers y backend de Wire. Usar cuando el usuario pida implementar, modificar o depurar un driver (Snap7, Modbus TCP, OPC UA), la lógica de publicación MQTT de tags, el edge API, o cualquier componente que evalúe o propague el estado de un tag. Define los campos obligatorios, las funciones de mapeo de error por protocolo, y las reglas de escritura a base de datos.
---

# Tag Quality — Convenciones de implementación

Especificación completa en `docs/architecture/tag_quality_model.md`. Este skill resume las reglas operativas para implementación directa.

---

## Campos obligatorios en cada publicación MQTT de tag

Todo mensaje publicado por un driver debe incluir exactamente estos campos:

```python
{
    "tag_id":            str,   # path completo ISA-95
    "value":             float | None,  # None si quality != "GOOD"
    "quality":           str,   # "GOOD" | "UNCERTAIN" | "BAD"
    "connection_status": str,   # "UP" | "DEGRADED" | "DOWN" | "UNKNOWN"
    "data_status":       str,   # "OK" | "TIMEOUT" | "STALE" | "NONE" | "UNKNOWN"
    "quality_detail":    dict | None,  # contexto del error, None si GOOD
    "timestamp":         str,   # ISO 8601 UTC
    "latency_ms":        int | None,
    "source":            str,   # id del driver
    "plc_id":            str,
}
```

**Regla crítica:** cuando `quality != "GOOD"`, `value` es siempre `None`. Sin excepciones.

---

## Función de evaluación de calidad

```python
def compute_quality(connection_status: str, data_status: str, value) -> str:
    if connection_status in ("DOWN", "UNKNOWN"):
        return "BAD"
    if data_status == "TIMEOUT":
        return "BAD"
    if value is None or (isinstance(value, float) and (value != value)):  # NaN check
        return "BAD"
    if data_status == "STALE":
        return "UNCERTAIN"
    if data_status == "UNKNOWN":
        return "UNCERTAIN"
    if connection_status == "DEGRADED":
        return "UNCERTAIN"
    return "GOOD"
```

---

## Mapeo de errores por protocolo

### Snap7

```python
# Errores de conexión → connection_status: DOWN, quality: BAD
SNAP7_CONN_ERRORS = {0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x09}

# Errores de lectura de socket → connection_status: UP, data_status: TIMEOUT, quality: BAD
SNAP7_READ_ERRORS = {0x0A, 0x0B, 0x0C, 0x0D, 0x0E}

# Errores de ítem (dentro de la respuesta del PLC) → UP, quality: BAD
# 0x0A dirección inválida, 0x05 fuera de rango, 0x03 acceso denegado
SNAP7_ITEM_ERRORS = {0x0A, 0x05, 0x03, 0x06, 0x07}

SNAP7_ERROR_REASONS = {
    0x03: "s7_tcp_connection",
    0x06: "s7_connection_refused",
    0x07: "s7_connection_timeout",
    0x09: "s7_not_connected",
    0x0C: "s7_peer_timeout",
    0x0A: "s7_item_not_found",      # como item error
    0x05: "s7_address_out_of_range",
}

def snap7_to_quality(error_code: int, is_item_error: bool = False):
    reason = SNAP7_ERROR_REASONS.get(error_code, f"s7_error_{hex(error_code)}")
    if is_item_error:
        return "BAD", "UP", "OK", reason
    if error_code in SNAP7_CONN_ERRORS:
        return "BAD", "DOWN", "NONE", reason
    if error_code in SNAP7_READ_ERRORS:
        return "BAD", "UP", "TIMEOUT", reason
    return "GOOD", "UP", "OK", None
```

### Modbus TCP

```python
from pymodbus.exceptions import ConnectionException, ModbusIOException

MODBUS_EXCEPTION_REASONS = {
    0x01: "modbus_illegal_function",
    0x02: "modbus_illegal_address",
    0x03: "modbus_illegal_value",
    0x04: "modbus_device_failure",
    0x05: "modbus_processing",       # reintentar antes de emitir BAD
    0x06: "modbus_busy",             # reintentar antes de emitir BAD
    0x0A: "modbus_gateway_unavailable",
    0x0B: "modbus_gateway_target_failed",
}

def modbus_to_quality(response_or_exception):
    if isinstance(response_or_exception, ConnectionException):
        return "BAD", "DOWN", "NONE", "modbus_connection_refused"
    if isinstance(response_or_exception, ModbusIOException):
        return "BAD", "UP", "TIMEOUT", "modbus_response_timeout"
    if hasattr(response_or_exception, "isError") and response_or_exception.isError():
        code = response_or_exception.exception_code
        reason = MODBUS_EXCEPTION_REASONS.get(code, f"modbus_exception_{hex(code)}")
        return "BAD", "UP", "OK", reason
    return "GOOD", "UP", "OK", None
```

> **Nota:** exception codes `0x05` y `0x06` no son fallos permanentes. El driver debe reintentar N veces antes de emitir `BAD`.

### OPC UA (asyncua)

```python
from asyncua import ua

def opcua_to_quality(data_value):
    code = data_value.StatusCode.value
    severity = (code >> 30) & 0x03  # bits 31-30

    if severity == 0:  # Good
        if code == 0x00000080:  # GoodLocalOverride → UNCERTAIN en Wire
            return "UNCERTAIN", "UP", "OK", "opcua_local_override"
        return "GOOD", "UP", "OK", None

    if severity == 1:  # Uncertain
        return "UNCERTAIN", "UP", "OK", f"opcua_{hex(code)}"

    # Bad (severity 2 o 3)
    conn_errors = {0x80340000, 0x80480000}  # BadNoCommunication, BadNotConnected
    conn_status = "DOWN" if code in conn_errors else "UP"
    data_st = "NONE" if conn_status == "DOWN" else "OK"
    return "BAD", conn_status, data_st, f"opcua_{hex(code)}"
```

---

## Detección de DEGRADED

```python
DEGRADED_WINDOW    = 10    # ciclos a evaluar
DEGRADED_FAIL_RATIO = 0.2  # >20% fallos activa DEGRADED
LATENCY_WARN_MS    = 500

def evaluate_connection_status(failed_cycles: list, latencies: list) -> str:
    window = failed_cycles[-DEGRADED_WINDOW:]
    fail_ratio = sum(window) / len(window) if window else 0
    avg_latency = sum(latencies[-DEGRADED_WINDOW:]) / len(latencies[-DEGRADED_WINDOW:]) if latencies else 0
    if fail_ratio > DEGRADED_FAIL_RATIO or avg_latency > LATENCY_WARN_MS:
        return "DEGRADED"
    return "UP"
```

---

## Heartbeat del driver

Publicar cada 10 segundos en `wire/{client_id}/driver/{driver_id}/heartbeat`:

```python
heartbeat_payload = {
    "driver_id": driver_id,
    "status": "running",
    "plcs_connected": [...],
    "plcs_degraded": [...],
    "plcs_disconnected": [...],
    "timestamp": datetime.utcnow().isoformat() + "Z"
}
```

El edge API marca `connection_status: UNKNOWN` y `quality: BAD` para todos los tags del driver si no recibe heartbeat en **30 segundos**.

---

## Reglas de escritura a base de datos

| Tabla | Cuándo escribir |
|-------|----------------|
| `tag_realtime` | En cada publicación MQTT, siempre (upsert por `tag_id`) |
| `tag_history` | Solo cuando `quality == "GOOD"` |
| `tag_quality_events` | Solo en transiciones de calidad (`GOOD→BAD`, `BAD→GOOD`, etc.) |

---

## Umbrales configurables (por tag o por driver)

| Parámetro | Default | Descripción |
|-----------|---------|-------------|
| `stale_threshold_s` | 10 | Segundos sin actualización → `STALE` |
| `poll_timeout_ms` | 3000 | Timeout por ciclo de lectura |
| `latency_warn_ms` | 500 | Latencia media que activa `DEGRADED` |
| `heartbeat_interval_s` | 10 | Frecuencia de publicación de heartbeat |
| `heartbeat_timeout_s` | 30 | Ausencia de heartbeat → `BAD_DRIVER` |
| `modbus_retry_count` | 3 | Reintentos para exception codes `0x05`/`0x06` |
