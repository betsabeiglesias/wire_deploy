# Arquitectura Realtime: MQTT -> Redis -> WebSocket

**Proyecto:** Wire SCADA Platform  
**Documento:** Arquitectura de flujo realtime  
**Estado:** Vigente

---

## 1. Objetivo

Documentar el flujo real de datos de proceso desde que salen del gateway hasta que llegan al frontend.

Este documento refleja el estado actual del proyecto:

- El sistema se despliega por instalación o cliente.
- Ya no se trata como una plataforma multitenant compartida.
- En el código todavía existen nombres heredados como `tenant` y `client_id`.

En este documento, esos nombres deben entenderse como:

- `tenant`: identificador lógico del despliegue actual
- `client_id`: identificador del cliente asociado al usuario autenticado

No implican una arquitectura SaaS multicliente activa dentro del mismo runtime.

---

## 2. Servicios implicados

### Edge

- `edge/gateway`
  Lee PLCs y publica valores por MQTT.

- `edge/core_backend/mqtt_bridge`
  Consume MQTT, valida/normaliza el dato y lo escribe en Redis local.

- `edge/core_backend/realtime/redis_bridge`
  Replica el stream desde Redis local hacia Redis central.

### Central

- `django-api`
  Expone API REST, emite token corto para realtime y valida autenticación.

- `django-ws`
  Expone el WebSocket ASGI con Django Channels.

- `modules.scada_manager.realtime.redis_stream_consumer`
  Lee streams desde Redis central y hace fan-out hacia grupos de Channels.

### Frontend

- `frontend/src/hooks/useRealtimeData.js`
  Pide token, abre WebSocket y actualiza el estado en memoria con los eventos recibidos.

---

## 3. Flujo extremo a extremo

```text
PLC
 -> Gateway
 -> MQTT Broker
 -> mqtt_bridge (edge/core_backend)
 -> Redis local
 -> redis_bridge
 -> Redis central
 -> redis_stream_consumer (django-api)
 -> Channels group realtime.{client_id}
 -> WebSocket /ws/realtime/
 -> frontend useRealtimeData
 -> UI SCADA
```

---

## 4. Paso a paso

### 4.1 Gateway -> MQTT

El gateway publica mensajes `v1.tag` por MQTT.

Características principales:

- El topic empieza por el identificador lógico del despliegue.
- El payload contiene `equipment_id`, `variable`, `datatype`, `value`, `quality` y `timestamp`.

Referencia principal:

- `edge/gateway/gateway/publishers.py`

### 4.2 MQTT -> ProcessValue

`MQTTEventBridge` consume los topics del despliegue configurado y:

1. decodifica el JSON
2. valida que `schema == "v1.tag"`
3. crea un `ProcessValue`

`ProcessValue` es el modelo canónico interno del dato.

Responsabilidades:

- normalizar timestamps
- normalizar `quality`
- validar coherencia entre `datatype` y `value`
- generar el evento interno `v1.process_value`

Referencias:

- `edge/core_backend/mqtt_bridge/bridge.py`
- `edge/core_backend/gateway_domain/process_value.py`

### 4.3 ProcessValue -> Redis local

Cuando el valor es válido, `mqtt_bridge` escribe dos estructuras en Redis local:

- `scada:stream:{tenant}`
  Stream de eventos realtime

- `scada:last:{tenant}:{equipment_id}:{variable}`
  Último valor conocido por tag

Esto separa dos usos:

- stream para consumo secuencial en tiempo real
- clave `last` para consulta rápida del último estado

### 4.4 Redis local -> Redis central

La ruta operativa recomendada es:

```text
Redis local -> redis_bridge -> Redis central
```

`redis_bridge` hace:

- `XREAD` sobre `scada:stream:{tenant}` en el edge
- `XADD` sobre `scada:stream:{tenant}` en el Redis central

Nota importante:

- `mqtt_bridge` también puede replicar directamente a Redis central si se activa `ENABLE_DIRECT_CENTRAL_REDIS_REPLICATION=true`
- en el despliegue de `customers/clienteA` esa replicación directa se ha desactivado para evitar duplicados

### 4.5 Redis central -> Channels

El proceso central `redis_stream_consumer`:

1. descubre claves `scada:stream:*`
2. hace `XREAD`
3. parsea el campo `event`
4. normaliza el contrato realtime
5. envía el evento a `realtime.{tenant}` mediante `channel_layer.group_send`

