# Estrategia de Timestamps: UTC en almacenamiento, hora local en display

**Proyecto:** Wire SCADA Platform  
**Documento:** Estrategia de gestión de timestamps  
**Estado:** Vigente

---

## 1. Contexto

El sistema recoge lecturas de PLCs desde múltiples protocolos (Snap7, OPC UA, Modbus TCP).
Cada lectura lleva un timestamp que indica cuándo se capturó el valor.
Ese timestamp viaja desde el gateway hasta el frontend, pasando por MQTT, Redis, Django Channels y el Historian (SQL Server).

El sistema se despliega en instalaciones industriales en España (zona horaria `Europe/Madrid`,
UTC+1 en invierno / UTC+2 en verano). El operador necesita ver la hora local en pantalla.

---

## 2. Decisión

> **Almacenar siempre en UTC. Convertir a hora local solo en el momento de mostrar al usuario.**

---

## 3. Ciclo de vida del timestamp

### 3.1 Generación — Gateway

El gateway genera cada lectura con:

```python
datetime.now(timezone.utc)
```

Se serializa como ISO 8601 con sufijo `Z` antes de publicar a MQTT:

```
2026-04-20T08:00:00Z   ← UTC
```

Fichero relevante: `edge/gateway/gateway/publishers.py`

### 3.2 Almacenamiento — SQL Server (Historian)

La tabla `telemetry_history` almacena el campo `timestamp` como `DATETIME2` naive (sin zona).
El valor guardado es **UTC puro**, por convención. No se almacena ningún desplazamiento.

```
telemetry_history.timestamp = 2026-04-20 08:00:00   ← UTC naive
```

Almacenar en UTC garantiza:
- Una base de tiempo única aunque el servidor o el cliente cambien de zona horaria.
- Aritmética de intervalos sin ambigüedades (sin horas dobles por cambio de horario).
- Compatibilidad con cualquier sistema externo que consulte la tabla.

### 3.3 Consulta — Historian API

El frontend envía los límites del rango de consulta como ISO 8601 con zona explícita:

```
start: "2026-04-20T08:00:00.000Z"
stop:  "2026-04-20T10:00:00.000Z"
```

`_normalize_dt` en `edge/historian/services.py` convierte estos strings a UTC naive
antes de pasarlos al `WHERE` de SQL Server:

```
WHERE timestamp >= '2026-04-20T08:00:00' AND timestamp <= '2026-04-20T10:00:00'
```

Así la comparación es UTC vs UTC y el rango es correcto.

### 3.4 Respuesta — Historian API → Frontend

`_serialize_utc_iso` marca los `DATETIME2` naives del cursor como UTC y los devuelve
con sufijo `Z`:

```json
{ "timestamp": "2026-04-20T08:00:00Z", "value": 42.3, ... }
```

### 3.5 Display — Frontend

El frontend convierte el timestamp UTC a hora local Madrid en el momento de renderizar.
Nunca se almacena ni propaga la hora local; la conversión es solo visual.

```js
// HistorianTable.jsx
const TIMESTAMP_FORMATTER = new Intl.DateTimeFormat("es-ES", {
  timeZone: "Europe/Madrid",
  // ...
});
```

El operador ve:

```
20/04/2026 10:00:00   ← Europe/Madrid (UTC+2 en abril)
```

### 3.6 Rango de consulta — Entrada del usuario

El usuario introduce fechas en hora local a través de `<input type="datetime-local">`.
Antes de enviar la query, el frontend convierte esos valores a UTC:

```js
new Date("2026-04-20T10:00").toISOString()
// → "2026-04-20T08:00:00.000Z"
```

Ficheros relevantes:
- `frontend/src/modules/historian/widgets/timePresets.js` — función `resolveTimeRange`
- `frontend/src/modules/historian/pages/HistorianPage.jsx` — call site de `queryHistorian`

---

## 4. Diagrama del flujo

```
PLC (hora local)
      │
      ▼
Gateway  →  datetime.now(timezone.utc)  →  "2026-04-20T08:00:00Z"
      │
      ▼
MQTT / Redis  (string UTC con Z)
      │
      ▼
SQL Server  →  DATETIME2 naive UTC  →  2026-04-20 08:00:00
      │
      ▼
Historian API  →  _serialize_utc_iso  →  "2026-04-20T08:00:00Z"
      │
      ▼
Frontend  →  Intl.DateTimeFormat(timeZone: "Europe/Madrid")  →  "20/04/2026 10:00:00"
```

---

## 5. Configuración de zona horaria en los servicios

| Servicio | Configuración | Propósito |
|---|---|---|
| Contenedores Docker | `TZ=Europe/Madrid` (`.env`) | Sistema operativo en hora local |
| Django API (`django-api`) | `TIME_ZONE = os.getenv('TZ', 'Europe/Madrid')` + `USE_TZ = True` | Django convierte fechas ORM a UTC; `TIME_ZONE` define la zona "local" |
| Edge core backend | `TIME_ZONE = os.getenv('TZ', 'Europe/Madrid')` | Idem para el backend de edge |
| Gateway | Usa siempre `timezone.utc` explícito | Independiente de la zona del sistema |
| Frontend | `timeZone: "Europe/Madrid"` en todos los formatters | Conversión visual UTC → Madrid |

---

## 6. Consecuencias y limitaciones

**Positivo:**
- El operador siempre ve hora local correcta, incluyendo el cambio horario verano/invierno.
- Los datos históricos son comparables entre instalaciones en zonas diferentes.
- La aritmética de intervalos (duración de alarmas, agregados) es exacta.

**A tener en cuenta:**
- Si se despliega en una instalación fuera de España hay que cambiar `TZ` en `.env`
  y `timeZone` en los formatters del frontend.
- Los registros legados en SQL Server (anteriores a esta decisión) pueden estar en
  hora local naive. `_serialize_utc_iso` los marcará como UTC incorrectamente —
  migrarlos requiere aplicar el offset correspondiente al periodo en que se grabaron.
