# Modelo de Calidad de Datos y Estado de Comunicación
**Proyecto:** Wire SCADA Platform  
**Documento:** Especificación técnica — Tag Quality Model  
**Versión:** 1.1  
**Estado:** Aprobado

> Documento de referencia. Las convenciones de implementación están en `.claude/skills/tag-quality/SKILL.md`.

---

## 1. Objetivo

Definir un modelo estándar para evaluar y representar:

- Estado de conectividad con dispositivos (PLC, OPC UA, Modbus, etc.)
- Flujo de datos en tiempo real a través del pipeline completo
- Calidad de los valores adquiridos
- Estado global del sistema de adquisición

Este modelo permite representación coherente en la UI SCADA, diagnóstico rápido de fallos por capa, y separación explícita entre problemas de dispositivo, red y sistema interno.

---

## 2. Principios de diseño

### 2.1 Separación de responsabilidades

El sistema distingue tres dimensiones independientes:

| Dimensión | Campo | Descripción |
|-----------|-------|-------------|
| Conectividad | `connection_status` | Estado de la sesión física/lógica con el dispositivo |
| Flujo de datos | `data_status` | Capacidad de recibir datos en tiempo real |
| Calidad del dato | `quality` | Validez y fiabilidad del valor recibido |

La **calidad** (`quality`) es un campo derivado: se calcula a partir de las otras dos dimensiones más la validez intrínseca del valor.

### 2.2 Desacoplamiento del pipeline

El estado global no depende únicamente del PLC, sino de toda la cadena:

```
PLC → Driver (Python) → MQTT Broker → Edge API → WebSocket → Frontend
```

Cada capa puede introducir fallos de forma independiente. El modelo contempla el fallo del propio gateway/driver, donde ninguna capa inferior puede reportar su estado activamente.

### 2.3 Orientación a tiempo real

- La calidad del dato está ligada a su frescura (timestamp)
- El sistema detecta activamente datos "congelados" (stale)
- `value: null` es obligatorio cuando `quality != GOOD`

---

## 3. Modelo de estados

### 3.1 `connection_status`

| Estado | Descripción |
|--------|-------------|
| `UP` | Sesión activa y estable |
| `DEGRADED` | Sesión activa pero inestable: >20% de fallos en ventana de 10 ciclos, o latencia media > `latency_warn_ms` |
| `DOWN` | Sin sesión con el dispositivo |
| `UNKNOWN` | El gateway no reporta estado — proceso caído o sin heartbeat |

### 3.2 `data_status`

| Estado | Descripción |
|--------|-------------|
| `OK` | Dato recibido y procesado en el ciclo actual |
| `TIMEOUT` | Sin respuesta dentro de `poll_timeout_ms` |
| `STALE` | Timestamp del último valor supera `stale_threshold_s` |
| `NONE` | Sin flujo de datos (estado inicial o tras desconexión) |
| `UNKNOWN` | No se puede determinar — pipeline interno caído |

### 3.3 `quality` (campo derivado)

| Estado | Descripción |
|--------|-------------|
| `GOOD` | Valor válido, fresco y fiable |
| `UNCERTAIN` | Valor posiblemente desactualizado; se puede mostrar con indicación visual |
| `BAD` | Valor no utilizable; se muestra `null` en UI |

---

## 4. Definiciones formales

### GOOD
Todas las condiciones deben cumplirse: `connection_status = UP`, `data_status = OK`, valor numéricamente válido, `now - timestamp ≤ stale_threshold_s`.

### BAD
Cualquiera de: `connection_status` en `DOWN` o `UNKNOWN`, `data_status = TIMEOUT`, valor NaN/overflow/error de protocolo, dirección de tag inválida en el PLC.

### UNCERTAIN
Sesión existente pero dato no garantizado: `data_status = STALE`, `data_status = UNKNOWN` (pipeline interno), o `connection_status = DEGRADED`.

> **Distinción clave:** `UNCERTAIN` → hay sesión, mostrar último valor en ámbar. `BAD` → no hay valor utilizable, mostrar `---`.

---

## 5. Reglas de evaluación

```python
def compute_quality(connection_status, data_status, value):
    if connection_status in ("DOWN", "UNKNOWN"):
        return "BAD"
    if data_status == "TIMEOUT":
        return "BAD"
    if value is None or is_invalid(value):
        return "BAD"
    if data_status in ("STALE", "UNKNOWN"):
        return "UNCERTAIN"
    if connection_status == "DEGRADED":
        return "UNCERTAIN"
    return "GOOD"
```

