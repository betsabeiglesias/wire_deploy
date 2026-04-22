# Edge Telemetry Database — Architecture

**Database:** `textil` (SQL Server, per-client edge deployment)  
**Recovery model:** `SIMPLE` — log truncates on checkpoint, no point-in-time recovery needed.  
**Location:** `docs/architecture/edge_telemetry_db.md`

---

## Overview

The edge database stores industrial process data collected from PLCs via protocol drivers (S7, OPC UA, Modbus). Data arrives through MQTT and is persisted by the `writer` service. The database is **not** in the real-time data path — live values are served via MQTT → Redis → WebSocket. The database serves historical queries only, through the Historian FastAPI service (port 8010).

```
PLC → Driver → MQTT → writer.py → SQL Server (textil)
                                         ↑
                              Historian FastAPI (read-only)
                                         ↑
                                   React frontend
```

---

## Tables

### `mqtt_raw_messages`

Immutable audit log of every MQTT message received, regardless of whether it was parsed correctly.

| Column | Type | Description |
|---|---|---|
| `id` | `BIGINT IDENTITY` | Surrogate PK, clustered |
| `received_at` | `DATETIME2(3)` | UTC timestamp of arrival, default `SYSUTCDATETIME()` |
| `topic` | `VARCHAR(500)` | Full MQTT topic |
| `payload` | `VARCHAR(4000)` | Raw JSON payload — capped at 4000 to stay in-page (no LOB storage) |
| `client` | `VARCHAR(50)` | Writer instance ID (`WRITER_ID` env var) |

**Indexes:**
- `PK_mqtt_raw` — clustered on `id` (write-optimized, sequential inserts)
- `idx_mqtt_raw_time` — non-clustered on `received_at DESC` (replay/debug queries)

**Invariants:**
- Written **always**, before any parsing — even malformed messages are recorded.
- Append-only. Never updated or deleted in normal operation.
- Candidate for periodic purge (7–30 days retention). Not an analytical source of truth.

---

### `parse_errors`

Records parsing and validation failures. Allows operational monitoring of data quality issues without scanning `mqtt_raw_messages`.

| Column | Type | Description |
|---|---|---|
| `id` | `BIGINT IDENTITY` | Surrogate PK |
| `raw_id` | `BIGINT` | Logical FK to `mqtt_raw_messages.id` (no constraint — performance) |
| `received_at` | `DATETIME2(3)` | UTC timestamp, default `SYSUTCDATETIME()` |
| `topic` | `VARCHAR(500)` | MQTT topic of the failed message |
| `error_code` | `VARCHAR(50)` | Failure category (see below) |
| `detail` | `VARCHAR(500)` | Optional detail (e.g. raw datatype value, tag path) |

**Known error codes:**

| Code | Meaning |
|---|---|
| `invalid_json` | Payload could not be parsed as JSON |
| `missing_identifiers` | `equipment_id` or `variable` absent from payload and topic |
| `invalid_identifiers` | Identifiers present but empty after resolution |
| `unsupported_datatype` | `datatype` field not in known set |
| `no_valid_value` | Value could not be cast to the declared datatype |

**Indexes:**
- `idx_parse_errors_time` — non-clustered on `received_at DESC`

**Invariants:**
- Written only on failure, referencing the corresponding `raw_id`.
- Append-only.

---

### `telemetry_history`

Time-series store of all valid process values. Source of truth for historical queries.

| Column | Type | Description |
|---|---|---|
| `timestamp` | `DATETIME2(3)` | UTC timestamp from the driver (not arrival time) |
| `equipment_id` | `VARCHAR(100)` | ISA-95 equipment path (e.g. `site/area/work_center/equipment`) |
| `variable` | `VARCHAR(100)` | Tag name within the equipment |
| `value_float` | `FLOAT` | Value if datatype is `float` or `double` |
| `value_int` | `BIGINT` | Value if datatype is `int`, `int16`, `int32`, `uint16`, `uint32` |
| `value_string` | `NVARCHAR(255)` | Value if datatype is `string` or `char` |
| `value_bool` | `BIT` | Value if datatype is `bool` or `boolean` |
| `datatype` | `VARCHAR(20)` | Normalized datatype: `float`, `int`, `bool`, `string` |
| `unit` | `VARCHAR(20)` | Engineering unit (e.g. `°C`, `bar`, `rpm`) |
| `quality` | `VARCHAR(10)` | OPC-style quality: `GOOD`, `BAD`, `UNCERTAIN`. Default `GOOD` |