Normalización actual:

- garantiza `timestamp`
- mantiene `ts` por compatibilidad
- añade `tenant` al evento si no viene informado

Referencia:

- `django-api/modules/scada_manager/realtime/redis_stream_consumer.py`

### 4.6 WebSocket central

El frontend no usa el WebSocket de `edge/core_backend/ws_app`.

El canal activo está en:

- `django-api/modules/scada_manager/realtime/consumers.py`

Funcionamiento:

1. el frontend pide un token corto en `/api/scada/realtime/token/`
2. abre `ws://.../ws/realtime/?token=...`
3. el middleware valida el JWT
4. el consumer toma `auth.client_id`
5. el socket se une al grupo `realtime.{client_id}`
6. cada evento del grupo se reenvía al navegador

Conclusión:

- el `edge/core_backend/ws_app` no forma parte del camino realtime activo del frontend

### 4.7 Frontend

`useRealtimeData`:

- pide el token realtime
- abre el WebSocket
- recibe mensajes JSON
- los indexa por `equipment_id + variable`
- mantiene `allTags`, `tagsMap`, estado de conexión y detección de datos congelados

Referencia:

- `frontend/src/hooks/useRealtimeData.js`

---

## 5. Contrato de evento realtime

Formato esperado a la salida del consumidor central:

```json
{
  "schema": "v1.process_value",
  "tenant": "customerA",
  "equipment_id": "site/area/line/cell/equipment",
  "variable": "temperature",
  "value": 23.5,
  "datatype": "Float",
  "unit": "C",
  "quality": "GOOD",
  "timestamp": "2026-04-17T10:15:30Z",
  "ts": "2026-04-17T10:15:30Z",
  "source": {}
}
```

Notas:

- `timestamp` es el campo que debe consumir el frontend
- `ts` se mantiene por compatibilidad hacia atrás
- `tenant` sigue presente por herencia del modelo anterior, aunque en la práctica identifica el despliegue actual

---

## 6. Decisiones vigentes

### Ruta oficial de realtime

La ruta recomendada y documentada es:

```text
MQTT -> Redis local -> redis_bridge -> Redis central -> Channels -> WebSocket -> Frontend
```

### Replicación directa desde mqtt_bridge

Debe considerarse opcional y desactivada cuando exista `redis_bridge`, para evitar:

- duplicación de eventos en Redis central
- comportamiento difícil de depurar
- inconsistencias en volumen o frecuencia de eventos

### Estado del modelo de cliente

Aunque el código sigue usando `tenant` y `client_id`, el proyecto debe entenderse hoy como:

- un despliegue por cliente
- un espacio de datos por instalación
- aislamiento por despliegue, no por multitenancy compartida en una sola instancia lógica

---

## 7. Ambigüedades heredadas

Las principales fuentes de confusión actuales son:

- documentación antigua que todavía habla de multitenancy
- nombres de variables heredados (`tenant`, `client_id`)
- existencia de un WebSocket en `edge/core_backend/ws_app` que no es el canal activo del frontend
- posibilidad técnica de replicar a Redis central por dos caminos distintos

Estas ambigüedades no significan que el sistema siga siendo multitenant a nivel de producto.
Significan que aún quedan nombres y piezas heredadas del diseño anterior.

---

## 8. Recomendaciones de mantenimiento

- Mantener `timestamp` como campo canónico de salida hacia frontend.
- Tratar `ts` como compatibilidad temporal.
- Mantener una única ruta de replicación a Redis central por despliegue.
- Marcar `edge/core_backend/ws_app` como legado o retirarlo si ya no se usa.
- Sustituir gradualmente en documentación el lenguaje “multitenant” por “despliegue por cliente” o “instalación”.

---

## 9. Archivos clave

- `edge/gateway/gateway/publishers.py`
- `edge/core_backend/gateway_domain/process_value.py`
- `edge/core_backend/mqtt_bridge/bridge.py`
- `edge/core_backend/mqtt_bridge/run.py`
- `edge/core_backend/realtime/redis_bridge.py`
- `django-api/modules/scada_manager/realtime/views.py`
- `django-api/modules/scada_manager/realtime/middleware.py`
- `django-api/modules/scada_manager/realtime/consumers.py`
- `django-api/modules/scada_manager/realtime/redis_stream_consumer.py`
- `frontend/src/hooks/useRealtimeData.js`