---

## 6. Escenarios operativos

| # | Escenario | `connection_status` | `data_status` | `quality` |
|---|-----------|:-------------------:|:-------------:|:---------:|
| 1 | Operación normal | `UP` | `OK` | `GOOD` |
| 2 | Sesión activa, tag sin respuesta | `UP` | `TIMEOUT` | `BAD` |
| 3 | Sesión activa, dato congelado | `UP` | `STALE` | `UNCERTAIN` |
| 4 | PLC desconectado | `DOWN` | `NONE` | `BAD` |
| 5 | Conexión inestable con datos recientes | `DEGRADED` | `OK` | `UNCERTAIN` |
| 6 | Pipeline interno caído (MQTT, broker) | `UP` | `UNKNOWN` | `UNCERTAIN` |
| 7 | Gateway/driver caído (sin heartbeat) | `UNKNOWN` | `UNKNOWN` | `BAD` |
| 8 | Dirección de tag incorrecta | `UP` | `OK`* | `BAD` |
| 9 | Primer arranque | `UP` | `NONE` | `BAD` |

---

## 7. Heartbeat del driver

Para detectar el fallo del gateway sin depender de mensajes activos:

**Topic:** `wire/{client_id}/driver/{driver_id}/heartbeat`  
**Intervalo:** cada 10 segundos  
**Timeout:** si el edge no recibe heartbeat en 30 segundos → todos los tags del driver pasan a `UNKNOWN / BAD`

---

## 8. Modelo de datos

### 8.1 Mensaje MQTT de tag

```json
{
  "tag_id": "site_a.area_1.linea_1.plc_s7.DB10_temperatura",
  "value": 85.4,
  "quality": "GOOD",
  "connection_status": "UP",
  "data_status": "OK",
  "quality_detail": null,
  "timestamp": "2025-04-16T10:23:45.123Z",
  "latency_ms": 45,
  "source": "driver_s7_01",
  "plc_id": "plc_s7_01"
}
```

### 8.2 Base de datos — Edge (SQL Server)

```sql
CREATE TABLE tag_realtime (
    tag_id             NVARCHAR(255) NOT NULL PRIMARY KEY,
    value              FLOAT         NULL,
    quality            NVARCHAR(20)  NOT NULL
                       CONSTRAINT chk_quality CHECK (quality IN ('GOOD','UNCERTAIN','BAD')),
    connection_status  NVARCHAR(20)  NOT NULL
                       CONSTRAINT chk_conn CHECK (connection_status IN ('UP','DEGRADED','DOWN','UNKNOWN')),
    data_status        NVARCHAR(20)  NOT NULL
                       CONSTRAINT chk_data CHECK (data_status IN ('OK','TIMEOUT','STALE','NONE','UNKNOWN')),
    quality_detail     NVARCHAR(MAX) NULL,
    latency_ms         INT           NULL,
    timestamp          DATETIME2     NOT NULL,
    source             NVARCHAR(50)  NOT NULL,
    plc_id             NVARCHAR(100) NULL
);

CREATE TABLE tag_history (
    id         BIGINT        IDENTITY(1,1) PRIMARY KEY,
    tag_id     NVARCHAR(255) NOT NULL,
    value      FLOAT         NOT NULL,
    timestamp  DATETIME2     NOT NULL,
    latency_ms INT           NULL,
    INDEX ix_tag_history_tag_ts (tag_id, timestamp DESC)
);

CREATE TABLE tag_quality_events (
    id             BIGINT        IDENTITY(1,1) PRIMARY KEY,
    tag_id         NVARCHAR(255) NULL,
    plc_id         NVARCHAR(100) NULL,
    source         NVARCHAR(50)  NOT NULL,
    quality_from   NVARCHAR(20)  NOT NULL,
    quality_to     NVARCHAR(20)  NOT NULL,
    conn_status    NVARCHAR(20)  NULL,
    data_status    NVARCHAR(20)  NULL,
    quality_detail NVARCHAR(MAX) NULL,
    timestamp      DATETIME2     NOT NULL,
    INDEX ix_quality_events_tag_ts (tag_id, timestamp DESC),
    INDEX ix_quality_events_plc_ts (plc_id,  timestamp DESC)
);
```

**Criterio de escritura:**
- `tag_realtime` → upsert en cada mensaje MQTT, siempre
- `tag_history` → solo cuando `quality = 'GOOD'`
- `tag_quality_events` → solo en transiciones de calidad

### 8.3 Store frontend (Zustand)