**Indexes:**
- `PK_telemetry` — **clustered** on `(equipment_id, variable, timestamp)` with `FILLFACTOR=90`. Optimizes range queries by tag over time, which is the dominant access pattern.
- `idx_telemetry_time` — non-clustered on `timestamp DESC` with `FILLFACTOR=90`. Supports global time-range sweeps (alerts, cross-tag queries).

**Invariants:**
- Written only for validated messages. Never updated.
- PK guarantees no duplicate reading for the same tag at the same instant — duplicate timestamps are silently discarded by the writer.
- Typed value model: exactly one of `value_float`, `value_int`, `value_string`, `value_bool` is non-null per row. Validation is the writer's responsibility, not enforced by a DB constraint.
- Candidate for partitioning by month when row count exceeds ~500M.

---

## Write flow

```
MQTT message received
        │
        ▼
INSERT mqtt_raw_messages          ← always, unconditionally
        │
        ├── parse / validation fails
        │           │
        │           ▼
        │    INSERT parse_errors   ← references raw_id → commit → return
        │
        └── parse / validation OK
                    │
                    ▼
          INSERT telemetry_history
                    │
                    ▼
               single commit       ← only on happy path completion
```

---

## What this database does NOT do

- **Real-time current values** — served by Redis, not SQL Server.
- **ETL batch state** — the writer is streaming, not batch. No `etl_state` or `etl_metrics` tables.
- **Cross-client data** — each client has its own isolated database instance. This database contains data for one client only.

---

## Estimated volume

| Metric | Value |
|---|---|
| Tags | ~150 |
| Ingestion rate | 1 message/tag/second |
| Rows/day | ~13M |
| Rows/month | ~400M |
| Partition threshold | ~500M rows |

---

## Init script

Located at: `customers/clienteA/sqlserver/init.sql`

```sql
CREATE DATABASE textil;
GO

ALTER DATABASE textil SET RECOVERY SIMPLE;
GO

USE textil;
GO

CREATE TABLE mqtt_raw_messages (
    id          BIGINT IDENTITY(1,1) NOT NULL,
    received_at DATETIME2(3)         NOT NULL DEFAULT SYSUTCDATETIME(),
    topic       VARCHAR(500)         NOT NULL,
    payload     VARCHAR(4000)        NOT NULL,
    client      VARCHAR(50)          NULL,
    CONSTRAINT PK_mqtt_raw PRIMARY KEY CLUSTERED (id)
);
CREATE INDEX idx_mqtt_raw_time ON mqtt_raw_messages (received_at DESC);
GO

CREATE TABLE parse_errors (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    raw_id      BIGINT               NOT NULL,
    received_at DATETIME2(3)         NOT NULL DEFAULT SYSUTCDATETIME(),
    topic       VARCHAR(500)         NOT NULL,
    error_code  VARCHAR(50)          NOT NULL,
    detail      VARCHAR(500)         NULL
);
CREATE INDEX idx_parse_errors_time ON parse_errors (received_at DESC);
GO

CREATE TABLE telemetry_history (
    [timestamp]     DATETIME2(3)    NOT NULL,
    equipment_id    VARCHAR(100)    NOT NULL,
    variable        VARCHAR(100)    NOT NULL,
    value_float     FLOAT           NULL,
    value_int       BIGINT          NULL,
    value_string    NVARCHAR(255)   NULL,
    value_bool      BIT             NULL,
    datatype        VARCHAR(20)     NOT NULL,
    unit            VARCHAR(20)     NULL,
    quality         VARCHAR(10)     NOT NULL DEFAULT 'GOOD',
    CONSTRAINT PK_telemetry
        PRIMARY KEY CLUSTERED (equipment_id, variable, [timestamp])
        WITH (FILLFACTOR = 90)
);
CREATE INDEX idx_telemetry_time
ON telemetry_history ([timestamp] DESC)
WITH (FILLFACTOR = 90);
GO
```