```javascript
{
  tagId:            "site_a.area_1.linea_1.plc_s7.DB10_temperatura",
  value:            85.4,       // null si quality !== 'GOOD'
  lastGoodValue:    85.4,       // se actualiza solo con mensajes GOOD
  lastGoodTs:       "2025-...",
  quality:          "GOOD",
  connectionStatus: "UP",
  dataStatus:       "OK",
  qualityDetail:    null,
  latencyMs:        45,
  timestamp:        "2025-...",
  unit:             "°C",
  label:            "Temperatura entrada"
}
```

---

## 9. Representación en UI SCADA

| `quality` | Color | Comportamiento |
|-----------|-------|----------------|
| `GOOD` | — | Valor en color normal, sin indicadores |
| `UNCERTAIN` | Ámbar | `lastGoodValue` en ámbar + badge ⚠️ + tooltip |
| `BAD` | Rojo | `---` en lugar del valor + badge ❌ + tooltip |

| `connection_status` | `data_status` | Mensaje tooltip |
|---------------------|---------------|-----------------|
| `UP` | `TIMEOUT` | El PLC no responde al tag `{tag}`. Comprueba dirección y módulo. |
| `UP` | `STALE` | Dato sin actualizar desde hace `{n}s`. Último valor: `{lastGoodValue}`. |
| `DOWN` | `NONE` | Sin sesión con `{plc_name}`. Verifica red y alimentación. |
| `DEGRADED` | `OK` | Conexión inestable con `{plc_name}` (`{fail_ratio}%` de fallos). |
| `UP` | `UNKNOWN` | Pipeline interno degradado. Comprueba broker MQTT y edge API. |
| `UNKNOWN` | `UNKNOWN` | Gateway inactivo. Todos los tags sin datos. |

---

## 10. Mapeo de errores por protocolo

### Snap7

| Categoría | Códigos | `connection_status` | `data_status` | `quality` |
|-----------|---------|:-------------------:|:-------------:|:---------:|
| Conexión | `0x03`,`0x06`,`0x07`,`0x09` | `DOWN` | `NONE` | `BAD` |
| Lectura socket | `0x0A`,`0x0B`,`0x0C`,`0x0D`,`0x0E` | `UP` | `TIMEOUT` | `BAD` |
| Ítem inválido | `0x0A`,`0x05`,`0x03` (item result) | `UP` | `OK` | `BAD` |

### Modbus TCP

| Categoría | Excepción / Código | `connection_status` | `data_status` | `quality` |
|-----------|-------------------|:-------------------:|:-------------:|:---------:|
| Sin TCP | `ConnectionException` | `DOWN` | `NONE` | `BAD` |
| Timeout frame | `ModbusIOException` | `UP` | `TIMEOUT` | `BAD` |
| Exception `0x01`–`0x04`, `0x0A`, `0x0B` | PLC devuelve error | `UP` | `OK` | `BAD` |
| Exception `0x05`, `0x06` | Ocupado / procesando | — | — | reintentar N veces |

### OPC UA

| Rango StatusCode | Categoría OPC UA | `quality` Wire |
|-----------------|-----------------|:--------------:|
| `0x0000xxxx` | Good | `GOOD` |
| `0x0000_0080` | GoodLocalOverride | `UNCERTAIN` |
| `0x4000xxxx` | Uncertain | `UNCERTAIN` |
| `0x8034_0000`, `0x8048_0000` | BadNoCommunication / BadNotConnected | `BAD` + `DOWN` |
| resto `0x8000xxxx` | Bad (dato/dispositivo) | `BAD` + `UP` |

### Comparativa entre protocolos

| Situación | Snap7 | Modbus TCP | OPC UA | `quality` |
|-----------|-------|-----------|--------|:---------:|
| Operación normal | Item `0xFF` | Sin `isError()` | `0x00000000` | `GOOD` |
| PLC no alcanzable | `0x06`, `0x07` | `ConnectionException` | `BadNoCommunication` | `BAD` |
| Sesión perdida | `0x09` | `ModbusIOException` | `BadNotConnected` | `BAD` |
| Timeout respuesta | `0x0C` | `TimeoutError` en read | `BadTimeout` | `BAD` |
| Dirección inválida | Item `0x0A`, `0x05` | Exception `0x02` | `BadNodeIdUnknown` | `BAD` |
| Dato congelado | por timestamp | por timestamp | `UncertainLastUsableValue` | `UNCERTAIN` |

---

*Documento vivo — actualizar al añadir protocolos o ajustar umbrales.*
